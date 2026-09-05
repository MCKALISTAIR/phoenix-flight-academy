# Cleanup after the marketing removal + payments decision

## What I found

**Recent changes look clean.** The marketing pages are fully removed, the app builds, and the Phoenix site, booking flow, account/tier flow and CMS are all intact. No leftover marketing routes or links.

Three things do need attention:

1. **Two leftover payment files fail their type check.** `create-checkout` and `stripe-webhook` (the older-style backend files under `supabase/functions/`) both fail to compile. They are also the wrong shape for this project — this app's backend logic lives with the app, not in those separate files — and nothing can actually call them because no Stripe key has ever been added.
2. **The payment path is half-mock, half-real.** Checkout first tries the broken Stripe path, silently fails, then falls back to the mock "mark as paid" screen. That works for demos but hides real errors and is confusing.
3. **Small content leftover.** The CMS Analytics page still shows sample rows mentioning "marketing" pages that no longer exist.

## Where payments actually stand

Nothing can take real money today. The booking flow is complete end to end (price, deposit vs full, approval rules, confirmation), but the money step is simulated.

**The right provider for Phoenix is built-in Stripe.** Phoenix sells flight experiences and lessons from the UK — a digital/service sale. Stripe is the best fit because:
- It can handle tax calculation, collection, fraud protection, disputes and transaction-level support for buyers in ~80 countries.
- It does not need you to create or connect a separate Stripe account.
- Paddle is not ideal here because human-delivered services with scheduling/approval don't fit its all-inclusive digital-product model.
- Shopify is overkill because there is no physical inventory or shipping.

When you and the client decide to go live, the switch is: replace the mock checkout screen with a real Stripe checkout session and add a webhook route to confirm payments. The booking contract (`payment_status` / `status` transitions) stays identical.

## Proposed fixes

1. Delete the two broken leftover payment files and the small helper that calls them, so the type check passes and there is one clear payment path.
2. Keep the mock checkout as the single payment route for now, and make failures visible instead of silently falling back.
3. Clean the placeholder "marketing" rows out of the CMS Analytics page.
4. Give `/account` and a couple of other pages a proper description for search and link previews (a few pages only have a title).

## Not in this plan (say the word and I'll do it)

- Turning on real payments with Lovable's built-in Stripe, then replacing the mock screen with a real checkout and payment confirmation.
- Per-school routing so a second flight school can use the platform (the org data model is already in place, the routing is not).

## Technical notes

- Remove `supabase/functions/create-checkout/`, `supabase/functions/stripe-webhook/`, and `src/lib/stripe-payments.functions.ts`; drop `initiateStripeCheckout` from `src/routes/booking/checkout.$id.tsx` and `verifyStripeSession` from `src/routes/booking/confirm.$id.tsx`, leaving `mock-payments.functions.ts` as the only provider.
- When payments are enabled later, the replacement is a `createServerFn` checkout initiator plus a webhook route under `src/routes/api/public/`; the booking contract (`payment_status` / `status` transitions) stays identical.
- Analytics page cleanup is limited to the hardcoded sample data in `src/routes/cms/analytics.tsx`.
