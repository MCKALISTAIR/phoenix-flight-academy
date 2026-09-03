---
name: artifact-design
description: >-
  Design fundamentals for high-craft markdown and HTML artifacts. Enforces dual-theme token discipline,
  typographic hierarchy, purposeful density, and strict avoidance of generic AI visual tropes.
  Use when generating artifacts, design specs, landing page prototypes, or interactive preview documents.
---

# Artifact Design Skill

## When to Use
Apply this skill whenever creating markdown or HTML artifacts to ensure output meets executive, high-craft visual standards and completely rejects AI-generated clichés.

## Core Directives

### 1. The Anti-AI Aesthetic Rules
- **NEVER** use purple/cyan glowing radial gradients on dark cards.
- **NEVER** use blurry glassmorphism (`backdrop-blur-md` with glowing neon borders) where crisp structural containers are needed.
- **NEVER** generate generic rows of 3 rounded cards containing a pastel circle with an icon and 2 sentences of filler.
- **NEVER** insert sparkle emojis (`✨`) or decorative marketing fluff.
- **NEVER** create low-contrast gray text on gray backgrounds. Maintain minimum 4.5:1 contrast for body copy.

### 2. Typographic Rigour & Density
- **Pairings**: Pair an editorial serif (e.g. Source Serif 4, Georgia) or crisp grotesque sans (e.g. Archivo, Inter) with a tabular monospaced font for telemetry.
- **Numbers & Telemetry**: ALL numeric figures, tallies, rates, timestamps, and coordinates MUST use `font-mono tabular-nums`.
- **Labels**: Tracked-out uppercase micro-labels (`text-[10.5px] font-semibold tracking-wider text-muted-foreground uppercase`).

### 3. Tactility & Token Discipline
- Prefer crisp 1px solid borders (`border border-border`) over heavy drop-shadows.
- Always support dual themes (light and dark) using CSS variables or oklch colors.
- Design for density: use structured data tables, split panes, and collapsible sections rather than giant empty margins.
