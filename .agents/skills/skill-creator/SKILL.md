---
name: skill-creator
description: >-
  Authoring, testing, and evaluating Antigravity skills.
  Use when building new custom skills, editing existing ones, or structuring runbooks for progressive disclosure.
---

# Antigravity Skill Creator

## When to Use
Use when standardizing a new workflow, library, or engineering procedure into a reusable Antigravity skill.

## Standard Structure
```text
skills/<skill_name>/
├── SKILL.md          # Required: Instructions (< 500 lines) with YAML frontmatter
├── scripts/          # Optional: Executable automation scripts
├── examples/         # Optional: Reference code implementations
└── references/       # Optional: Detailed API specs or cheatsheets
```

## Frontmatter Standard
Every `SKILL.md` MUST start with:
```yaml
---
name: unique-skill-identifier
description: >-
  Specific summary of what this skill does and the EXACT user requests or tasks that should trigger it.
---
```

## Quality Checklist
1. **Third-Person Description**: Explains when the agent should activate the skill.
2. **Concise Main Runbook**: Keep `SKILL.md` under 500 lines; use `references/` for deep manuals.
3. **Actionable Instructions**: Concrete examples, code snippets, and verification steps.
