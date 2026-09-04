import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ShieldCheck, Award, Compass, Plane, HelpCircle, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/flying/learn-to-fly")({
  component: LearnToFlyPage,
  head: () => ({
    meta: [
      { title: "Learn to Fly & PPL Syllabus | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Your complete roadmap to earning a Private Pilot License (PPL) at Cumbernauld Airport. Pricing, timelines, and prerequisites.",
      },
    ],
  }),
});

function LearnToFlyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  const milestones = [
    {
      num: "01",
      title: "The Trial Flight",
      desc: "Take the controls for the very first time. Get a comprehensive pre-flight briefing, fly with a CAA-certified instructor, and experience the pure joy of aviation.",
      icon: Plane,
      time: "Hour 1",
    },
    {
      num: "02",
      title: "Dual Instruction",
      desc: "Master takeoffs, landings, climbs, turns, and stalling recovery maneuvers under the close, reassuring guidance of your instructor.",
      icon: BookOpen,
      time: "Hours 2 - 15",
    },
    {
      num: "03",
      title: "The First Solo",
      desc: "An unforgettable aviation milestone! Your instructor steps out, and you take the aircraft around the Cumbernauld airport circuit entirely on your own.",
      icon: ShieldCheck,
      time: "Hours 15 - 20",
    },
    {
      num: "04",
      title: "Cross-Country Navigation",
      desc: "Learn traditional dead reckoning using flight computer, chart, compass, and stopwatch. Conduct epic solo flights to other airfields across Scotland.",
      icon: Compass,
      time: "Hours 20 - 40",
    },
    {
      num: "05",
      title: "Skills Test & Licensing",
      desc: "Complete your nine multiple-choice exams, refine navigation routes, pass your practical checkride with an examiner, and secure your official PPL license!",
      icon: Award,
      time: "Hours 40 - 45+",
    },
  ];

  const faqs = [
    {
      q: "What are the age requirements?",
      a: "You can log training hours at any age. You must be at least 16 years old to fly solo, and 17 years old to be issued your Private Pilot License (PPL).",
    },
    {
      q: "Do I need a special medical examination?",
      a: "Yes. You must obtain a Class 2 Medical Certificate issued by a CAA-approved AME (Aviation Medical Examiner) before flying solo. Don't worry, the exam is straightforward and checks basic vision, hearing, and heart health.",
    },
    {
      q: "How long does it take to get a PPL?",
      a: "The CAA requires a minimum of 45 flight hours. Depending on your training frequency, weather, and study pace, most students complete their license in 6 to 18 months.",
    },
    {
      q: "Do I need a strong background in math or physics?",
      a: "No! Standard secondary-school arithmetic (addition, subtraction, and basic geometry for navigation angles) is more than enough. Flight instruments handle the complex calculations for you.",
    },
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.25,
      rootMargin: "0px 0px -60px 0px",
    };

    const cards = document.querySelectorAll(".timeline-card-wrapper");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
          setVisibleIndices((prev) => [...new Set([...prev, index])]);
        }
      });
    }, observerOptions);

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Block with Background Image */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1600&auto=format&fit=crop"
            alt="Aircraft wing in high skies"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Licensing Roadmap
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Learn to Fly at Cumbernauld
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Your step-by-step pathway to earning a Private Pilot License (PPL). Fully transparent,
            structured for safety, and designed for pure adventure.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Timeline & Roadmap Column */}
          <div className="lg:col-span-2 space-y-16">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Your Flight Path Timeline</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Every pilot begins exactly where you are. Experience the gradual milestone unlocks
                as you scroll:
              </p>
            </div>

            {/* Vertical Custom Timeline with Active Glow Progress */}
            <div className="relative border-l-2 border-border pl-8 ml-4 space-y-16">
              {/* Timeline Progress Line */}
              <div
                className="absolute left-[-2px] top-0 bg-primary w-[2px] transition-all duration-700 ease-out"
                style={{
                  height: `${(Math.max(...visibleIndices, -1) + 1) * 20}%`,
                  maxHeight: "100%",
                }}
              />

              {milestones.map((step, idx) => {
                const IconComponent = step.icon;
                const isActive = visibleIndices.includes(idx);

                return (
                  <div key={idx} data-index={idx} className="relative group timeline-card-wrapper">
                    {/* Node checkpoint */}
                    <div
                      className={`absolute -left-[49px] top-1.5 flex h-8.5 w-8.5 items-center justify-center rounded-full border-2 transition-all duration-500 shadow-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary scale-105"
                          : "bg-card text-muted-foreground/60 border-border opacity-50 scale-95"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Milestone Card */}
                    <div
                      className={`rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-500 ease-out hover:border-primary/30 ${
                        isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`text-[11px] font-mono font-bold uppercase tracking-wider transition-colors duration-500 ${
                            isActive ? "text-primary" : "text-muted-foreground/60"
                          }`}
                        >
                          Stage {step.num} • {step.time}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground/75"
                          }`}
                        >
                          CAA Syllabus
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pre-requisites & Medical FAQ Section */}
            <div className="pt-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Entry Prerequisites & FAQs
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Statutory regulatory requirements to qualify for flight instruction at Phoenix:
              </p>

              <div className="mt-6 space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/25"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left font-bold text-sm text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                        {faq.q}
                      </span>
                      <span
                        className={`text-lg text-muted-foreground font-light ml-4 transition-transform duration-200 ${
                          activeFaq === idx ? "rotate-90 text-primary" : ""
                        }`}
                      >
                        {activeFaq === idx ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        activeFaq === idx ? "max-h-40 border-t border-border" : "max-h-0"
                      }`}
                    >
                      <div className="px-6 py-4 bg-muted/15 text-xs leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Details Column */}
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-28 space-y-6">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                  Syllabus Fee Structure
                </span>
                <h3 className="mt-1.5 text-xl font-bold text-foreground">PPL Training Rates</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Transparent flight instruction rates. Wet rates include full fuel burn,
                  maintenance, and insurance.
                </p>
              </div>

              <hr className="border-border" />

              {/* Price Points in Monospace Tabular Numerals */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">Cessna 172 Dual</span>
                    <p className="text-[11px] text-muted-foreground">
                      Instructor + aircraft / tach hr
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £210.00
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">Piper PA28 Dual</span>
                    <p className="text-[11px] text-muted-foreground">
                      Instructor + aircraft / tach hr
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £210.00
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Ground Theory Exams
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      CAA e-Exams (per paper, 9 total)
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £45.00
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      Annual Flying Membership
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Student record keeping & airfield ops
                    </p>
                  </div>
                  <span className="font-mono text-base font-bold text-foreground tabular-nums">
                    £120.00
                  </span>
                </div>
              </div>

              <hr className="border-border" />

              {/* Package Budget Guidelines */}
              <div className="rounded-lg bg-muted/30 p-4 border border-border space-y-2">
                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Statutory 45-Hour Budget
                </span>
                <p className="font-mono text-2xl font-black text-foreground tabular-nums">
                  £9,450 – £11,200
                </p>
                <div className="space-y-1 pt-1 text-[11px] text-muted-foreground leading-relaxed">
                  <p>• 25 hrs minimum dual instruction</p>
                  <p>• 10 hrs minimum supervised solo flight</p>
                  <p>• 5 hrs solo cross-country + 150nm QXC</p>
                  <p>• 9 CAA ground examinations & examiner fee</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  to="/login"
                  search={{ tab: "register" }}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
                >
                  Enroll in Pilot Ground School
                </Link>
                <Link
                  to="/contact"
                  search={{ subject: "ppl" }}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background text-xs font-bold text-foreground transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-muted"
                >
                  Consult an Instructor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
