import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, HeartHandshake, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Our Team & CFI | Phoenix Flight Training" },
      { name: "description", content: "Meet the professional flight operations team at Cumbernauld Airport. Experienced instructors dedicated to flight safety and PPL mentoring." }
    ],
  }),
});

function useScrollReveal(selector: string, totalCount: number) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-reveal-index") || "0", 10);
            setVisible((prev) => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, totalCount]);

  return visible;
}

function AboutPage() {
  const values = [
    {
      title: "Safety First",
      desc: "Our primary, non-negotiable metric. We train pilots to be risk-aware, checklist-focused, and operationally rigorous.",
      icon: ShieldCheck
    },
    {
      title: "Patience & Empathy",
      desc: "Flight training is highly demanding. We believe that learning flows from supportive, constructive flight deck instruction.",
      icon: HeartHandshake
    },
    {
      title: "Cumbernauld Focus",
      desc: "Based at Cumbernauld, we leverage local Scottish terrain, coastal winds, and uncontrolled airspace to build resilient airmen.",
      icon: Compass
    }
  ];

  const { data: instructorRows = [] } = useQuery({
    queryKey: ["instructors", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const instructors = instructorRows.map((i) => ({
    name: i.name,
    role: i.role ?? "Flight Instructor",
    hours: i.hours ?? "",
    image: i.image_url ?? "",
    bio: i.bio ?? "",
  }));

  const visibleValues = useScrollReveal("[data-reveal-value]", values.length);
  const visibleInstructors = useScrollReveal("[data-reveal-instructor]", instructors.length);

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header with image backdrop */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1533745848184-3db07256e163?q=80&w=1600&auto=format&fit=crop"
            alt="Aviation team at Cumbernauld"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Phoenix Flight Training
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Professional general aviation mentorship based at Cumbernauld Airport, committed to forging confident, skilled, and safe pilots.
          </p>
        </div>
      </div>

      {/* Core Values — staggered entrance */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {values.map((val, idx) => {
            const Icon = val.icon;
            const isVisible = visibleValues.includes(idx);
            return (
              <div
                key={idx}
                data-reveal-value
                data-reveal-index={idx}
                className={`group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-md hover:border-primary/20 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{val.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{val.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Instructor Bios — staggered reveal from bottom */}
        <div className="mt-24 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Instructors</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Meet Your Flight Deck Team</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every instructor at Phoenix holds full CAA certification and is deeply experienced flying in the challenging and beautiful Scottish airspace.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 pt-6">
            {instructors.map((ins, idx) => {
              const isVisible = visibleInstructors.includes(idx);
              return (
                <div
                  key={idx}
                  data-reveal-instructor
                  data-reveal-index={idx}
                  className={`group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 ${
                    isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.97]"
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  {/* Photo frame with scale-on-hover */}
                  <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                    <img
                      src={ins.image}
                      alt={ins.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 right-4 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold text-slate-100 border border-white/10 shadow-sm">
                      {ins.hours}
                    </div>
                  </div>

                  {/* Profile detail */}
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{ins.role}</span>
                    <h3 className="mt-1 text-xl font-bold text-foreground">{ins.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground flex-1">{ins.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
