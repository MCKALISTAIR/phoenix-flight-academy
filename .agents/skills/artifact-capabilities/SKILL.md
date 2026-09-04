---
name: artifact-capabilities
description: >-
  Advanced interactive features and runtime powers for artifacts. Covers self-contained interactive
  HTML/CSS/JS widgets, client-side state, live search/filtering tables, carousels, and responsive layouts.
  Use when creating interactive tools, benchmark pages, calculators, or prototype widgets inside artifacts.
---

# Artifact Capabilities Skill

## When to Use

Use when a task demands more than static text: interactive dashboards, filterable inventories, cost calculators, or client-side prototype demos within an Antigravity artifact.

## Guidelines

- **Self-Contained Execution**: All scripts, styles, and markup should run locally in the browser with zero external bundler steps.
- **Client-Side Responsiveness**: Include client-side search inputs and category filter chips (like in The Design Bench) for fast exploration of large data sets.
- **Micro-Interactions**: Implement snappy transitions, active states, and keyboard accessibility (`aria-pressed`, `aria-label`).
- **Graceful Fallbacks**: Always support `prefers-reduced-motion` and include no-match empty states.
