import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ShieldCheck,
  Award,
  Compass,
  Plane,
  HelpCircle,
  ArrowRight,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/flying/learn-to-fly")({
  component: LearnToFlyPage,
  head: () => ({
    meta: [
      { title: "Learn to Fly & PPL Syllabus | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Your complete roadmap to earning a Private Pilot License (PPL) at Cumbernauld Airport. Transparent pricing calculator, timelines, and prerequisites.",
      },
    ],
  }),
});

const groundExamModules = [
  {
    category: "Flight Safety & Rules",
    badge: "Core Regulatory",
    exams: [
      {
        name: "Air Law",
        questions: 16,
        time: "35 mins",
        desc: "UK airspace classifications, right of way rules, aerodrome signals, and pilot licensing regulations.",
      },
      {
        name: "Human Performance & Limitations",
        questions: 12,
        time: "25 mins",
        desc: "Hypoxia, spatial disorientation, eye physiology, fatigue, and cockpit stress management.",
      },
      {
        name: "Operational Procedures",
        questions: 12,
        time: "30 mins",
        desc: "Emergency procedures, altimeter setting rules, wake turbulence separation, and collision avoidance.",
      },
    ],
  },
  {
    category: "Aircraft Technical",
    badge: "Systems & Aerodynamics",
    exams: [
      {
        name: "Aircraft General Knowledge",
        questions: 16,
        time: "35 mins",
        desc: "Lycoming 4-cylinder engine mechanics, electrical bus systems, flight instruments, and propeller operation.",
      },
      {
        name: "Principles of Flight",
        questions: 16,
        time: "35 mins",
        desc: "Lift, drag, angle of attack, aerodynamic stall recovery, stability, and flight control surfaces.",
      },
      {
        name: "Flight Performance & Planning",
        questions: 12,
        time: "45 mins",
        desc: "Weight & balance envelope calculations, takeoff/landing runway distance factoring, and fuel reserve planning.",
      },
    ],
  },
  {
    category: "Navigation & Meteorology",
    badge: "Practical Touring",
    exams: [
      {
        name: "Navigation",
        questions: 12,
        time: "45 mins",
        desc: "Aeronautical 1:500,000 chart plotting, dead reckoning calculations, wind drift correction, and radio navigation.",
      },
      {
        name: "Meteorology",
        questions: 16,
        time: "50 mins",
        desc: "Aviation METAR & TAF weather reports, cold/warm fronts, cloud types, mountain wave wind, and icing hazards.",
      },
      {
        name: "Communications",
        questions: 12,
        time: "20 mins",
        desc: "Standard CAA radiotelephony phraseology, emergency squawk codes (7700/7600), and frequency handovers.",
      },
    ],
  },
];

function LearnToFlyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);

  // Interactive Cost Estimator State
  const [licenceType, setLicenceType] = useState<"ppl" | "lapl">("ppl");
  const [cadence, setCadence] = useState<"1_week" | "2_week" | "intensive">("1_week");
  const [hoursMode, setHoursMode] = useState<"syllabus" | "average">("average");
  const [expandedExamModule, setExpandedExamModule] = useState<number | null>(0);

  // Estimator Calculations
  const syllabusMin = licenceType === "ppl" ? 45 : 30;
  const projectedHours = hoursMode === "syllabus" ? syllabusMin : licenceType === "ppl" ? 52 : 36;
  const soloMin = licenceType === "ppl" ? 10 : 6;
  const soloHours = soloMin;
  const dualHours = projectedHours - soloHours;

  const dualCost = dualHours * 210;
  const soloCost = soloHours * 175;
  const examsCost = 9 * 45; // 9 exams @ £45
  const adminAndMedical = 120 + 200; // Annual membership + Medical exam estimate
  const skillsTestFee = 250; // Examiner fee
  const totalEstimated = dualCost + soloCost + examsCost + adminAndMedical + skillsTestFee;

  const hoursPerMonth = cadence === "1_week" ? 4 : cadence === "2_week" ? 8 : 16;
  const estimatedMonths = Math.max(1, Math.ceil(projectedHours / hoursPerMonth));
  const monthlyCost = Math.round(totalEstimated / estimatedMonths);

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

            {/* 9 CAA Ground Theory Exams Explorer */}
            <div className="pt-8 border-t border-border">
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary border border-border">
                Theoretical Knowledge
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
                The 9 CAA Ground Theory Exams
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Ground exams are straightforward multiple-choice e-exams sat right at our
                Cumbernauld airfield academy. They are broken into 3 manageable clusters:
              </p>

              <div className="mt-6 space-y-4">
                {groundExamModules.map((module, mIdx) => {
                  const isExpanded = expandedExamModule === mIdx;
                  return (
                    <div
                      key={module.category}
                      className="rounded-xl border border-border bg-card overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedExamModule(isExpanded ? null : mIdx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <span className="text-sm font-bold text-foreground">
                              {module.category}
                            </span>
                            <span className="ml-3 rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                              {module.badge}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{module.exams.length} Exams</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-5 border-t border-border bg-muted/15 grid gap-3 sm:grid-cols-3">
                          {module.exams.map((exam) => (
                            <div
                              key={exam.name}
                              className="rounded-lg border border-border bg-card p-3.5 space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-foreground">{exam.name}</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[10px] text-primary">
                                <span>{exam.questions} Questions</span>
                                <span>•</span>
                                <span>{exam.time}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-normal">
                                {exam.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pre-requisites & Medical FAQ Section */}
            <div className="pt-8 border-t border-border">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Prerequisites & FAQs
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Everything you need to know before your first flying lesson:
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

          {/* Interactive Cost Estimator & Pricing Column */}
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-28 space-y-6">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  Interactive Cost Estimator
                </span>
                <h3 className="mt-1.5 text-xl font-bold text-foreground">
                  PPL & LAPL Budget Calculator
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Real-world estimates with pay-as-you-fly rates. No upfront lump sums required.
                </p>
              </div>

              {/* Licence Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setLicenceType("ppl")}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    licenceType === "ppl"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  PPL (45h min)
                </button>
                <button
                  type="button"
                  onClick={() => setLicenceType("lapl")}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${
                    licenceType === "lapl"
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  LAPL (30h min)
                </button>
              </div>

              {/* Hours Mode Toggle */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Flight Hours Projection
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHoursMode("syllabus")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      hoursMode === "syllabus"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">Syllabus Min</div>
                    <div className="font-mono text-[11px] text-primary">{syllabusMin} Hours</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHoursMode("average")}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      hoursMode === "average"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">UK Average</div>
                    <div className="font-mono text-[11px] text-primary">
                      {licenceType === "ppl" ? 52 : 36} Hours
                    </div>
                  </button>
                </div>
              </div>

              {/* Cadence Selector */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Training Pace
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "1_week", label: "1x / week", note: "~12 mos" },
                    { id: "2_week", label: "2x / week", note: "~6 mos" },
                    { id: "intensive", label: "Fast-Track", note: "~3 mos" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCadence(c.id as any)}
                      className={`p-2 rounded-lg border text-center text-xs transition-all ${
                        cadence === c.id
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold">{c.label}</div>
                      <div className="text-[10px] text-muted-foreground">{c.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Cost Itemization */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Dual Instruction ({dualHours} hrs @ £210)
                  </span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    £{dualCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Supervised Solo ({soloHours} hrs @ £175)
                  </span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    £{soloCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">9 CAA Ground Theory Exams</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    £{examsCost}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Club Membership & Medical</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    £{adminAndMedical}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Examiner Flight Test Fee</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    £{skillsTestFee}
                  </span>
                </div>
              </div>

              {/* Total Estimated Box */}
              <div className="rounded-lg bg-muted/40 p-4 border border-border space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Estimated Total
                  </span>
                  <span className="font-mono text-2xl font-black text-foreground tabular-nums">
                    £{totalEstimated.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <span>Estimated timeline: {estimatedMonths} months</span>
                  <span className="font-mono font-semibold text-primary">
                    ~£{monthlyCost.toLocaleString()} / mo
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  to="/login"
                  search={{ tab: "register" }}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
                >
                  Apply for Student Flight Account
                </Link>
                <Link
                  to="/contact"
                  search={{ subject: "ppl" }}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background text-xs font-bold text-foreground transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-muted"
                >
                  Book Instructor Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
