# Phoenix Flight Academy — Visual QA Findings

Restructured GridSense-style spatial/legibility pass (see `docs/visual-qa-prompt.md`).  
Executed against local `http://localhost:5173` — mobile **390×844** first, then desktop **1280×800**, light + dark samples.

**Method:** Playwright viewport capture + targeted re-measure; screenshots in `docs/visual-qa/screenshots/` and `/opt/cursor/artifacts/screenshots/`.

---

## Findings (sorted by severity)

### Blocker

#### VQA-001 — CMS sidebar permanently consumes ~66% of phone width
- **Where:** `/cms` and all CMS child routes (e.g. Day Sheet, Bookings) @ ~390×844
- **Why:** Occlusion / overflow — `CmsSidebar` is fixed `w-64` with no mobile drawer; main content (e.g. “Today at Phoenix”) starts ~x=280 with ~90px usable width; labels like “AWAITING APPROV…” clip
- **Severity:** blocker
- **Fix:** Collapse sidebar behind a sheet/drawer below `md`; keep sticky top ops strip + hamburger
- **Screenshot:** `screenshots/VQA-001-cms-sidebar-mobile.png`

---

### Major

#### VQA-002 — Hero airfield pill clips elevation on narrow phones
- **Where:** `/` hero metadata pill @ 320px (and tight at 390)
- **Why:** Overflow/clipping — “Elev 356 FT” truncated to fragments on the right edge of the pill
- **Severity:** major
- **Fix:** Allow wrap to two rows, or hide coords/elev below `sm` and keep EGPG + name only
- **Screenshot:** `screenshots/VQA-007-hero-pill-320.png`

#### VQA-003 — Page entrance animation starts at opacity 0 (content hidden on first paint)
- **Where:** All routes wrapped with `.animate-page-entrance` in `__root.tsx`
- **Why:** Motion / layout shift — `@keyframes pageEntrance` begins `opacity: 0`; measured opacity `0` immediately after navigation commit; hero copy absent in early frames
- **Severity:** major
- **Fix:** Prefer `opacity: 0.01`→1 or animate only `transform`; respect `prefers-reduced-motion`
- **Screenshot:** `screenshots/VQA-002-page-entrance-hidden.png` (early capture) vs settled home

#### VQA-004 — Login “Forgot password?” hit area is 16px tall
- **Where:** `/login` → password label row
- **Why:** Touch targets — measured box ≈ 100×16px (far under ~44px)
- **Severity:** major
- **Fix:** Add `py-2` / min-height 44px hit padding on the text button
- **Screenshot:** `screenshots/VQA-004-forgot-password.png`

#### VQA-005 — Testimonial carousel dots are 8×8px
- **Where:** `/` testimonials pager (`Go to testimonial N`)
- **Why:** Touch targets — inactive dots `h-2 w-2` (8px); active `h-2 w-8`
- **Severity:** major
- **Fix:** Keep visual 8px dots but expand hit area with `p-3` / min 44×44 wrapper
- **Screenshot:** `screenshots/VQA-003-testimonial-dots.png`

---

### Minor

#### VQA-006 — Footer social icons are 20×20 with no padded hit box
- **Where:** Site footer (all public pages)
- **Why:** Touch targets — Facebook/Instagram links wrap `h-5 w-5` icons only
- **Severity:** minor
- **Fix:** Wrap icons in 44×44 tap targets (`p-3` or `size-11` flex center)
- **Screenshot:** `screenshots/VQA-006-footer-social.png`

#### VQA-007 — Footer column links ~19px tall
- **Where:** Footer “About Us / Our Fleet / …” stacks
- **Why:** Touch targets — line-height-sized anchors (~60×19)
- **Severity:** minor
- **Fix:** Increase vertical padding (`py-2`) on footer nav links

#### VQA-008 — Login “Decode Weather” control ~21px tall
- **Where:** `/login` weather console header
- **Why:** Touch targets — text button without min height
- **Severity:** minor
- **Fix:** Match button `size="sm"` with min-h-11 or padded ghost button

#### VQA-009 — Password-reset dialog dismiss control undersized
- **Where:** Forgot-password dialog (X / Cancel region)
- **Why:** Touch targets — close/cancel affordance measured ~28×28
- **Severity:** minor
- **Fix:** Use Dialog close with `size-11` hit area

#### VQA-010 — Mobile nav toggle measured 36×36
- **Where:** Public header hamburger (`Toggle Navigation Menu`)
- **Why:** Touch targets — under 44px (close but short)
- **Severity:** minor
- **Fix:** Expand to `h-11 w-11`

#### VQA-011 — Desktop nav links 28px tall / Flying trigger 20px
- **Where:** Desktop header (`About`, `Flying`, `Our Fleet`, `Contact`)
- **Why:** Touch targets — tap/click height under 44px (mouse OK; tablet awkward)
- **Severity:** minor
- **Fix:** Increase header control `py` / min-height

#### VQA-012 — CMS sidebar nav rows ~py-1.5 with 14px icons
- **Where:** CMS aside links
- **Why:** Touch targets / cramped rows — dense `text-xs` + `py-1.5`
- **Severity:** minor (becomes major once mobile drawer exists if rows stay tiny)
- **Fix:** `py-2.5` and larger icons on touch breakpoints

#### VQA-013 — Demo sign-in emails truncate on mobile login cards
- **Where:** `/login` “Demo & Verification” User/Admin tiles
- **Why:** Overflow — `e2e-user@test.lov..` / `e2e-admin@test.lov..`
- **Severity:** minor
- **Fix:** Stack label above full email with `break-all`, or show short role-only labels

#### VQA-014 — Hero body / muted chrome low contrast on photo
- **Where:** `/` hero supporting paragraph + translucent pill over photo (light & dark)
- **Why:** Contrast/legibility — thin white/`white/80` on variable hero imagery
- **Severity:** minor
- **Fix:** Stronger scrim behind type; bump body to `text-white/90` and pill bg opacity

#### VQA-015 — CMS muted labels (`text-white/40`, card footers) hard to read
- **Where:** CMS overview metric cards, sidebar section headers
- **Why:** Contrast — `white/40`–`white/50` on navy
- **Severity:** minor
- **Fix:** Raise to ≥ `white/60` for secondary labels; keep `/40` only for decorative chrome

#### VQA-016 — Self-hire “View Cockpit Avionics Specs” link ~20px tall
- **Where:** `/flying/self-hire`
- **Why:** Touch targets
- **Severity:** minor
- **Fix:** Button-sized text link with vertical padding

#### VQA-017 — Booking dashboard waypoint table dense on phone
- **Where:** `/booking/dashboard` cross-country calculator table
- **Why:** Spacing / overflow risk — multi-column MSA/fuel headers cramped at 390
- **Severity:** minor
- **Fix:** Horizontal scroll container with sticky first column, or card-per-waypoint on `sm`

#### VQA-018 — Scroll-progress / top chrome orange hairline
- **Where:** Sticky header top edge during scroll (public pages)
- **Why:** Occlusion / chrome — thin orange progress bar sits against header (easy to mistake for misalignment)
- **Severity:** minor
- **Fix:** Offset below header or lower opacity when overlapping brand bar

---

## Coverage

| Area | Covered |
|------|---------|
| Home (light/dark, mobile/desktop) | yes |
| About, Contact, Fleet | yes |
| Experience, Learn to Fly, Self Hire | yes |
| Booking hub + lookup | yes |
| Login / register / forgot password | yes (dialog close measure partial) |
| Privacy, Terms | yes |
| User dashboard + account | yes |
| CMS overview, Day Sheet, Bookings, Students, Expiries, Calendar Settings, Users | yes |
| Instructor schedule | not exercised |
| Booking checkout flow | not exercised |
| Full dark sweep of every CMS page | sample only (`/cms/bookings`) |

## Automation notes

Raw overflow/touch probe output: `/opt/cursor/artifacts/screenshots/automation-notes.json`  
Full pass gallery: `/opt/cursor/artifacts/screenshots/pass/`
