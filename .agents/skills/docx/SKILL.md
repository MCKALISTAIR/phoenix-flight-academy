---
name: docx
description: >-
  Creating, inspecting, and editing Microsoft Word (.docx) documents.
  Use when the user requests generating formal reports, flight school syllabus manuals, letterheads,
  contracts, or extracting content from .docx files.
---

# Word Document (.docx) Skill

## When to Use
Use when generating or editing Microsoft Word documents (`.docx`).

## Tooling & Patterns
- **Node.js / TypeScript**: Use the `docx` library (`npm install docx`) to generate structured documents with headings, tables of contents, page breaks, headers, footers, and custom styles.
- **Python**: Use `python-docx` (`pip install python-docx`) for script-based generation or parsing existing `.docx` files.
- **Styling Discipline**: Maintain clean hierarchy—Title, Heading 1, Heading 2, Body Text. Always use explicit cell padding and borders for tables.
