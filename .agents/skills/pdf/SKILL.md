---
name: pdf
description: >-
  Generating, parsing, merging, and inspecting PDF documents.
  Use when generating student graduation certificates, pilot logbook endorsements, invoices, or extracting text from PDFs.
---

# PDF Document Skill

## When to Use
Use when creating printable certificates, flight endorsements, weight & balance sheets, or reading and splitting existing PDF files.

## Tooling & Patterns
- **PDF Generation**:
  - HTML-to-PDF: Use Playwright (`page.pdf({ format: 'A4', printBackground: true })`) for pixel-perfect modern CSS/HTML rendering.
  - Programmatic: `pdf-lib` (Node.js) or `pypdf` / `reportlab` (Python).
- **Form Filling & Modification**: Use `pdf-lib` in Node or `pypdf` in Python to fill form fields, merge documents, or add watermarks.
