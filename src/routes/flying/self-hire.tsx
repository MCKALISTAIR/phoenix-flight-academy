import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Scale,
  CalendarDays,
  ArrowRight,
  MapPin,
  ChevronDown,
  ClipboardCheck,
  UserCheck,
  PlaneTakeoff,
  CircleCheckBig,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/flying/self-hire")({
  component: SelfHirePage,
  head: () => ({
    meta: [
      { title: "Self-Hire & Plane Rental Cumbernauld | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Hire our well-maintained Cessna 172 and Piper PA28 aircraft at competitive wet/dry rates. Overnight cross-country trip policies.",
      },
    ],
  }),
});

const checkoutSteps = [
  {
    step: 1,
    title: "Apply Online",
    desc: "Submit your self-hire application via the booking portal with your license details and flight hours.",
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: "Document Verification",
    desc: "Bring your paper logbook, pilot license booklet, and valid medical certificate to the club for verification.",
    icon: UserCheck,
  },
  {
    step: 3,
    title: "1-Hour Checkout Flight",
    desc: "Complete a dual checkout flight with a Phoenix instructor covering circuits, emergencies, and local procedures.",
    icon: PlaneTakeoff,
  },
  {
    step: 4,
    title: "Approved & Flying",
    desc: "Once approved, book aircraft online anytime. You'll have full access to our Cessna 172 and Piper PA28 fleet.",
    icon: CircleCheckBig,
  },
];

const faqs = [
  {
    q: "What insurance is included?",
    a: "Full hull and third-party liability insurance is included in the wet hire rate. There is no excess for normal operations. Negligent damage may be subject to the pilot's personal liability as per club terms.",
  },
  {
    q: "How is fuel handled?",
    a: "Wet rates include standard Avgas uplift at Cumbernauld. If you refuel away from base, retain your receipt and we'll reimburse at the club fuel rate (currently £2.40/litre) up to the amount used.",
  },
  {
    q: "Can I fly overnight or multi-day trips?",
    a: "Yes — multi-day hires are encouraged for cross-country touring. A minimum daily billing of 2 tachometer hours applies. Please book multi-day trips at least 7 days in advance.",
  },
  {
    q: "What license do I need?",
    a: "You need a valid UK PPL(A), LAPL(A), or CPL/ATPL with a current Class 2 or LAPL medical. Student pilots are not eligible for self-hire but can book dual instruction flights.",
  },
  {
    q: "How far in advance can I book?",
    a: "Aircraft can be booked up to 4 weeks in advance via the online portal. Cancellations within 24 hours of the booking may incur a £30 slot-holding fee.",
  },
];

function SelfHirePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const policies = [
    {
      title: "Checkout Flight",
      desc: "All renters must complete a 1-hour club checkout flight with a Phoenix instructor to verify landing skills, emergency procedures, and circuit competence.",
      icon: BadgeCheck,
    },
    {
      title: "Overnight & Multi-day Hires",
      desc: "Planning a trip to Barra or the Hebrides? Multi-day hires are permitted, subject to a minimum engine-logged billing of 2 hours per day.",
      icon: CalendarDays,
    },
    {
      title: "Cumbernauld Landings",
      desc: "Cumbernauld home landing fees are not included in the hourly wet rate. Block landing packages are available through airfield operations.",
      icon: Scale,
    },
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1600&auto=format&fit=crop"
            alt="General aviation aircraft cockpit"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Aircraft Rental
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Self-Hire Fleet
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Rent our exceptionally maintained Cessna 172 and Piper PA28 fleet. Competitive wet
            rates, modern avionics, and flexible booking policies.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Checkout Process Timeline */}
        <div className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Getting Started
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">Checkout Process</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              From application to approved renter in four straightforward steps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {checkoutSteps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="relative group">
                  {s.step < 4 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border z-0" />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                      {s.step}
                    </div>
                    <h3 className="mt-3 font-bold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Main Policies Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">
                Rental Policies & Guidelines
              </h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                We support active general aviation pilots, hour builders, and cross-country tourers.
                Read our core hire policies:
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {policies.map((policy, idx) => {
                const Icon = policy.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{policy.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {policy.desc}
                    </p>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Equipped for Safety</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Both G-PHNX Cessna and our Piper fleet are fully IFR capable with 8.33kHz
                    radios, Garmin GNS430 GPS navigation units, and Mode S transponders.
                  </p>
                </div>
                <Link
                  to="/fleet"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  View Cockpit Avionics Specs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-border mt-8">
              <img
                src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=1200&auto=format&fit=crop"
                alt="Aircraft hangar ramp"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-3 left-3 bg-surface-navy/90 px-3 py-1.5 rounded-md text-xs font-mono text-white border border-white/10 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>EGPG Cumbernauld Flight Line</span>
              </div>
            </div>
          </div>

          {/* Hire Pricing Column */}
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-28 space-y-6">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  Rental Rates & Wet Hire
                </span>
                <h3 className="mt-1.5 text-xl font-bold text-foreground">Self-Hire Rates</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Wet rates include standard fuel. Fuel uploaded away from Cumbernauld is reimbursed
                  at club rate up to UK limits.
                </p>
              </div>

              <hr className="border-border" />

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Cessna 172 Skyhawk
                    </span>
                    <p className="text-[11px] text-muted-foreground">Wet rate / tachometer hour</p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £175.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Piper PA28 Cherokee
                    </span>
                    <p className="text-[11px] text-muted-foreground">Wet rate / tachometer hour</p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £175.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Annual Flying Membership
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Required for active club renters
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £120.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Club Checkout Flight
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      One-off dual checkout with instructor
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £60.00
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3.5 border border-border text-[11px] text-muted-foreground space-y-1">
                <span className="font-mono font-bold uppercase tracking-wider text-foreground block">
                  Currency Notice (Part-FCL.060)
                </span>
                <p>
                  Pilots must have logged 3 takeoffs and landings in the preceding 90 days on type
                  to carry passengers.
                </p>
              </div>

              <hr className="border-border" />

              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  to="/booking"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
                >
                  Access Booking Portal
                </Link>
                <Link
                  to="/contact"
                  search={{ subject: "self-hire" }}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background text-xs font-bold text-foreground transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-muted"
                >
                  Inquire About Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Self-Hire Questions
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    openFaq === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
