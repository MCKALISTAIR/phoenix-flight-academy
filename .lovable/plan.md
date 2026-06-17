
# Plan: Multi-tenancy + Marketing Site

Two phases. Each is shipped end-to-end before the next starts. Phase 1 is a big DB migration that requires your approval before code lands.

---

## Phase 1 — Multi-tenancy retrofit

Today every table is global: one bookings table, one fleet, one customer base. To sell this to multiple flight schools we need `organizations` and an `organization_id` on every tenant-scoped table.

### 1.1 Schema (single migration, you approve it)

New tables:
- **`organizations`** — `name`, `slug` (unique), `icao_code`, `timezone`, `currency`, `subscription_tier` (enum: `trial` / `starter` / `pro`), `trial_ends_at`, `branding` (jsonb: logo_url, primary_color).
- **`organization_members`** — `organization_id`, `user_id`, `role` (enum: `owner` / `admin` / `staff`), `invited_by`, `joined_at`. Unique on `(organization_id, user_id)`.
- **`organization_invites`** — `organization_id`, `email`, `role`, `token`, `expires_at`, `accepted_at`.

Add `organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE` to these existing tables:
`aircraft`, `instructors`, `students`, `bookings`, `booking_products`, `booking_promotions`, `booking_calendar_settings`, `booking_closed_dates`, `booking_resource_blocks`, `customer_profiles`, `pilot_verification_requests`, `self_hire_approvals`, `flight_log_entries`, `flight_log_exercises`, `flying_status`, `student_documents`, `student_endorsements`, `theory_exam_results`, `syllabus_exercises`, `site_content`, `site_content_revisions`, `admin_requests`.

Tables that stay global (no `organization_id`):
`profiles`, `user_roles` (platform-level roles), `auth.*`.

### 1.2 Backfill

A single "Phoenix Flight Academy" org is inserted, and every existing row is stamped with its id. Existing admin user becomes its `owner`. Zero data loss; the app keeps working for the current school as a single tenant.

### 1.3 RLS rewrite

A new security-definer helper `public.is_org_member(_org_id uuid)` and `public.has_org_role(_org_id uuid, _role org_role)`. Every tenant-scoped policy gets rewritten to scope by `organization_id` via these helpers. `has_role(auth.uid(), 'admin')` becomes `has_org_role(organization_id, 'admin')` for org-admin checks; the global `admin` role is reserved for platform staff (you).

### 1.4 App changes

- **Current org context**: a `useCurrentOrg()` hook reads the user's active org from `organization_members` (first one, or a cookie-pinned choice). Stored in router context so loaders can use it.
- **Org switcher** in the app header — only renders if the user has >1 org.
- **Every server function** that touches a scoped table takes/derives `organization_id` from context, never trusts client input for it.
- **CMS pages** are scoped to current org.
- **`/cms/organization`** — new page for org-level settings (name, branding, timezone, currency).

### 1.5 Onboarding flow

- **`/onboarding`** — shown after signup when the user has no `organization_members` row. Three steps:
  1. Create your flight school (name → slug, ICAO, timezone, currency)
  2. Add your first aircraft (skippable)
  3. Invite teammates by email (skippable)
- New users land here automatically; the existing `/account` flow stays for customers (students/pilots) who aren't part of any org.

### 1.6 What's explicitly NOT in Phase 1

To keep this shippable: no Stripe Billing yet, no Stripe Connect, no per-org custom domains, no white-label theming beyond storing the branding jsonb. Those become Phase 3+.

---

## Phase 2 — Marketing site

Lives inside this app under a `/marketing/*` route group with its own layout (separate header/footer from the product). Later you can split it to its own deploy at `www.` — the route structure makes that trivial.

### 2.1 Routes

```text
src/routes/marketing/
  route.tsx                  layout (marketing header + footer)
  index.tsx                  /marketing      — home / landing
  features.tsx               /marketing/features
  pricing.tsx                /marketing/pricing
  for-schools.tsx            /marketing/for-schools
  about.tsx                  /marketing/about
  contact.tsx                /marketing/contact
  blog.index.tsx             /marketing/blog
  legal.terms.tsx            /marketing/legal/terms
  legal.privacy.tsx          /marketing/legal/privacy
```

Each route has its own `head()` with title, description, og:title, og:description; leaf pages get og:image.

### 2.2 Components

- `MarketingHeader` — logo, nav (Features / Pricing / About / Contact), "Sign in" + "Start free trial" CTAs.
- `MarketingFooter` — links, legal, social.
- `Hero`, `FeatureGrid`, `PricingTable`, `FAQ`, `CTASection`, `LogoCloud` — reusable section components.

### 2.3 Content scope for this pass

Real, written copy for Home, Features, Pricing, For Schools, About, Contact, Terms, Privacy. Blog index is a stub ("Coming soon"). Pricing table shows three tiers (Starter / Pro / Enterprise) — numbers are placeholders you can edit. Contact form posts to a `contact_submissions` table.

### 2.4 SEO & metadata

- `public/robots.txt` allows all, points to `/sitemap.xml`.
- `public/sitemap.xml` lists every marketing route.
- Root `head()` cleaned up — generic OG image removed (Phase 2 leaf routes own their own).
- Update root `/` to redirect to `/marketing` for unauthenticated visitors; authenticated org members go to their dashboard, customers go to `/account`.

### 2.5 What's NOT in Phase 2

No CMS for marketing copy (it's in source — fast iteration, you control it). No blog post pages yet (just the index stub). No analytics provider wired (you can pick PostHog/Plausible later). No demo-booking integration (contact form only).

---

## Order of operations

1. I write the Phase 1 migration and submit it for your approval.
2. After approval, types regenerate; I update app code (org context, server fns, RLS-affected queries, onboarding flow, org switcher, CMS scoping).
3. I scaffold Phase 2 marketing routes, components, copy, robots/sitemap, and root redirect.
4. I run a security scan and report back.

## Open questions I'll need answered along the way

- **Slug for the existing org**: default to `phoenix` unless you want different.
- **Pricing tiers**: I'll use placeholder numbers (e.g. $99 / $249 / Contact us). Tell me if you have real numbers.
- **Marketing brand name**: "Phoenix Flight Academy" is the *tenant*. What's the *platform* called? I'll use "Skyline" as a placeholder if you don't have one yet.
