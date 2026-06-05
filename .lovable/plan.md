## What we're building

One booking engine for all three Phoenix products, with prices derived from the aircraft + product, payments configurable per product type, and a mixed approval flow.

```text
Public visitor  ─► /booking/experience   (auto-confirm, full payment)
Logged-in student ─► /booking/lesson     (staff approval, invoice/no card)
Approved pilot ─► /booking/self-hire     (staff approval, deposit)
                          │
                          ▼
                Shared calendar + slot picker
                          │
                          ▼
              Stripe Checkout (when applicable)
                          │
                          ▼
             CMS → Bookings (approve / cancel / refund)
```

## Data model (new tables)

- `booking_products` — what's bookable. Fields: `slug`, `kind` (experience | lesson | self_hire), `name`, `duration_minutes`, `instructor_fee_per_hour` (nullable), `package_price` (nullable, for fixed experiences), `requires_approval`, `payment_mode` (full | deposit | invoice), `deposit_pct`, `cancellation_hours`, `min_notice_hours`, `max_advance_days`, `published`.
- `booking_calendar_settings` — single row. Fields: `open_time`, `close_time`, `slot_minutes`, `buffer_minutes`, `weekday_mask`.
- `booking_closed_dates` — date ranges where the airfield is shut (weather, holidays).
- `booking_resource_blocks` — per-aircraft and per-instructor unavailable windows (maintenance, leave).
- `bookings` — one row per booking. Fields: `product_id`, `aircraft_id`, `instructor_id`, `user_id` (nullable for guest experience checkouts), `customer_email`, `customer_name`, `customer_phone`, `start_at`, `end_at`, `status` (pending | confirmed | cancelled | completed | no_show), `payment_status` (unpaid | deposit_paid | paid | refunded), `price_total_cents`, `amount_paid_cents`, `stripe_session_id`, `stripe_payment_intent_id`, `notes`.
- `self_hire_approvals` — gates which users can book self-hire. Fields: `user_id`, `approved_by`, `approved_at`, `expires_at`.

All tables: GRANTs + RLS. Public can SELECT published products / calendar settings / closed dates. Staff (instructor/admin/super_admin) manage bookings. Users see their own bookings.

## Pricing rules (server-side, never trust client)

- Experience flight → `booking_products.package_price` (fixed).
- Lesson → `aircraft.rate_wet × (duration / 60) + instructor_fee_per_hour × (duration / 60)`.
- Self-hire → `aircraft.rate_wet × (duration / 60)`.

Always recomputed in a `createServerFn` at checkout time using current DB values.

## Availability engine

Single server fn `getAvailableSlots({ productId, aircraftId?, instructorId?, dateRange })`:
1. Expand calendar settings into candidate slots for the date range.
2. Subtract `booking_closed_dates`.
3. Subtract `booking_resource_blocks` for the chosen aircraft / instructor.
4. Subtract existing `bookings` where status ∈ (pending, confirmed) overlapping the slot for that aircraft/instructor.
5. Apply `min_notice_hours` and `max_advance_days`.

Returns a list of `{ start, end, available }`.

## Booking flow

Public `/booking` lands on a product picker (Experience / Lesson / Self-hire), then:

1. **Pick date + slot** (month calendar + day slot list).
2. **Pick aircraft** (filter to ones serviceable + suitable for product).
3. **Pick instructor** (lessons/experiences only; auto-pick if none chosen for self-hire).
4. **Customer details** (or use logged-in profile).
5. **Confirm + pay**:
   - `payment_mode = full` → Stripe Checkout, full amount, on success → status `confirmed`.
   - `payment_mode = deposit` → Stripe Checkout for deposit, on success → status `pending` (awaiting staff approval) or `confirmed` if `requires_approval=false`.
   - `payment_mode = invoice` → no Stripe, status `pending`, staff approves later.

Guards:
- Lesson booking requires sign-in + an active `students` row.
- Self-hire booking requires sign-in + active `self_hire_approvals` row.
- Experience booking is fully public.

## Payments

Use Lovable's built-in Stripe payments (`enable_stripe_payments` — seamless, no API key). Webhook updates `bookings.payment_status` and `amount_paid_cents` and (when `requires_approval=false` and payment is full) sets `status=confirmed`. We'll set this up after the schema lands.

## CMS surfaces (super-admin)

New section under `/cms`:

- **Bookings** — list/filter, approve pending, cancel + refund, mark no-show/completed.
- **Booking Products** — CRUD `booking_products` (kind, price/fees, payment mode, deposit %, approval toggle, cancellation window).
- **Calendar Settings** — opening hours, slot length, buffer, weekday mask.
- **Closed Dates** — calendar picker to add/remove blackout ranges.
- **Resource Blocks** — block windows per aircraft / per instructor.
- **Self-hire Approvals** — approve/revoke pilots.

The existing `/booking/admin` Ops view stays as the day-of-flying schedule board, fed by the same `bookings` table.

## Routes

```text
src/routes/booking.tsx                       (existing layout — keep)
src/routes/booking/index.tsx                 product picker (NEW)
src/routes/booking/$kind.tsx                 booking flow per kind (NEW)
src/routes/booking/confirm.$id.tsx           success/receipt (NEW)
src/routes/booking/dashboard.tsx             (existing — show user's own bookings)
src/routes/booking/admin.tsx                 (existing — wire to bookings table)
src/routes/cms/bookings.tsx                  list + approve/cancel (NEW)
src/routes/cms/booking-products.tsx          CRUD (NEW)
src/routes/cms/calendar-settings.tsx         (NEW)
src/routes/cms/self-hire-approvals.tsx       (NEW)
src/routes/api/public/stripe-webhook.ts      webhook handler (NEW)
```

## Server functions (`src/lib/`)

- `booking-products.functions.ts` — list/get/upsert.
- `booking-calendar.functions.ts` — settings, closed dates, blocks, `getAvailableSlots`.
- `bookings.functions.ts` — create (with price recompute + Stripe session), list-mine, list-all (staff), approve, cancel, refund.
- `self-hire.functions.ts` — check approval, request approval, approve/revoke.

## Build order (each step ships before the next)

1. **DB migration** — all tables + GRANTs + RLS + seed default calendar settings and one product per kind.
2. **Enable Stripe payments** (call `enable_stripe_payments`, then add three products in Stripe).
3. **Availability engine + booking flow UI** (no payment yet — uses invoice mode end-to-end).
4. **Stripe checkout + webhook** wired for `full` and `deposit` modes.
5. **CMS screens** — Bookings list, Products CRUD, Calendar Settings, Closed Dates, Resource Blocks, Self-hire Approvals.
6. **User dashboard** — list "my bookings", cancel within window.

## Open questions / assumptions I'll make unless you say otherwise

- Cancellation refunds are manual from the CMS (staff click "refund"), not automatic on user cancel — safer for a flight school.
- Guest experience bookings create an auth user on payment success (passwordless magic link) so they can see/manage the booking. Alternative: pure email-only with a one-time view link.
- Time zone: Europe/London for everything (Cumbernauld).
- Self-hire blocks rounded up to the nearest 15 min for billing; minimum 1 h block.

Reply "go" and I'll start with Step 1 (the migration). If you want changes — e.g. auto-refunds, no guest checkout, different time zone — tell me now and I'll fold them in before the schema lands.