import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Cpu, Gauge } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    name: a.model,
    tagline: `${a.registration}${a.tagline ? ` • ${a.tagline}` : ""}`,
    image: a.image_url || "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=900&auto=format&fit=crop",
    desc: a.description ?? "",
    specs: [
      { label: "Engine", value: a.engine ?? "—" },
      { label: "Cruising Speed", value: a.cruise_speed ?? "—" },
      { label: "Max Seats", value: a.max_seats ?? "—" },
      { label: "Fuel Burn", value: a.fuel_burn ?? "—" },
    ],
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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    const cards = document.querySelectorAll("[data-plane-index]");
    cards.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [fleet.length]);

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header with real image */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"
            alt="Aircraft hangar row"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Airfield Fleet</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Our Training & Hire Fleet
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Train and tour in aircraft optimised for maximum structural safety and mechanical reliability. Fully certified for flight operations at Cumbernauld.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {fleet.map((plane, idx) => {
            const isVisible = visiblePlanes.includes(idx);
            // Alternate: even planes slide from left, odd from right
            const fromLeft = idx % 2 === 0;

            return (
              <div
                key={idx}
                data-plane-index={idx}
                className={`flex flex-col lg:flex-row gap-12 items-start rounded-3xl border border-border bg-card p-6 lg:p-10 shadow-sm transition-all duration-800 ease-out hover:shadow-md hover:border-primary/10 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : `opacity-0 ${fromLeft ? "-translate-x-12" : "translate-x-12"}`
                }`}
                style={{ transitionDuration: "800ms" }}
              >
                {/* Photo section */}
                <div className="w-full lg:w-[45%] flex-shrink-0">
                  <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-muted shadow-inner relative group">
                    <img
                      src={plane.image}
                      alt={plane.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm text-slate-100 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                      Active Flight Status
                    </div>
                    {/* Shimmer overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="flex-1 space-y-8 w-full">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">{plane.tagline}</span>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{plane.name}</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">{plane.desc}</p>
                  </div>

                  {/* Specs Grid — each item individually fades in */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-6">
                    {plane.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className={`flex gap-3 items-center transition-all duration-500 ease-out ${
                          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                        }`}
                        style={{ transitionDelay: `${200 + sIdx * 80}ms` }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-primary">
                          <Gauge className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-muted-foreground">{spec.label}</span>
                          <span className="text-sm font-bold text-foreground">{spec.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Avionics Badges — stagger in */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                      <Cpu className="h-4 w-4 text-primary" />
                      Cockpit Avionics & Equipment
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {plane.avionics.map((av, avIdx) => (
                        <span
                          key={avIdx}
                          className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-500 hover:bg-muted hover:border-primary/30 ${
                            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                          }`}
                          style={{ transitionDelay: `${400 + avIdx * 60}ms` }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          {av}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Link
                      to="/booking"
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
                    >
                      Book This Plane
                    </Link>
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
