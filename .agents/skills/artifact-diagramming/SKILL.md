---
name: artifact-diagramming
description: >-
  Rules and patterns for creating clear, architectural, and procedural diagrams in artifacts.
  Covers Mermaid.js diagrams, inline SVG with dual-theme legibility, and technical mechanism illustrations.
  Use when illustrating architectures, data flows, state machines, and system interactions.
---

# Artifact Diagramming Skill

## When to Use

Use when an artifact requires a visual diagram to explain system architecture, execution flow, component hierarchies, or multi-agent handoffs.

## Principles

1. **Earn Its Place**: Only include a diagram if it reveals mechanism or structural relationships better than concise prose or a table.
2. **Dual-Theme Legibility**:
   - For Mermaid: Keep syntax clean, quote node labels with special characters (e.g., `id["Label (Context)"]`), and avoid raw HTML in labels.
   - For Inline SVG: Use CSS custom properties (`currentColor`, `var(--ground)`, `var(--ink)`, `var(--rule)`) so strokes and fills adapt automatically to light and dark themes.
3. **High-Information Density**:
   - Label transitions and edges with active verbs or data types.
   - Use distinct geometric nodes (e.g., diamonds for decision branches, cylinders for databases, rounded rectangles for agents).
