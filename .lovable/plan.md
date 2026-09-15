# Database go-live review

I checked the live database itself — security rules, missing columns, indexes, constraints, the scheduled job and the test data. The core structure is sound (booking rules, double-booking protection, org scoping, timestamps and triggers all in place). Below are the real gaps, in the order I'd fix them.

## Must fix before going live

**1. The enquiries inbox is reading columns that don't exist.**
The contact form saves name, email, company, message and date — but the inbox code tries to read and write a status, notes and "last updated" that were never added to the table. So marking an enquiry as contacted or archived fails, and the "new enquiries" figure on the console front page is unreliable. Fix: add those three fields to the enquiries table.

**2. Only the super admin can see enquiries.**
Ordinary admins (the day-to-day Phoenix staff) can't open the inbox at all, and nobody is allowed to update an enquiry. Fix: let admins read and update enquiries; keep them un-deletable.

**3. Everyone signed in can see everyone's profile, including phone numbers.**
Any customer with an account can read the full list of names, phone numbers and avatars. Fix: customers see only their own profile; staff see all.

**4. Unpublished website drafts are publicly readable.**
The website content table is world-readable, and it also holds the unsaved draft copy. Anyone can read content the owner hasn't published yet. Fix: expose only published content publicly, keep drafts staff-only.

**5. No payment record trail.**
Payments taken in person (card machine, cash, bank transfer) and refunds are stored as a line of free text in the booking's notes. There's no record of method, who took it, or when — which makes end-of-day reconciliation and any dispute impossible to answer. Fix: add a proper payments table (booking, amount, method, taken by, date, reference, refund flag) and write to it from the existing record-payment and refund actions.

**6. Nothing stops the same online payment being counted twice.**
The payment session and transaction references on a booking aren't unique, so a repeated notification from the payment provider could add the money twice. Fix: make those references unique.

**7. Live site still holds test data.**
45 cancelled test bookings and the two test sign-in accounts. Fix: clear the test bookings and test accounts, and remove the test-login buttons from the sign-in page, so Phoenix starts clean.

## Worth doing at the same time

- **Speed**: several lookups have no index (booking to product, logbook to aircraft, org membership). Small now, noticeable once there's a year of bookings.
- **A pilot who's had approval withdrawn can't be re-approved** — the table only allows one approval record per person ever. Fix the rule so history is kept.
- **Anyone signed in can create a new organisation.** Harmless today (single school) but should be closed off.
- **The overnight tidy-up job** that cancels unpaid bookings runs hourly and correctly skips invoice-only lessons — verified working, no change needed.

## Not database problems, but still blocking launch

- Payments are in test mode; going live is a separate provider step.
- Email sending needs a Phoenix sending address before receipts or team alerts leave the system.

## Technical notes

- `contact_submissions` lacks `status`, `notes`, `updated_at`; `src/lib/enquiries.functions.ts` (lines ~105-140) and `src/lib/dashboard.functions.ts` (`status.eq.new`) depend on them. Add columns + `updated_at` trigger, default `status = 'new'`.
- `contact_submissions` policies: SELECT is `has_role(..,'super_admin')` only, no UPDATE policy. Add admin SELECT/UPDATE.
- `profiles` policy "Authenticated users can view profiles" is `USING (true)` — replace with `user_id = auth.uid() OR has_role(admin/super_admin) OR is_org_member`.
- `site_content` policy "Anyone can view site content" is `USING (true)` and the table carries `draft_data`. Restrict anon reads to a published-only view/column set, or drop the public policy and serve content through a server function.
- New `booking_payments` table: `booking_id`, `amount_cents`, `method` (enum: card_online, card_terminal, cash, bacs, voucher), `direction` (payment/refund), `recorded_by`, `reference`, `notes`, timestamps; GRANTs for `authenticated` + `service_role`, staff-only RLS. Wire `recordManualPayment` / `recordRefund` in `src/lib/bookings.functions.ts` to insert rows and keep `amount_paid_cents` as the derived total.
- Unique partial indexes on `bookings.stripe_session_id` and `bookings.stripe_payment_intent_id` where not null.
- Missing FK indexes: `bookings.product_id`, `flight_log_entries.aircraft_id`, `organization_members(user_id, invited_by)`, `organization_invites(organization_id, invited_by)`.
- `self_hire_approvals_user_id_key` UNIQUE(user_id) blocks re-approval after revoke — replace with a unique partial index on `user_id WHERE revoked_at IS NULL`.
- `organizations` INSERT policy is `auth.uid() IS NOT NULL` — tighten to super_admin.
- Table grants are broad (`anon` holds INSERT on every public table); RLS is the only guard. Left as-is since PostgREST needs the grants, but noted: any policy mistake is immediately exploitable.
- Remaining 7 linter warnings are the intentional `SECURITY DEFINER` role helpers.
- Data cleanup: delete the 45 test bookings, `e2e-admin@test.lovable.dev` / `e2e-user@test.lovable.dev`, and the test-login buttons in `src/routes/login.tsx`.
