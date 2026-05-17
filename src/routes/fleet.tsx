import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Cpu, Gauge, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
  head: () => ({
    meta: [
      { title: "Our Fleet & Avionics Specs | Phoenix Flight Training" },
      { name: "description", content: "Explore the Cumbernauld-based Cessna 172 and Piper PA28 fleet. Full instrument, avionics, engine, and performance specifications." }
    ],
  }),
});

function FleetPage() {
  const fleet = [
    {
      name: "Cessna 172 Skyhawk",
      tagline: "G-PHNX • The World's Most Trusted Flight Trainer",
      image: "https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=800&auto=format&fit=crop",
      desc: "The Cessna 172 is the gold standard of flight education. Incredibly stable, forgiving, and predictable. Our aircraft (G-PHNX) is exceptionally maintained and serves as both our primary PPL navigation platform and solo-hire cruiser.",
      specs: [
        { label: "Engine", value: "Lycoming O-320 (160 HP)" },
        { label: "Cruising Speed", value: "105 kts (120 mph)" },
        { label: "Max Seats", value: "4 (1 Pilot + 3 Passengers)" },
        { label: "Fuel Burn", value: "Approx. 30L / hour" }
      ],
      avionics: [
        "Garmin GNS 430 WAAS GPS",
        "Traditional Steam Gauges",
        "Trig Mode S Transponder",
        "Century II Autopilot",
        "8.33kHz Compliant Radio",
        "Dual Altimeters (IFR)"
      ]
    },
    {
      name: "Piper PA28 Cherokee",
      tagline: "G-BCDF • High-Performance Low-Wing Cruiser",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800&auto=format&fit=crop",
      desc: "A low-wing alternative providing fantastic cruising visibility and responsive handling. Extremely popular for qualified pilots doing cross-country building across Scotland due to its high load carrying capacity and spacious cabin layout.",
      specs: [
        { label: "Engine", value: "Lycoming O-360 (180 HP)" },
        { label: "Cruising Speed", value: "115 kts (132 mph)" },
        { label: "Max Seats", value: "4 (1 Pilot + 3 Passengers)" },
        { label: "Fuel Burn", value: "Approx. 34L / hour" }
      ],
      avionics: [
        "Traditional Steam Gauges Panel",
        "Trig Mode S Transponder",
        "8.33kHz Radio",
        "Spacious Low-Wing Setup",
        "Dual VOR / ILS Nav Indicators"
      ]
    }
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header */}
      <div className="bg-foreground py-20 text-background sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.1),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Airfield Fleet</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Our Training & Hire Fleet
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-background/80 leading-relaxed">
            Train and tour in aircraft optimized for maximum structural safety and mechanical reliability. Fully certified for flight tracking at Cumbernauld.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {fleet.map((plane, idx) => (
            <div
              key={idx}
              className="flex flex-col lg:flex-row gap-12 items-start rounded-3xl border border-border bg-card p-6 lg:p-10 shadow-sm"
            >
              {/* Photo section */}
              <div className="w-full lg:w-[45%] flex-shrink-0">
                <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-muted shadow-inner relative group">
                  <img
                    src={plane.image}
                    alt={plane.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-foreground/90 backdrop-blur-sm text-background text-xs font-semibold px-3 py-1 rounded-full border border-border/20">
                    Active Flight Status
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="flex-1 space-y-8 w-full">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">{plane.tagline}</span>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{plane.name}</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">{plane.desc}</p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-6">
                  {plane.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex gap-3 items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Gauge className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-muted-foreground">{spec.label}</span>
                        <span className="text-sm font-bold text-foreground">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Avionics Badges Panel */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                    <Cpu className="h-4 w-4 text-primary" />
                    Cockpit Avionics & Equip
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {plane.avionics.map((av, avIdx) => (
                      <span
                        key={avIdx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {av}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link
                    to="/booking"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
                  >
                    Book This Plane
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
