# Backend review — school and customer view

I went through the live data, the booking rules, the admin screens and the payment/email paths. Below is what actually works, what is broken, and what I'd plan in next.

## What works well

- **Booking engine core**: products (trial flight, lesson, self-hire), calculated pricing (fixed package, or aircraft wet rate + instructor fee), deposits, promo codes, recurring lesson blocks.
- **Card payments**: real card checkout in test mode, charging the exact calculated amount, with the payment confirmation updating the booking automatically.
- **Access rules**: staff/admin areas are properly locked down, customers can only see their own bookings, self-hire is gated on approval, and pilot verification (documents + review + automatic upgrade to pilot) works end to end.
- **Admin tooling that is real**: bookings list, aircraft, products, calendar hours, closed dates, resource blocks, promotions, students/logbook, expiries, pilot verifications, users, email settings.

## What's broken (fix first)

1. **Admin pages render white-on-white.** The main panel uses the light background while all the content is styled for the dark console, so text is invisible — exactly what your screenshot shows. Cosmetic cause, but it makes the console look broken.
2. **Every booking in the system is cancelled.** All 45 test bookings were auto-cancelled and none show as paid. The 24-hour "unpaid" sweep does not exclude invoice-only products, so PPL lesson bookings — which are never paid online by design — get automatically cancelled a day after they're made. Live, this would silently wipe lesson bookings.
3. **Availability rules aren't enforced when a booking is actually created.** Closed dates, aircraft/instructor blocks, opening hours, minimum notice and maximum advance are applied only when drawing the time picker. A stale page or a direct request can book a closed day or a grounded aircraft.
4. **Two people can grab the same slot.** The clash check reads then writes, with no database-level guarantee, so simultaneous bookings on the same aircraft or instructor can both succeed.
5. **Customers currently receive nothing.** Receipts and team alerts are built but skipped, because no Phoenix sending address is connected yet. Until that's done, a paying customer gets no confirmation at all.
6. **The Console Overview is fake.** The dashboard numbers ("6 sections, 3 instructors, 3 aircraft, 6 users") are hardcoded — the real figures are 2 aircraft and 3 users — and it still shows an obsolete "database integration pending" warning. System Analytics is likewise invented error logs and traffic.
7. **Contact form goes nowhere.** Enquiries are saved to the database but nobody is emailed and there is no screen to read them.

## What needs simplifying

- **Two payment systems side by side.** "Mock Payments" still sits in the menu next to real card payments. Keep it as a hidden dev tool, not a front-door admin item.
- **Nobody can book a lesson.** Lessons require an enrolled student record and there are zero students, with no obvious "enrol this customer" path from a booking or user. The trainee journey (sign up → become a student → book lessons) needs one clear route.
- **Menu is 20 items deep** with no priority. The daily job (today's flights, who's due, who owes money) has no home; the overview page should be that.
- **Half-built multi-school support.** Every record is stamped with a single fixed school ID. Fine for Phoenix, but it's dead weight until you sell to a second school — leave it alone rather than half-using it.

## What to add

**For customers**
- Booking confirmation and receipt email (blocked only on connecting a sending address), plus a reminder the day before.
- Self-service change/cancel within the cancellation window, instead of phoning up.
- A way for guests (no account) to look up their booking — right now the confirmation link is the only copy they get.
- Clarity on the self-hire balance: the remaining 80% is collected in person, but nothing on screen or in email says so.

**For the school**
- A real "today" console: flights today, unpaid balances, pending approvals, expiring medicals/licences.
- An enquiries inbox for the contact form, with an alert email.
- Ability to take payment or record a cash/bank payment against a booking, and issue refunds on cancellation.
- No-show / completed outcomes feeding the logbook, so a flown lesson turns into a logbook entry without double entry.

## Suggested order of work

1. **Make it trustworthy** — fix the white-on-white console, stop invoice bookings being auto-cancelled, enforce availability and prevent double-booking at the database level, replace the fake dashboard with real numbers, retire the fake analytics screen.
2. **Close the customer loop** — connect the Phoenix sending address, turn on receipts and team alerts, add the enquiries inbox and alert, add day-before reminders.
3. **Complete the money story** — record manual/offline payments and balances, refunds on cancellation, and a clear deposit-balance message to the customer.
4. **Complete the training story** — one enrolment path from customer to student, booked lesson → logbook entry, instructor-facing view.
5. **Self-service** — customer cancel/reschedule, guest booking lookup.

## Technical notes

- Auto-cancel: `cancel_stale_unpaid_bookings` filters on `payment_status = 'unpaid'` only; it must exclude products whose `payment_mode = 'invoice'`.
- Booking creation (`createBooking`) validates product kind, clashes and promos, but never re-checks `booking_closed_dates`, `booking_resource_blocks`, `booking_calendar_settings` or the product's `min_notice_hours` / `max_advance_days` — those live only in `listAvailableSlots`.
- `bookings` has no exclusion constraint; add a `btree_gist` exclusion on (aircraft_id, tstzrange) and (instructor_id, tstzrange) for active statuses.
- Admin shell: `src/routes/cms.tsx` main panel uses `bg-background` (white in light mode) while children assume the dark console surface.
- `src/routes/cms/index.tsx` and `src/routes/cms/analytics.tsx` are static fixtures.
- Emails are fully wired through `notifyBookingPaid`; they no-op until a sender domain exists.
