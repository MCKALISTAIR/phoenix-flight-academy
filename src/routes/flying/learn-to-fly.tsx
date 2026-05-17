import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Calendar, CheckCircle2, ShieldCheck, HelpCircle, Award, Compass, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/flying/learn-to-fly")({
  component: LearnToFlyPage,
  head: () => ({
    meta: [
      { title: "Learn to Fly & PPL Syllabus | Phoenix Flight Training" },
      { name: "description", content: "Your complete roadmap to earning a Private Pilot License (PPL) at Cumbernauld Airport. Pricing, timelines, and prerequisites." }
    ],
  }),
});

function LearnToFlyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const milestones = [
    {
      num: "01",
      title: "The Trial Flight",
      desc: "Take the controls for the very first time. Get a briefing, fly with an instructor, and experience the pure joy of aviation.",
      icon: Sparkles,
      time: "Hour 1"
    },
    {
      num: "02",
      title: "Dual Instruction",
      desc: "Master takeoff, landing, climbs, turns, and stalling characteristics under the close guidance of your instructor.",
      icon: BookOpen,
      time: "Hours 2 - 15"
    },
    {
      num: "03",
      title: "The First Solo",
      desc: "An unforgettable milestone! Your instructor steps out, and you take the aircraft around the Cumbernauld circuit entirely on your own.",
      icon: ShieldCheck,
      time: "Hours 15 - 20"
    },
    {
      num: "04",
      title: "Cross-Country Navigation",
      desc: "Learn to navigate using chart, compass, and stopwatch. Fly land-away journeys to other airports across Scotland.",
      icon: Compass,
      time: "Hours 20 - 40"
    },
    {
      num: "05",
      title: "Skills Test & License",
      desc: "Complete your ground exams, refine your maneuvers, pass your practical checkride with an examiner, and receive your PPL!",
      icon: Award,
      time: "Hours 40 - 45+"
    }
  ];

  const faqs = [
    {
      q: "What are the age requirements?",
      a: "You can log training hours at any age. You must be at least 16 years old to fly solo, and 17 years old to be issued your Private Pilot License (PPL)."
    },
    {
      q: "Do I need a special medical examination?",
      a: "Yes. You must obtain a Class 2 Medical Certificate issued by a CAA-approved AME (Aviation Medical Examiner) before flying solo. Don't worry, the exam is straightforward and checks basic vision, hearing, and heart health."
    },
    {
      q: "How long does it take to get a PPL?",
      a: "The CAA requires a minimum of 45 flight hours. Depending on your training frequency, weather, and study pace, most students complete their license in 6 to 18 months."
    },
    {
      q: "Do I need a strong background in math or physics?",
      a: "No! Standard secondary-school arithmetic (addition, subtraction, and basic geometry for navigation angles) is more than enough. Flight instruments handle the complex calculations for you."
    }
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Block */}
      <div className="bg-foreground py-20 text-background sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.1),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Licensing Roadmap</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Learn to Fly at Cumbernauld
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-background/80 leading-relaxed">
            Your step-by-step pathway to earning a Private Pilot License (PPL). Fully transparent, structured for safety, and designed for pure adventure.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-3">
          
          {/* Timeline & Roadmap Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Flight Path Timeline</h2>
              <p className="mt-2 text-muted-foreground">Every pilot begins exactly where you are. Here is the road map of your journey:</p>
            </div>

            {/* Vertical Custom Timeline */}
            <div className="relative border-l-2 border-border pl-6 ml-4 space-y-12">
              {milestones.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-[43px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-card border-2 border-primary text-primary transition-transform group-hover:scale-110 shadow-sm">
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                          Stage {step.num} • {step.time}
                        </span>
                        <span className="rounded bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          Goal Milestone
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pre-requisites & Medical FAQ Section */}
            <div className="pt-8">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Entry Prerequisites & FAQs</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to qualify for flight instruction at Phoenix Flight Training:</p>
              
              <div className="mt-8 space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        {faq.q}
                      </span>
                      <span className="text-xl text-muted-foreground font-light ml-4">
                        {activeFaq === idx ? "−" : "+"}
                      </span>
                    </button>
                    {activeFaq === idx && (
                      <div className="border-t border-border px-6 py-4 bg-muted/20 text-muted-foreground text-sm leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Details Column */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sticky top-28 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Course Rates</span>
                <h3 className="mt-2 text-2xl font-bold text-foreground">PPL Flight Training</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  We believe in fully transparent, honest pricing with absolutely no hidden fuel surcharges or landing penalties.
                </p>
              </div>

              <hr className="border-border" />

              {/* Price Points */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Cessna 172 Training</span>
                    <p className="text-xs text-muted-foreground">Dual Instruction / hour (Wet)</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£210</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Piper PA28 Training</span>
                    <p className="text-xs text-muted-foreground">Dual Instruction / hour (Wet)</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£210</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Ground Exams</span>
                    <p className="text-xs text-muted-foreground">Multiple-choice exams (per paper)</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£45</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">Annual Club Membership</span>
                    <p className="text-xs text-muted-foreground">Required for syllabus student tracking</p>
                  </div>
                  <span className="text-xl font-bold text-foreground">£120</span>
                </div>
              </div>

              <hr className="border-border" />

              {/* Package Budget Guidelines */}
              <div className="rounded-xl bg-muted/50 p-4 border border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estimated Course Budget</span>
                <p className="mt-2 text-2xl font-extrabold text-foreground">£9,450 – £11,200</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Based on standard 45 flight hours, including dual instruction, ground exams, membership, and Cumbernauld landing packs.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/booking"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02]"
                >
                  Enroll Now
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Ask a Question
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
