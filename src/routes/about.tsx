import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ShieldCheck, HeartHandshake, Compass } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Our Team & CFI | Phoenix Flight Training" },
      { name: "description", content: "Meet the professional flight operations team at Cumbernauld Airport. Experienced instructors dedicated to flight safety and PPL mentoring." }
    ],
  }),
});

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

  const instructors = [
    {
      name: "Captain Andrew McKay",
      role: "CFI • Chief Flying Instructor",
      hours: "4,500+ Hours",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
      bio: "Ex-commercial pilot with over 15 years teaching at Cumbernauld Airport. Andrew specializes in high-latitude cross-country navigation and advanced pilot training checkout safety."
    },
    {
      name: "Captain Sarah Jenkins",
      role: "Senior Flight Instructor",
      hours: "2,800+ Hours",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
      bio: "Sarah is a specialist in solo-flight preparation, PPL ground-school instruction, and confidence-building training blocks. Her deep background is in flight deck meteorology."
    },
    {
      name: "Captain David Smith",
      role: "Line Flight Instructor",
      hours: "1,200+ Hours",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      bio: "An expert on Piper low-wing ratings, cockpit avionics mapping, and trial lessons. David brings an enthusiastic, energetic, and checklist-driven approach to every flight hour."
    }
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Header */}
      <div className="bg-foreground py-20 text-background sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.1),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Phoenix Flight Training
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-background/80 leading-relaxed">
            Professional general aviation mentorship based at Cumbernauld Airport, committed to forging confident, skilled, and safe pilots.
          </p>
        </div>
      </div>

      {/* Main Core Values */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{val.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{val.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Instructor Bios Grid Section */}
        <div className="mt-24 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Our Instructors</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Meet Your Flight Deck Instructors</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Every instructor at Phoenix holds full CAA certification and is deeply experienced flying in the challenging and beautiful Scottish airspace.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 pt-6">
            {instructors.map((ins, idx) => (
              <div
                key={idx}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                {/* Photo frame */}
                <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                  <img src={ins.image} alt={ins.name} className="h-full w-full object-cover" />
                  <div className="absolute bottom-4 right-4 rounded-full bg-foreground/95 px-3 py-1 text-xs font-bold text-background border border-border/20 shadow-sm">
                    {ins.hours}
                  </div>
                </div>

                {/* Profile detail */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{ins.role}</span>
                    <h3 className="mt-1 text-xl font-bold text-foreground">{ins.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ins.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
