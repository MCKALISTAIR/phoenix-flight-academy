# Cloud Backend Plan — Phoenix Flight Training

The app currently runs on local state and seeded mock data. Below is everything that needs real backend support, grouped by feature area.

## 1. Authentication & Roles

**Auth methods**
- Email + password (signup, login, password reset at `/reset-password`)
- Google sign-in (managed)

**Login surfaces**
- `/booking` — unified portal login + student/pilot self-registration
- `/booking/dashboard` — protected (any authenticated user)
- `/booking/admin` — protected (admin or super_admin)
- `/cms` and all `/cms/*` pages — protected (super_admin only)

**Roles** (5 distinct roles already shown in `cms/users.tsx`): `super_admin`, `admin`, `instructor`, `student`, `pilot`.

Roles stored in a dedicated `user_roles` table (never on profiles) with a `has_role()` security-definer helper for RLS.

## 2. Database Tables

| Table | Purpose | Key fields (beyond id/timestamps) |
|---|---|---|
| `profiles` | Per-user profile (auto-created on signup via trigger) | user_id, display_name, phone, avatar_url, status (active/pending/suspended), last_active_at |
| `user_roles` | Role assignments | user_id, role (enum) |
| `student_registrations` | Prospective student signups from `/booking` register form | name, email, phone, course, message, status |
| `pilot_registrations` | Prospective renter/pilot signups | name, email, license, hours, medical, status |
| `aircraft` | Fleet managed in `/cms/fleet` and shown publicly | reg, model, status, hours, rate_wet, next_annual, next_50hr, avionics_count, image_url |
| `instructors` | Team shown publicly and edited in `/cms/team` | name, role, hours, bio, image_url, display_order |
| `bookings` | Student/pilot flight bookings (dashboard + admin) | user_id, aircraft_id, instructor_id, start_at, end_at, purpose, status (pending/confirmed/cancelled/completed), notes |
| `flight_logs` | Completed flight history shown in dashboard | booking_id, user_id, hobbs_start, hobbs_end, notes |
| `site_content` | Editable copy from `/cms/content` (home, about, fleet blurbs, pricing, experience, contact) | section_key, content (jsonb) |
| `contact_messages` | Submissions from `/contact` form | name, email, subject, message, status |
| `flying_status` | Single-row global GO/NO-GO toggle from admin | status, reason, updated_by |
| `error_logs` | Backend error feed shown in `/cms/analytics` | level, message, route, code, stack, resolved |

## 3. Row-Level Security (high level)

- **Public read** (anonymous): `aircraft`, `instructors`, `site_content`, `flying_status`
- **Self-only**: `profiles`, `bookings`, `flight_logs` (user sees their own; admins see all)
- **Insert-only by public**: `student_registrations`, `pilot_registrations`, `contact_messages` (public can create; only admin/super_admin can read/update)
- **Admin/super_admin only**: write access to `aircraft`, `instructors`, `site_content`, `flying_status`, `error_logs`, role assignments

## 4. Server Functions (TanStack `createServerFn`)

- `submitContactMessage`, `submitStudentRegistration`, `submitPilotRegistration` — public
- `listMyBookings`, `createBooking`, `cancelBooking` — authenticated user
- `listAllBookings`, `confirmBooking`, `setFlyingStatus` — admin
- `upsertAircraft`, `upsertInstructor`, `upsertSiteContent`, `inviteUser`, `setUserRole`, `setUserStatus` — super_admin / admin
- Public reads (fleet, instructors, content) can use the browser Supabase client directly against RLS.

## 5. Storage Buckets

- `avatars` (public) — profile/instructor photos
- `aircraft-images` (public) — fleet photos uploaded from CMS

## 6. Frontend Wiring Order (suggested)

1. Auth: login/signup/reset pages, `_authenticated` and `_admin` layout guards, root `onAuthStateChange` listener.
2. Profiles + roles + `has_role()` helper + trigger.
3. Public content tables (`aircraft`, `instructors`, `site_content`) — wire `/fleet`, `/about`, home, and CMS editors.
4. Registrations + contact form + admin inbox.
5. Bookings + flight logs + admin dashboard + flying status toggle.
6. User management (`/cms/users`) and error log feed.

## 7. Out of Scope (for now)

- Payments (Stripe) — would be a later step for course/membership purchases.
- Email notifications (booking confirmations, contact acks) — add after Email domain is set up.
- Realtime updates on the admin dashboard — optional polish.

---

Approve this and I'll start with **step 1 (auth + roles + profiles)**, then walk through the rest one chunk at a time so each piece can be reviewed before moving on.
