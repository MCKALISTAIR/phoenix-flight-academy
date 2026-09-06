import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Cpu,
  Gauge,
  ArrowRight,
  Activity,
  ChevronDown,
  ChevronUp,
  Eye,
  Plane,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
  head: () => ({
    meta: [
      { title: "Fleet Technical Specifications & Avionics | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Cumbernauld EGPG training and hire airframe. Piper PA-28 Cherokee / Archer with complete V-speeds placarding, engine telemetry, and avionics suite.",
      },
    ],
  }),
});

interface VSpeed {
  label: string;
  speed: string;
  desc: string;
}

const PA28_V_SPEEDS: VSpeed[] = [
  { label: "Vso", speed: "44 KIAS", desc: "Stall speed (landing config with full flaps)" },
  { label: "Vs", speed: "50 KIAS", desc: "Stall speed (clean configuration)" },
  { label: "Vx", speed: "63 KIAS", desc: "Best angle of climb" },
  { label: "Vy", speed: "79 KIAS", desc: "Best rate of climb" },
  { label: "Va", speed: "111 KIAS", desc: "Maneuvering speed (at max gross weight)" },
  { label: "Vfe", speed: "103 KIAS", desc: "Maximum flap extended speed" },
  { label: "Vno", speed: "126 KIAS", desc: "Maximum structural cruising speed" },
  { label: "Vne", speed: "160 KIAS", desc: "Never exceed speed" },
];

function FleetPage() {
  const [expandedSpecs, setExpandedSpecs] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const { data: fleetRows = [], isLoading } = useQuery({
    queryKey: ["aircraft", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aircraft")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const dbPa28 = fleetRows.find((a) => {
    const m = (a.model || "").toLowerCase();
    return (
      m.includes("pa-28") ||
      m.includes("pa28") ||
      m.includes("piper") ||
      m.includes("cherokee") ||
      m.includes("archer")
    );
  });

  const plane = {
    id: dbPa28?.id || "piper-pa28",
    registration: dbPa28?.registration || "G-BCDF",
    model: dbPa28?.model || "Piper PA-28-181 Cherokee Archer III",
    wingType: "Low-Wing Configuration",
    handlingHighlight:
      "The low-wing design provides unrestricted overhead sky visibility when banking into turns over the Scottish Highlands. In ground effect during flare, the natural air cushion makes smooth, predictable touchdown landings intuitive on Cumbernauld's 820m runway.",
    tagline: dbPa28?.tagline || "Dedicated Low-Wing Training & Touring Platform",
    image:
      dbPa28?.image_url && !dbPa28.image_url.includes("photo-1540962351504-03099e0a754b")
        ? dbPa28.image_url
        : "/images/piper-pa28-apron.jpg",
    desc:
      dbPa28?.description ||
      "The Piper PA-28 Cherokee / Archer is the definitive low-wing general aviation workhorse. Equipped with robust dual controls, four-place seating, and reliable Lycoming power, it serves as Phoenix Flight Academy's dedicated airframe for introductory flights, PPL and LAPL syllabus training, and qualified pilot self-hire.",
    status: dbPa28?.status || "serviceable",
    hours: dbPa28?.hours || 3125.8,
    next50hr: dbPa28?.next_50hr || 3150.0,
    nextAnnual: dbPa28?.next_annual || "2026-10-15",
    rateWet: dbPa28?.rate_wet || 185,
    specs: [
      { label: "Powerplant", value: dbPa28?.engine || "Lycoming O-360 4-Cylinder (180 HP)" },
      { label: "Cruising Speed", value: dbPa28?.cruise_speed || "115 KTAS (132 mph)" },
      { label: "Occupancy", value: `${dbPa28?.max_seats || 4} Seats (1 Pilot + 3 Pax)` },
      { label: "Fuel Capacity", value: "189 Litres / 50 USG (AVGAS 100LL)" },
    ],
    vSpeeds: PA28_V_SPEEDS,
    avionics: dbPa28?.avionics?.length
      ? dbPa28.avionics
      : [
          "Traditional Steam Gauge Flight Instruments",
          "Trig TT31 Mode S Transponder",
          "8.33 kHz Radio with Intercom",
          "Dual VOR / LOC Navigation Indicators",
          "Dual Altimeters (IFR Capable)",
          "Century IIB Autopilot System",
        ],
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isServiceable = plane.status === "serviceable";

  return (
    <div className="flex flex-col bg-background pb-24">
      {/* Aerodrome Fleet Header */}
      <div className="bg-surface-navy py-20 text-white sm:py-24 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/cumbernauld-runway-approach.jpg"
            alt="Cumbernauld Airport Runway 08 threshold and apron approach"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-navy via-surface-navy/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-primary border border-white/15 backdrop-blur-sm mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            EGPG FLEET REGISTRY | Cumbernauld Airport
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Our Training & Hire Fleet
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80 leading-relaxed">
            Maintained strictly to UK CAA and Part-ML airworthiness standards. Equipped with modern
            8.33 kHz communications, dual flight controls, and high-performance touring endurance.
          </p>
        </div>
      </div>

      {/* Fleet Airframe Dossier */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Airframe Configuration Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              Dedicated Training Airframe
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Aircraft Cockpit & Performance Inspector
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Single Dedicated Airframe
            </Badge>
            <Badge variant="operational" className="text-xs">
              100% Part-ML Airworthy
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[600px] w-full animate-pulse rounded-xl border border-border bg-muted/20" />
        ) : (
          <div
            className={`overflow-hidden rounded-xl border border-border bg-card shadow-none transition-all duration-700 ease-out hover:border-primary/30 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Top Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-6 py-3.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-black tracking-tight text-foreground">
                  {plane.registration}
                </span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {plane.model}
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase text-muted-foreground border border-border hidden sm:inline-block">
                  {plane.wingType}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {plane.rateWet && (
                  <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                    £{Number(plane.rateWet).toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground">/hr wet</span>
                  </span>
                )}
                <Badge variant={isServiceable ? "operational" : "caution"}>
                  {isServiceable ? "SERVICEABLE" : plane.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
              {/* Ramp Photo & Airframe Sightlines (5 cols) */}
              <div className="space-y-4 lg:col-span-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={plane.image}
                    alt={`${plane.registration} ${plane.model}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-surface-navy/90 px-2.5 py-1 text-[11px] font-mono text-white border border-white/10">
                    <Activity className="h-3 w-3 text-primary" />
                    <span>Ramp Stand: EGPG Main Apron</span>
                  </div>
                </div>

                {/* Cockpit Sightlines & Handling Ergonomics */}
                <div className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Cockpit Sightlines & Ergonomics</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {plane.handlingHighlight}
                  </p>
                </div>

                {plane.desc && (
                  <p className="text-xs leading-relaxed text-muted-foreground">{plane.desc}</p>
                )}
              </div>

              {/* Technical Spec Sheet & Performance (7 cols) */}
              <div className="space-y-6 lg:col-span-7">
                {/* Performance Telemetry Grid */}
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Aircraft Performance Telemetry
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-2">
                    {plane.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Gauge className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-[10.5px] font-medium text-muted-foreground uppercase tracking-wider">
                            {spec.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                            {spec.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cockpit Avionics */}
                <div>
                  <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    Cockpit Avionics Suite
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {plane.avionics.map((av, avIdx) => (
                      <span
                        key={avIdx}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        {av}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Collapsible Pilot Technical Telemetry & POH V-Speeds Drawer */}
                <div className="border border-border rounded-lg bg-card overflow-hidden shadow-none">
                  <button
                    type="button"
                    onClick={() => setExpandedSpecs((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Plane className="h-3.5 w-3.5 text-primary" />
                      Pilot Technical Telemetry & POH V-Speeds
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{expandedSpecs ? "Hide Telemetry" : "View Operating Limits"}</span>
                      {expandedSpecs ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {expandedSpecs && (
                    <div className="p-4 border-t border-border bg-muted/15 space-y-4">
                      {/* V-Speeds Placard */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Operating Limitations (V-Speeds Placard)
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            POH CAS / KIAS
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {plane.vSpeeds.map((v) => (
                            <div
                              key={v.label}
                              className="rounded-md border border-border bg-card p-2 text-center shadow-none"
                              title={v.desc}
                            >
                              <span className="block font-mono text-[10px] font-bold text-primary uppercase">
                                {v.label}
                              </span>
                              <span className="block font-mono text-xs font-extrabold text-foreground tabular-nums">
                                {v.speed}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Airframe Tech Log Strip */}
                      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card p-2.5 text-center shadow-none">
                        <div>
                          <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Airframe Tach
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                            {plane.hours ? `${Number(plane.hours).toFixed(1)} hrs` : "3,125.8 hrs"}
                          </span>
                        </div>
                        <div className="border-x border-border">
                          <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Next 50-Hr
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                            {plane.next50hr
                              ? `${Number(plane.next50hr).toFixed(1)} hrs`
                              : "3,150.0 hrs"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                            ARC Renewal
                          </span>
                          <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                            {plane.nextAnnual
                              ? new Date(plane.nextAnnual).toLocaleDateString("en-GB", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Oct 2026"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground">
                    Fuel capacity:{" "}
                    <span className="font-mono font-semibold text-foreground">189 L (50 USG)</span>
                  </div>
                  <Button asChild size="sm">
                    <Link to="/booking">
                      Reserve {plane.registration} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
