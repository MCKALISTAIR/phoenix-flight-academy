# Roadmap
- [x] Real Stripe checkout (embedded, test mode) verified
- [x] Fix all typecheck errors in /tmp/observability/build-errors.log (incl. pre-existing)
- [x] Register site products with payment provider (trial flight, self-hire deposit; lessons = invoice)
- [x] Auto-cancel unpaid bookings after 24h (hourly scheduled job, live)
- [ ] Customer confirmation + team notification emails on payment — blocked: user must complete email domain setup dialog, then scaffold transactional email
- [ ] Wire email sending into the payment webhook once email infra exists
