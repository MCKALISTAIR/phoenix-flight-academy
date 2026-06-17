import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/marketing/for-schools")({
  head: () => ({
    meta: [
      { title: "For flight schools — Skyline" },
      {
        name: "description",
        content:
          "Why flight schools choose Skyline: built for ATOs, DTOs and self-fly hire. Migrate from spreadsheets and three different calendars in a week.",
      },
      { property: "og:title", content: "For flight schools — Skyline" },
      {
        property: "og:description",
        content:
          "Built for ATOs, DTOs and self-fly hire. Migrate in a week, run calmer operations from day one.",
      },
    ],
  }),
  component: ForSchoolsPage,
});

function ForSchoolsPage() {
  return (
    <>
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Built for the way flight schools actually operate.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We talked to dozens of ATOs, DTOs and self-fly hire operators
            before writing a line of code. Skyline reflects the workflows that
            kept coming up — not generic SaaS templates pretending to fit.
          </p>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <Pillar
              title="If you train ab-initio students"
              points={[
                "Per-student record from enrolment to checkride",
                "Theory exam tracking with pass / fail and resits",
                "Document expiry alerts: Class 1/2 medicals, SPL, R/T",
                "Endorsements: first solo, solo nav, type, night rating",
                "Digital flight log signed by the instructor on the day",
              ]}
            />
            <Pillar
              title="If you run experience flights"
              points={[
                "Online booking with deposits and gift voucher support",
                "Configurable products: 30 min, 60 min, R44, aerobatic",
                "Cancellation windows enforced automatically",
                "Customer captures next-of-kin and weight at checkout",
                "Airfield-closed banner you control from your phone",
              ]}
            />
            <Pillar
              title="If you operate self-fly hire"
              points={[
                "Customer uploads licence + medical with documents",
                "You approve — they unlock self-hire bookings",
                "Bookings auto-block if their documents expire",
                "Wet rate per aircraft drives the booking price",
                "Block bookings and recurring slots supported",
              ]}
            />
            <Pillar
              title="If you employ instructors"
              points={[
                "Per-instructor calendar with availability rules",
                "Resource blocks for sim, ground school, leave",
                "Instructor fee per hour rolls into the booking total",
                "Audit trail of who flew, who signed, who endorsed",
                "Role-based access: owners, admins, instructors",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Migrating in is the easy part.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We'll import your fleet, instructors, products and students from
            spreadsheets or your current system. Most schools are live within a
            week. We sit with you on launch day.
          </p>
          <div className="mt-8">
            <Link
              to="/marketing/contact"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Talk to us about migration <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Pillar({ title, points }: { title: string; points: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}