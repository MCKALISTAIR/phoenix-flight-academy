# Turn on real payments with built-in Stripe

## Where we stand

- Checkout is 100% mock: `/booking/checkout/$id` shows test-mode paid/failed buttons that call `completeMockPayment`. No real money can move.
- The booking contract is already live-payment-ready: deposit vs full amounts, `payment_status` (unpaid → deposit_paid/paid), and `status` (pending/confirmed with approval rules) all transition correctly. Nothing on the booking side changes.

## Recommendation: Lovable's built-in Stripe

Phoenix sells flight experiences and lessons from the UK — a service sale. Built-in Stripe fits best (no separate Stripe account to create or connect, no keys to manage):

- A **test environment** is created immediately so we can test with fake cards, no real money.
- Accepting **live** payments requires claiming the account (business details) later.
- **Tax handling default**: tax calculation and collection only (`automatic_tax`, +0.5% per transaction) — Stripe calculates and collects VAT at checkout; the school handles registration, filing and remittance. Flight training is a scheduled human-delivered service, so full compliance handling (merchant-of-record) isn't eligible.
- Base card fees ~2.9% + 30p (domestic UK); nothing else changes per transaction.

## Build steps

1. **Enable built-in Stripe payments** on this project (form approval from you).
2. **Create products in Stripe** — one per bookable type (experience flights, lessons, self-hire) with the appropriate tax code on each.
3. **Replace the mock checkout screen**:
   - New `createServerFn` checkout initiator in `src/lib/` that creates a real Stripe checkout session for the booking's amount due (deposit or full), in GBP, and redirects to Stripe's hosted checkout.
   - New webhook route at `src/routes/api/public/stripe-webhook.ts` that verifies the Stripe signature and applies the exact same status transitions the mock uses today (`deposit_paid`/`paid`, `pending`/`confirmed`, `approved_at`).
   - `/booking/checkout/$id` becomes a redirect into Stripe; `/booking/confirm/$id` reads the session result.
4. **Keep mock payments available in CMS** — the `/cms/mock-payments` dev screen stays for admin testing, but the customer-facing mock buttons on checkout go away.
5. **End-to-end test** with Stripe test cards: deposit booking, full booking, approval-required booking, and a failed payment.

## Not in this plan

- Claiming the live Stripe account / taking real money (needs the client's business details).
- Refund/cancellation payments UI (can follow once live).

## Technical notes

- Remove `completeMockPayment` usage from `src/routes/booking/checkout.$id.tsx`; keep `src/lib/mock-payments.functions.ts` for the CMS dev screen.
- Webhook must read the raw body and verify `stripe-signature` before any writes; uses `supabaseAdmin` like the mock handler does today.
