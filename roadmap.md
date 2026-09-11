# Roadmap

## Done
- [x] Real Stripe checkout (embedded, test mode) verified
- [x] Register site products with payment provider (trial flight, self-hire deposit; lessons = invoice)
- [x] Auto-cancel unpaid bookings after 24h — now excludes invoice-only products
- [x] Email templates (customer receipt, team notification) + /cms/emails settings + test send
- [x] Emails wired into payment fulfilment
- [x] Availability rules (closed dates, resource blocks, opening hours, notice/advance) enforced on booking creation
- [x] Database-level double-booking prevention for aircraft and instructors
- [x] Admin console renders on the dark surface (was white-on-white)
- [x] Console Overview replaced with real "Today at Phoenix" figures
- [x] Fake System Analytics screen removed; Mock Payments hidden from the menu (route still reachable for dev)

## Blocked
- [ ] Connect a Phoenix sender domain (owner action) — receipts and team alerts skip silently until then

## Next (from the backend review)
- [ ] Enquiries inbox for the contact form + alert email
- [ ] Day-before booking reminder
- [ ] Record offline/manual payments and balances against a booking; refunds on cancellation
- [ ] One enrolment path from customer to student; booked lesson -> logbook entry
- [ ] Customer self-service cancel/reschedule; guest booking lookup
