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

  const fleet = fleetRows.map((a) => ({
    id: a.id,
    registration: a.registration,
    model: a.model,
    tagline: a.tagline || "Training & Self-Hire Airframe",
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
      { label: "Powerplant", value: a.engine ?? "Lycoming 4-Cylinder" },
      { label: "Cruising Speed", value: a.cruise_speed ?? "110 KTAS" },
      { label: "Occupancy", value: `${a.max_seats ?? 4} Seats (Crew + Pax)` },
      { label: "Fuel Consumption", value: a.fuel_burn ?? "32.0 L/HR (AVGAS 100LL)" },
    ],
    vSpeeds: getVSpeeds(a.model),
    avionics: a.avionics ?? [],
  }));

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
  }, [fleet.length]);

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
            Training & Self-Hire Fleet
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80 leading-relaxed">
            Maintained to statutory Part-ML & UK CAA airworthiness standards. Equipped with modern
            8.33 kHz communication, Garmin avionics, and calibrated flight instrumentation.
          </p>
        </div>
      </div>

      {/* Fleet Airframe Dossiers */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {fleet.map((plane, idx) => {
            const isVisible = visiblePlanes.includes(idx);
            const isServiceable = plane.status === "serviceable";

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
                  {/* Ramp Photo & Airframe Status (5 cols) */}
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

                    {/* Airframe Tech Log Strip */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/20 p-3 text-center">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Airframe Tach
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                          {plane.hours ? `${plane.hours.toFixed(1)} hrs` : "3,420.5 hrs"}
                        </span>
                      </div>
                      <div className="border-x border-border">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Next 50-Hr
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                          {plane.next50hr ? `${plane.next50hr.toFixed(1)} hrs` : "3,450.0 hrs"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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

                    {plane.desc && (
                      <p className="text-xs leading-relaxed text-muted-foreground">{plane.desc}</p>
                    )}
                  </div>

                  {/* Technical Spec Sheet & V-Speeds (7 cols) */}
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

                    {/* V-Speeds Placard (ForeFlight / POH Style) */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Operating Limitations (V-Speeds Placard)
                        </h3>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          POH CAS / KIAS
                        </span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-4 gap-2 rounded-lg border border-border bg-muted/15 p-2.5">
                        {plane.vSpeeds.map((v) => (
                          <div
                            key={v.label}
                            className="rounded-md border border-border/60 bg-card p-2 text-center"
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

                    {/* Action Footer */}
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="text-xs text-muted-foreground">
                        Standard fuel tank capacity:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          144 L (38 USG)
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
