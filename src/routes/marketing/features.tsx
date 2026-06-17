import { createFileRoute } from "@tanstack/react-router";
import {
  Plane,
  Calendar,
  Users,
  ClipboardList,
  ShieldCheck,
  CreditCard,
  Layers,
  FileCheck,
  CloudSun,
} from "lucide-react";

export const Route = createFileRoute("/marketing/features")({
  head: () => ({
    meta: [
      { title: "Features — Skyline" },
      {
        name: "description",
        content:
          "Bookings, fleet, students, instructors, payments, verification and a customer-facing site — everything a modern flight school needs.",
      },
      { property: "og:title", content: "Features — Skyline" },
      {
        property: "og:description",
        content:
          "Bookings, fleet, students, instructors, payments, verification and a customer-facing site for your school.",
      },
    ],
  }),
  component: FeaturesPage,
});

const GROUPS = [
  {
    icon: Calendar,
    title: "Bookings engine",
    bullets: [
      "Customer self-service booking with real-time availability",
      "Aircraft and instructor calendars, with resource block-outs",
      "Deposits, full payment or invoice — configurable per product",
      "Promo codes, package pricing and recurring lessons",
    ],
  },
  {
    icon: Plane,
    title: "Fleet",
    bullets: [
      "Aircraft register with hours, status and serviceability",
      "50hr / 100hr / annual inspection tracking with reminders",
      "AOG and maintenance blocks visible across the calendar",
      "Wet rates per aircraft feed into your booking prices",
    ],
  },
  {
    icon: Users,
    title: "Students",
    bullets: [
      "Student records with licence sought and progress",
      "Theory exam results with pass/fail tracking",
      "Document store with expiry alerts (medicals, licences)",
      "Endorsements: first solo, solo nav, type, night rating",
    ],
  },
  {
    icon: ClipboardList,
    title: "Digital flight log",
    bullets: [
      "EASA-style entries: capacity, IFR/night, day/night landings",
      "Per-exercise grading against your syllabus",
      "Auto-computed totals: dual, PIC, single/multi pilot, IFR",
      "Signed by instructor, visible to student",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Pilot verification & self-hire",
    bullets: [
      "Customers upload licence + medical with documents",
      "Staff review and approve from the CMS",
      "Approval grants self-hire and promotes their account",
      "Bookings are blocked when documents expire",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    bullets: [
      "Card payment for deposits and full balances",
      "Invoice mode for established clients and block bookings",
      "Refunds and cancellations within your policy windows",
      "Reconciliation per booking and per customer",
    ],
  },
  {
    icon: Layers,
    title: "Customer-facing site",
    bullets: [
      "Fleet, instructors, products and promotions, all editable",
      "Booking flows for experience flights, lessons and self-hire",
      "Airfield status banner you can flip in seconds",
      "Your domain, your brand, no Skyline badge",
    ],
  },
  {
    icon: FileCheck,
    title: "Compliance",
    bullets: [
      "Document expiry tracking across the whole student base",
      "Audit trail for verifications and self-hire approvals",
      "Revision history on every CMS publish",
      "Role-based access for owners, admins and instructors",
    ],
  },
  {
    icon: CloudSun,
    title: "Operations",
    bullets: [
      "Closed-date and airfield status controls",
      "Resource blocks for unavailable aircraft or instructors",
      "Cancellation reason capture for analytics",
      "Multi-tenant: your data is yours, isolated by org",
    ],
  },
];

function FeaturesPage() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            One platform. Every workflow your school runs on.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Skyline is the system of record for your fleet, your customers,
            your students and your money. Each area connects to the next.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title} className="rounded-xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <g.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold">{g.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {g.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}