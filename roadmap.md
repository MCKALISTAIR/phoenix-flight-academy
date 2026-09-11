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

- [x] Enquiries inbox for the contact form (`/cms/enquiries`) + team email alerts
- [x] Day-before booking reminder & pre-flight briefing template + CMS trigger
- [x] Record offline/manual payments (card terminal, cash, BACS, voucher) and balances against bookings; refunds
- [x] One enrolment path from customer to student; booked lesson -> UK CAA logbook entry
- [x] Customer self-service guest booking lookup (`/booking/lookup`) with pre-flight briefing

## Blocked
- [ ] Connect a Phoenix sender domain (owner action) — receipts and team alerts skip silently until then
- [ ] Switch Stripe from test mode to live keys (owner action)

## Ready for Phoenix Handover & Sales Presentation
- [x] Commercial pitch deck & operational transition proposal prepared (`phoenix_commercial_pitch_and_handover.md`)
- [x] Flight school operational checklist & onboarding walk-through verified
- [x] Production build and TypeScript validation clean
