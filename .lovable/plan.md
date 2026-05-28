# UK CAA Logbook & Student Progress System

Build a digital logbook + student progress tracker aligned with **UK CAA / Part-FCL** pilot logbook requirements (CAP 804 / ANO Schedule 8), so the 2-instructor team can record every flight with everything the CAA expects and see each student's training picture at a glance.

## What the CAA requires per logbook entry

Captured as columns on every flight record:

- Date (UTC)
- Aircraft: make/model + registration
- Departure aerodrome + time (UTC, off-blocks)
- Arrival aerodrome + time (UTC, on-blocks)
- Total flight time (block time)
- Pilot-in-Command name
- Holder's operating capacity: **PIC / Dual / P-u/t / PICUS / Instructor**
- Landings: **day** + **night** counts
- Conditions: **night time**, **IFR time**
- Function times: **single-pilot SE**, **single-pilot ME**, **multi-pilot**, **dual received**, **instructor given**
- FSTD (simulator) time + type
- Remarks / exercises covered / endorsements
- Instructor signature (for dual flights)

## New database tables

| Table | Purpose |
|---|---|
| `syllabus_exercises` | Reference list of PPL exercises Ex 1–19 (Air Law, Effects of Controls, … Skills Test) |
| `students` | Per-student training record: license type sought (PPL/LAPL/NPPL), start date, primary instructor, status |
| `flight_log_entries` | One row per flight — all CAA fields above, linked to student + aircraft + instructor |
| `flight_log_exercises` | Many-to-many: which exercises were covered on which flight, with grade (intro / practiced / competent) |
| `student_documents` | Medical (Class 1/2/LAPL), Student Pilot License, R/T license, passport, ID — with expiry dates |
| `student_endorsements` | Solo sign-offs, first solo, solo nav, solo cross-country, type endorsements — who signed, when |
| `theory_exam_results` | 9 PPL written exams: Air Law, Met, Nav, Human Performance, etc. — pass date, score |

All tables RLS-protected: instructors + admins + super_admins read/write; students read their own records only.

## New CMS pages (instructor area)

```text
/cms/students                    -> list of all students with progress bars + alerts
/cms/students/$studentId         -> single student dashboard (tabs below)
  Tab: Overview      -> hours summary, syllabus progress, next lesson, alerts
  Tab: Flight log    -> CAA logbook table, "Add flight" button
  Tab: Syllabus      -> Ex 1–19 with status per exercise, last flown, grade
  Tab: Documents     -> medicals/licenses with expiry traffic lights
  Tab: Endorsements  -> solo sign-offs and type endorsements
  Tab: Theory        -> 9 exam results
/cms/logbook                     -> school-wide logbook feed (all flights, filterable)
/cms/expiries                    -> dashboard: medicals/licenses expiring in 30/60/90 days
```

## "Add flight" form (the workhorse)

A single form that captures one CAA-compliant log entry in ~30 seconds:

- Student + Aircraft (dropdowns) → autofill registration + type
- Date, Dep aerodrome + off-blocks, Arr aerodrome + on-blocks → auto-compute total time
- Capacity (Dual / PIC / P-u/t / PICUS / Instructor)
- Landings day + night, night minutes, IFR minutes
- Function time auto-derived from capacity + aircraft class (editable)
- Exercises covered (multi-select Ex 1–19) + grade per exercise
- Remarks
- Instructor signs by submitting (logged-in user recorded as signatory)

Saving updates the student's syllabus progress + hours summary automatically.

## Student-facing additions (later, optional)

Students can view (read-only) their own logbook, syllabus progress, and document expiries inside `/booking/dashboard`. Not in this first build — flagged for follow-up.

## Suggested build order

1. **Migration**: create the 7 tables + RLS + seed `syllabus_exercises` (Ex 1–19) + standard PPL theory exams
2. **Student management**: `/cms/students` list + `/cms/students/$id` overview tab
3. **Flight log**: "Add flight" form + logbook table view on student page
4. **Syllabus tracking**: exercise progress driven by flight entries
5. **Documents + expiry dashboard**: `/cms/expiries`
6. **Endorsements + theory exams** tabs
7. **Polish**: school-wide `/cms/logbook` feed + CSV export (for CAA inspection / personal logbook reconciliation)

## Technical notes

- Server functions in `src/lib/students.functions.ts`, `flight-log.functions.ts`, `documents.functions.ts` using `requireSupabaseAuth` + Zod validation on every input.
- Times stored as UTC; total time computed server-side from off/on-blocks to avoid client clock drift.
- Function-time auto-derivation: e.g. capacity=Dual + aircraft class=SE → `dual_received_min = total_min`, `single_pilot_se_min = total_min`. Editable to handle edge cases (multi-crew, IFR portions).
- Aircraft already has `registration` + `model` — reuse.
- "Instructor signature" = `signed_by_user_id` + `signed_at` (auditable; we can add cryptographic signature later if CAA inspection ever needs it, but a timestamped user record satisfies digital logbook practice for school records).
- CSV export uses standard CAA logbook column order so students can transcribe into their personal paper/EASA logbook.

## Out of scope for now

- Booking → auto-create flight entry on completion (nice future link)
- Aircraft tech log / defects
- Student self-service logbook view
- Digital signature with cryptographic verification
- Email reminders for expiring documents

---

Approve and I'll start with **step 1 (migration + seed data)**, then walk through each chunk so you can review the UI before moving on.
