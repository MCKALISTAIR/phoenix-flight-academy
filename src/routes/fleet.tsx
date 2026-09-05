import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Cpu,
  Gauge,
  Clock,
  Shield,
  ArrowRight,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Compass,
  Plane,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
  head: () => ({
    meta: [
      { title: "Fleet Technical Specifications & Avionics | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Cumbernauld EGPG training and hire fleet. Cessna 172 and Piper PA28 airframes with complete V-speeds placarding, engine telemetry, and avionics suites.",
      },
    ],
  }),
});

interface VSpeed {
  label: string;
  speed: string;
  desc: string;
}

const V_SPEEDS: Record<string, VSpeed[]> = {
  c172: [
    { label: "Vso", speed: "40 KIAS", desc: "Stall speed (landing config)" },
    { label: "Vs", speed: "48 KIAS", desc: "Stall speed (clean)" },
    { label: "Vx", speed: "62 KIAS", desc: "Best angle of climb" },
    { label: "Vy", speed: "74 KIAS", desc: "Best rate of climb" },
    { label: "Va", speed: "99 KIAS", desc: "Maneuvering speed" },
    { label: "Vfe", speed: "85 KIAS", desc: "Max flap extended" },
    { label: "Vno", speed: "127 KIAS", desc: "Max structural cruising" },
    { label: "Vne", speed: "158 KIAS", desc: "Never exceed speed" },
  ],
  pa28: [
    { label: "Vso", speed: "44 KIAS", desc: "Stall speed (landing config)" },
    { label: "Vs", speed: "50 KIAS", desc: "Stall speed (clean)" },
    { label: "Vx", speed: "63 KIAS", desc: "Best angle of climb" },
    { label: "Vy", speed: "79 KIAS", desc: "Best rate of climb" },
    { label: "Va", speed: "111 KIAS", desc: "Maneuvering speed" },
    { label: "Vfe", speed: "103 KIAS", desc: "Max flap extended" },
    { label: "Vno", speed: "126 KIAS", desc: "Max structural cruising" },
    { label: "Vne", speed: "160 KIAS", desc: "Never exceed speed" },
  ],
};

function getVSpeeds(model: string): VSpeed[] {
  const m = model.toLowerCase();
  if (m.includes("172") || m.includes("cessna")) return V_SPEEDS.c172;
  return V_SPEEDS.pa28;
}

function FleetPage() {
  const [visiblePlanes, setVisiblePlanes] = useState<number[]>([]);
  const [fleetFilter, setFleetFilter] = useState<"all" | "c172" | "pa28">("all");
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});

  const toggleSpecs = (id: string) => {
    setExpandedSpecs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: fleetRows = [] } = useQuery({
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

  const fleet = fleetRows.map((a) => {
    const isCessna =
      (a.model || "").toLowerCase().includes("172") ||
      (a.model || "").toLowerCase().includes("cessna");
    return {
      id: a.id,
      registration: a.registration,
      model: a.model,
      isCessna,
      wingType: isCessna ? "High-Wing Configuration" : "Low-Wing Configuration",
      handlingHighlight: isCessna
        ? "Panoramic downward visibility makes pilotage navigation and aerial sightseeing effortless. Inherent pendulum stability provides forgiving handling for initial student training."
        : "Unrestricted overhead sky visibility into banked turns. Low-wing ground cushion on flare provides predictable, buttery-smooth touchdown landings.",
      tagline:
        a.tagline || (isCessna ? "High-Wing Training & Touring" : "Low-Wing Cross-Country Cruiser"),
      image:
        a.image_url ||
        "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=900&auto=format&fit=crop",
      desc: a.description ?? "",
      status: a.status,
      hours: a.hours,
      next50hr: a.next_50hr,
      nextAnnual: a.next_annual,
      rateWet: a.rate_wet,
      specs: [
        { label: "Powerplant", value: a.engine ?? "Lycoming 4-Cylinder (160 HP)" },
        { label: "Cruising Speed", value: a.cruise_speed ?? "110 KTAS" },
        { label: "Occupancy", value: `${a.max_seats ?? 4} Seats (Crew + Pax)` },
        { label: "Fuel Consumption", value: a.fuel_burn ?? "32.0 L/HR (AVGAS 100LL)" },
      ],
      vSpeeds: getVSpeeds(a.model),
      avionics: a.avionics ?? [],
    };
  });

  const filteredFleet = fleet.filter((plane) => {
    if (fleetFilter === "all") return true;
    if (fleetFilter === "c172") return plane.isCessna;
    if (fleetFilter === "pa28") return !plane.isCessna;
    return true;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-plane-index") || "0", 10);
            setVisiblePlanes((prev) => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    const cards = document.querySelectorAll("[data-plane-index]");
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filteredFleet.length]);

  return (
    <div className="flex flex-col bg-background pb-24">
      {/* Aerodrome Fleet Header */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-24 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
            alt="Aircraft hangar row"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-md bg-surface-navy px-3 py-1.5 text-xs font-mono font-medium text-primary border border-white/10 mb-4">
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
            Maintained to UK CAA and Part-ML airworthiness standards. Equipped with modern 8.33 kHz
            communications, Garmin GPS avionics, and dual flight controls.
          </p>
        </div>
      </div>

      {/* Fleet Airframe Dossiers */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Wing Profile & Fleet Filter Controls */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
              Airframe Configuration
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              Aircraft Cockpit & Performance Inspector
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setFleetFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                fleetFilter === "all"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Airframes ({fleet.length})
            </button>
            <button
              type="button"
              onClick={() => setFleetFilter("c172")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                fleetFilter === "c172"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              High-Wing (Cessna 172)
            </button>
            <button
              type="button"
              onClick={() => setFleetFilter("pa28")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                fleetFilter === "pa28"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Low-Wing (Piper PA28)
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {filteredFleet.map((plane, idx) => {
            const isVisible = visiblePlanes.includes(idx);
            const isServiceable = plane.status === "serviceable";
            const isExpanded = !!expandedSpecs[plane.id || String(idx)];

            return (
              <div
                key={plane.id || idx}
                data-plane-index={idx}
                className={`overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-700 ease-out hover:border-primary/30 ${
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
                    <div className="border border-border rounded-lg bg-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSpecs(plane.id || String(idx))}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Plane className="h-3.5 w-3.5 text-primary" />
                          Pilot Technical Telemetry & POH V-Speeds
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{isExpanded ? "Hide Telemetry" : "View Operating Limits"}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
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
                                  className="rounded-md border border-border bg-card p-2 text-center"
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
                          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card p-2.5 text-center">
                            <div>
                              <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Airframe Tach
                              </span>
                              <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                                {plane.hours ? `${plane.hours.toFixed(1)} hrs` : "3,420.5 hrs"}
                              </span>
                            </div>
                            <div className="border-x border-border">
                              <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Next 50-Hr
                              </span>
                              <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                                {plane.next50hr
                                  ? `${plane.next50hr.toFixed(1)} hrs`
                                  : "3,450.0 hrs"}
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
                                  : "Nov 2026"}
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
                        <span className="font-mono font-semibold text-foreground">
                          {plane.isCessna ? "144 L (38 USG)" : "189 L (50 USG)"}
                        </span>
                      </div>
                      <Link
                        to="/booking"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
                      >
                        Reserve {plane.registration} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
