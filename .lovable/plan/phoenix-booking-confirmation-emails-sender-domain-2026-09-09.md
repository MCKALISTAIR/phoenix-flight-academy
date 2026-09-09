# Phoenix booking confirmation emails — sender domain

## Problem
The only verified sender domain in this workspace is flyskyline.app, which belongs to a different business (Skyline). Phoenix Flight Training must not send customer emails from a Skyline address.

## What we need from you
A domain you own for Phoenix (e.g. flyphoenix.co.uk, or a subdomain like mail.yourdomain.com). The email setup will ask you to add a few DNS records at your domain registrar to verify it — this is what makes receipts land in inboxes instead of spam.

## Plan
1. Run the email setup against your Phoenix domain (I'll open the setup card; you enter the domain and add the DNS records it shows).
2. Scaffold the transactional email templates:
   - **Customer confirmation + receipt** — booking reference, date/time, aircraft, amount paid (full or deposit), deposit balance note ("remainder due at dispatch"), Cumbernauld EGPG location.
   - **Team notification** — internal alert to ops with customer name, product, slot, and payment status.
3. Wire both into the existing payment webhook so they fire exactly once per successful payment (and not on auto-cancellation/failure).
4. Test end to end with a test-mode card payment and confirm both emails arrive.

## Notes
- If you don't have a Phoenix domain yet, you can buy one (I can help search) — that's the only blocker.
- Everything else around payments (checkout, auto-cancel after 24h, deposit handling) is already done and unaffected.
