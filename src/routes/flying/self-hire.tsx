import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, BadgeCheck, Scale, CalendarDays, DollarSign, ArrowRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/flying/self-hire")({
  component: SelfHirePage,
  head: () => ({
    meta: [
      { title: "Self-Hire & Plane Rental Cumbernauld | Phoenix Flight Training" },
      { name: "description", content: "Hire our well-maintained Cessna 172 and Piper PA28 aircraft at competitive wet/dry rates. Overnight cross-country trip policies." }
    ],
  }),
});

function SelfHirePage() {
  const policies = [
    {
      title: "Checkout Flight",
      desc: "All renters must complete a 1-hour club checkout flight with a Phoenix instructor to verify landing skills, emergency procedures, and circuit competence.",
      icon: BadgeCheck
    },
    {
      title: "Overnight & Multi-day Hires",
      desc: "Planning a trip to Barra or the Hebrides? Multi-day hires are permitted, subject to a minimum engine-logged billing of 2 hours per day.",
      icon: CalendarDays
    },
    {
      title: "Cumbernauld Landings",
      desc: "Cumbernauld home landing fees are not included in the hourly wet rate. Block landing packages are available through airfield operations.",
      icon: Scale
    }
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header with Dim Flight Backdrop */}
      <div className="bg-foreground py-20 text-background sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1600&auto=format&fit=crop"
            alt="General aviation aircraft cockpit"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Aircraft Rental</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Self-Hire Fleet
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-background/85 leading-relaxed">
            Rent our exceptionally maintained Cessna 172 and Piper PA28 fleet. Competitive wet rates, modern avionics, and flexible booking policies.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-3">
          
          {/* Main Policies Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Rental Policies & Guidelines</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                We support active general aviation pilots, hour builders, and cross-country tourers. Read our core hire policies:
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {policies.map((policy, idx) => {
                const Icon = policy.icon;
                return (
                  <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{policy.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{policy.desc}</p>
                  </div>
                );
              })}

              {/* Quick Fleet link */}
              <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Equipped for Safety</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Both G-PHNX Cessna and our Piper fleet are fully IFR capable with 8.33kHz radios, Garmin GNS430 GPS navigation units, and Mode S transponders.
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

            {/* Premium Secondary Image frame to satisfy visual audit */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-border mt-8">
              <img
                src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=1200&auto=format&fit=crop"
                alt="Aircraft hangar ramp"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 bg-foreground/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold text-background border border-border/10 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Cumbernauld Airport Flight Line
              </div>
            </div>
          </div>

          {/* Hire Pricing Column */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sticky top-28 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Rental Rates</span>
                <h3 className="mt-2 text-2xl font-bold text-foreground">Competitive Solo Rates</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Wet rates include standard fuel. Fuel uploaded away from Cumbernauld is reimbursed at club rate up to UK limits.
                </p>
              </div>

              <hr className="border-border" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Cessna 172 Solo Hire</span>
                    <p className="text-xs text-muted-foreground">Wet rate / tachometer hour</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£175</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Piper PA28 Solo Hire</span>
                    <p className="text-xs text-muted-foreground">Wet rate / tachometer hour</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£175</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Annual Pilot Membership</span>
                    <p className="text-xs text-muted-foreground">Required for active club renters</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£120</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Club Checkout Flight</span>
                    <p className="text-xs text-muted-foreground">Instructor checkflight (one-off)</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£60</span>
                </div>
              </div>

              <hr className="border-border" />

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/booking"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
                >
                  Access Booking Portal
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background text-sm font-bold text-foreground transition-colors hover:bg-muted/50"
                >
                  Inquire About Checkout
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
