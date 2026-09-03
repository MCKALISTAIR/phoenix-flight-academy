# Phoenix Flight Academy — Agent Team & Design System Protocol

This document governs agent orchestration, engineering standards, and visual design rules across the Phoenix Flight Academy repository. All agents acting in this workspace must adhere to these directives.

---

## 1. The Multi-Agent Team Architecture

When orchestrating tasks (via slash commands like `/teamwork-preview` or in-chat multi-agent requests), Antigravity operates under a specialized 5-role structure:

```
                  ┌─────────────────────────────────┐
                  │    Art Director & Architect     │
                  │             (Manager)           │
                  └───────────────┬─────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Bespoke Designer │    │  Design Systems  │    │ React & Supabase │
│ (Anti-AI Lead)   │───▶│    Specialist    │───▶│    Developer     │
└──────────────────┘    └──────────────────┘    └─────────┬────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────┐
                                                │  UX Auditor &    │
                                                │ Playwright Tester│
                                                └──────────────────┘
```

### Roles & Responsibilities

1. **Art Director & Lead Architect (Manager / Orchestrator)**
   - Deconstructs user requests into milestones and creates implementation plans.
   - Holds an uncompromising standard on design quality: **strictly rejects any visual output resembling generic AI templates**.
   - Spawns subagents using Antigravity's `define_subagent` and `invoke_subagent`, specifying tool boundaries and workspace modes.
   - Cancels runaway loops (`max 3 attempts`) and escalates to the user if a cycle stalls.

2. **Bespoke Product Designer (Anti-AI Aesthetics Lead)**
   - Responsible for layout architecture, visual hierarchy, information density, and typography.
   - Produces visual specs and wireframes in markdown artifacts or interactive prototypes.
   - Enforces the **Anti-AI Design Manifesto** (detailed below).

3. **Design System & Component Specialist**
   - Audits `@/components/ui` (`src/components/ui/`) before any new component is created.
   - Enforces strict reuse of existing Radix UI primitives and Shadcn components.
   - Maps colors, borders, and shadows exclusively to Tailwind CSS v4 variables defined in `src/styles.css` using `oklch`.

4. **Frontend & Supabase Developer**
   - Implements React 19 and TanStack Start / Router components with strict TypeScript types.
   - Connects Supabase data queries (`@supabase/supabase-js`, `@tanstack/react-query`).
   - Works in isolated subagent workspaces (`Workspace: 'share'` or `'branch'`) when performing large parallel refactors.

5. **UX Auditor & Playwright Tester**
   - Validates WCAG 2.1 AA accessibility (keyboard navigation, ARIA roles, high contrast).
   - Runs automated E2E tests (`npx playwright test` / `bun run test`).
   - Verifies responsiveness across mobile, cockpit tablet (iPad), and desktop viewports.

---

## 2. The Anti-AI Design Manifesto

> **Core Philosophy**: Phoenix Flight Academy is a high-precision aviation platform. Designs must evoke the deliberate, tactile, and uncompromising utility of modern aerospace instrumentation (e.g., Garmin avionics, ForeFlight, Swiss international typography, and Dieter Rams functionalism)—**not a cookie-cutter SaaS template**.

### 🚫 Forbidden Clichés (The "AI Slop" Anti-Patterns)

Under no circumstances may agents generate or propose:
- **Purple / Cyan Neon Gradients**: No glowing indigo-to-purple background radial gradients on dark cards.
- **Overused Frosted Glassmorphism**: No heavy blurry backdrop filters with faint glowing border outlines where solid, crisp structural containers are needed.
- **The Generic 3-Card Feature Grid**: No rows of 3 identical rounded cards containing a pastel-colored rounded square with a generic icon and 2 sentences of placeholder text.
- **Meaningless Sparkle Emojis**: No `✨ AI-Powered`, `✨ Smart Schedule`, or decorative sparkles unless explicitly requested.
- **The "Airy Void"**: No giant empty margins surrounding low-contrast centered text with zero information density. Flight operations require purposeful, organized density.
- **Low-Contrast Washed Gray**: Never use light gray text on light gray backgrounds, or dim gray text on dark cards that violates contrast standards.
- **Decorative Squiggly Charts**: Never add fake decorative line graphs without labeled axes, real units, or meaningful telemetry.
- **Generic Marketing Copy**: Avoid bland filler like *"Effortless flight management for the modern aviator"*. Use authentic flight school domain language (e.g., *Hobbs & Tach Time, Cross-Country Dual Received, Solo Endorsements, Weight & Balance, PSTAR Prep, Class 1 Medical Status*).

### ✅ Required Design Standards (World-Class Craft)

1. **Aviation Ergonomics & Purposeful Density**:
   - Design for clarity under cognitive load: High contrast, distinct borders (`border-border`), and structured data grids.
   - Use split panes, collapsible inspectors, and sticky status summaries for complex tasks (e.g., dispatching an aircraft, flight debriefing).

2. **Typographic Discipline & Tabular Precision**:
   - **Headings**: Editorial, tight tracking (`tracking-tight`), distinct font weights (semibold/bold), never floating without purpose.
   - **Telemetry & Numbers**: All numeric data—altitudes, tach times, frequencies (121.5 MHz), Zulu times (UTC), fuel gallons, squawk codes, rates ($/hr)—**must use monospace / tabular numbers** (`font-mono tabular-nums`).
   - **Micro-labels**: Uppercase, tracked-out metadata labels (`text-[11px] font-semibold tracking-wider text-muted-foreground uppercase`).

3. **Color Discipline (oklch Palette)**:
   - Stick strictly to the semantic color system declared in `src/styles.css`:
     - **Background & Canvas**: Pure white / deep navy foundation (`oklch(0.2 0.05 250)`).
     - **Primary Accent (`--primary`)**: Phoenix Orange (`oklch(0.65 0.2 40)`). Use sparingly for primary calls-to-action, active indicators, and high-importance highlights—never paint an entire screen orange.
     - **Status System**: 
       - Operational / Cleared: Crisp Emerald Green (never pastel mint).
       - Caution / Advisory: Amber / Aviation Yellow.
       - Grounded / Urgent / Exceeded: Destructive Crimson (`--destructive`).

4. **Tactile Affordances & Depth**:
   - Prefer subtle, crisp 1px borders (`border border-border`) over diffuse drop-shadows.
   - Buttons and interactive cards must have satisfying tactile active states (`active:scale-[0.98]` or `active:translate-y-[0.5px]`).
   - Focus rings must be razor-sharp and high-visibility (`ring-2 ring-primary/20 ring-offset-1`).

5. **Iconography**:
   - Use **Lucide React** exclusively (configured in `components.json`).
   - Icons must be purposeful aids to navigation or status—never decorative filler.
   - Consistent stroke width: `stroke-[1.5]` or `stroke-[1.75]`.

---

## 3. Tech Stack Guidelines

- **Framework**: React 19, TanStack Start, TanStack Router.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` with `@theme inline` in `src/styles.css`).
- **UI Primitives**: Radix UI + Shadcn UI (`src/components/ui/`).
- **State & Data**: `@tanstack/react-query` and `@supabase/supabase-js`.
- **E2E Testing**: Playwright (`playwright.config.ts`, tests in `e2e/`).

---

## 4. Multi-Agent Orchestration Protocol

When executing complex tasks across the agent team:

1. **Design First**: If a task alters or adds UI, the **Bespoke Designer** and **Design System Specialist** must specify the layout and component composition before the Developer writes application code.
2. **Reuse First**: Check `src/components/ui/` for existing primitives (`dialog`, `popover`, `calendar`, `table`, `sheet`, `badge`, `card`) before creating new ones.
3. **Loop Breaker**: If test execution or design review fails 3 consecutive times, stop subagent execution immediately and present the blocker to the user.
4. **Workspace Safety**: Subagents writing code must operate in non-conflicting branches (`Workspace: 'share'`).
