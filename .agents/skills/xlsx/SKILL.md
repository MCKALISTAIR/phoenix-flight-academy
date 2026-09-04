---
name: xlsx
description: >-
  Creating, parsing, and cleaning spreadsheets and tabular data (.xlsx, .csv).
  Use when analyzing student flight hours, aircraft maintenance logs, financial models, pricing calculators, or billing reports.
---

# Excel / Spreadsheet (.xlsx) Skill

## When to Use

Use when generating financial sheets, student hour trackers, maintenance logs, or data models in Excel format.

## Tooling & Patterns

- **Node.js**: Use `exceljs` or `xlsx` (SheetJS) to build styled workbooks with multiple worksheets, formulas, and cell formatting.
- **Python**: Use `pandas` and `openpyxl` (`df.to_excel('...')`) for data analysis, formula insertion, and column auto-sizing.
- **Data Rigour**:
  - Always freeze header rows (`views: [{state: 'frozen', ySplit: 1}]`).
  - Format monetary numbers explicitly (`$#,##0.00`) and flight hours with tabular decimals (`0.0`).
