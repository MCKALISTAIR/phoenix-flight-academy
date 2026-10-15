# Phoenix Flight Academy — Visual QA / UI Polish Pass

Adapted from a GridSense spatial/legibility audit prompt for this codebase (TanStack Start + Tailwind v4 + Radix/shadcn, aviation design system in `GEMINI.md`).

## Role

You are doing a visual QA / UI polish pass on **Phoenix Flight Academy** (mobile-first, then desktop).

**Goal:** find small spatial and legibility defects — not new features, not refactors.

## Scope

### Public marketing & booking surfaces
- Home (`/`)
- About (`/about`), Contact (`/contact`), Fleet (`/fleet`)
- Flying: Experience (`/flying/experience`), Learn to Fly (`/flying/learn-to-fly`), Self Hire (`/flying/self-hire`)
- Booking hub (`/booking`), book flow (`/booking/book/$slug`), lookup (`/booking/lookup`)
- Login / register (`/login`, `?tab=register`), password reset dialog
- Legal: Privacy (`/privacy`), Terms (`/terms`)
- Navbar (desktop + mobile menu), Footer, dialogs/sheets/dropdowns/toasts

### Authenticated surfaces (use test logins on `/login`)
- **User:** `User e2e-user@test.lovable.dev` → Booking dashboard (`/booking/dashboard`), Account (`/account`)
- **Admin:** `Admin e2e-admin@test.lovable.dev` → CMS (`/cms` and sidebar pages), Day sheet, Bookings, Students, etc.
- Instructor schedule (`/instructor/schedule`) if reachable

### Viewports & themes
- Phone ~**390×844** first, then desktop ~**1280×800+**
- **Light** and **dark** (`localStorage.theme = "light"|"dark"`, then reload; app reads `theme` in `__root.tsx`)

### Evidence
- Real UI in browser; **screenshot every issue** under `/opt/cursor/artifacts/screenshots/` (or project `docs/visual-qa/`)

## Look for ONLY

1. **Contrast / legibility** — icons, muted text, badges on busy hero/photo backgrounds; status colors that fail WCAG-ish readability
2. **Occlusion** — controls overlapping, labels under sticky navbar/chrome, close vs pills, mobile menu vs content
3. **Overflow / clipping** — long names, METAR strings, table cells, tooltips, booking cards past edges
4. **Spacing / alignment** — uneven gaps, cramped rows, orphaned icons, misaligned CMS table columns
5. **Layout shift** — first paint, tab toggles (login/register, journey type), refresh, weather decode toggle
6. **Touch targets** — controls under ~44px or hard-to-hit (mobile nav chevrons, icon-only buttons, CMS sidebar collapse)
7. **Motion** — page entrance / scroll progress that hides content, causes flicker, or fights sticky header

## Do NOT

- Redesign layouts or invent features
- File “nice to have” taste changes without a concrete defect
- Flag Anti-AI manifesto violations unless they are also a **concrete** defect above
- Stop after 3 findings — exhaust each screen systematically

## Method

1. Walk each screen **top → bottom**, then open every **dialog / sheet / dropdown / popover**
2. Toggle key states: loading skeletons, empty lists, error banners, logged-out vs logged-in, light vs dark
3. On login: exercise weather console (Decode Weather / Show METAR), registration journey-type tabs
4. On CMS: sample high-density pages (Day Sheet, Bookings, Students, Expiries, Calendar Settings)
5. For each issue record:
   - Screenshot path
   - Short title
   - Where (route + UI region)
   - Why it fails (one of the 7 criteria)
   - Severity: `blocker` | `major` | `minor`
   - Suggested fix in one line

## Output

Findings list **sorted by severity** (blockers → majors → minors). Prefer many precise minors over vague “polish this screen.”
