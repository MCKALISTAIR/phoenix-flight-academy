import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plane,
  Calendar,
  Users,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/marketing/")({
  head: () => ({
    meta: [
      { title: "Skyline — The operations platform for flight schools" },
      {
        name: "description",
        content:
          "Run your flight school on one platform: bookings, fleet, students, instructors, payments and compliance. Built by pilots, for schools.",
      },
      { property: "og:title", content: "Skyline — The operations platform for flight schools" },
      {
        property: "og:description",
        content:
          "Run your flight school on one platform: bookings, fleet, students, instructors, payments and compliance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketingHome,
});

function MarketingHome() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Now in pilot with schools across the UK
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              The operations platform built for flight schools.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Skyline replaces spreadsheets, paper folders and three different
              calendars with one system for bookings, fleet, students,
              instructors and compliance.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/marketing/contact"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start free 30-day trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/marketing/features"
                className="inline-flex h-11 items-center rounded-md border border-input bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required. Move your school onto Skyline in a week.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Everything your school runs on.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Skyline is opinionated about how a modern flight school operates,
              and flexible where you need it.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / outcomes */}
      <section className="border-b border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3">
          {[
            { value: "60%", label: "less admin time per week" },
            { value: "24/7", label: "online booking for your customers" },
            { value: "1 system", label: "instead of five spreadsheets" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-5xl font-semibold text-foreground">{m.value}</div>
              <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to run a calmer flight school?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Book a 20-minute demo. We'll show you Skyline running with real
            flight-school data and answer every question you have.
          </p>
          <div className="mt-8">
            <Link
              to="/marketing/contact"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  {
    icon: Calendar,
    title: "Bookings & availability",
    body:
      "Online booking with aircraft and instructor availability rules, deposits, promos and cancellation windows.",
  },
  {
    icon: Plane,
    title: "Fleet management",
    body:
      "Hours, maintenance windows, 50/100hr inspections and serviceability — visible at a glance.",
  },
  {
    icon: Users,
    title: "Students & instructors",
    body:
      "Student progress, instructor schedules, theory exams, endorsements and document expiry tracking.",
  },
  {
    icon: ClipboardList,
    title: "Digital flight log",
    body:
      "EASA-style entries with exercise grading, signed by the instructor and synced to the student's record.",
  },
  {
    icon: ShieldCheck,
    title: "Pilot verification & self-hire",
    body:
      "Customers upload licences and medicals. You approve. They unlock self-hire bookings automatically.",
  },
  {
    icon: Sparkles,
    title: "Your brand, your site",
    body:
      "A customer-facing site for your school — fleet, instructors, products, promotions — editable in the CMS.",
  },
];