import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Plane,
  PlaneTakeoff,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Phoenix Flight Training | Learn to Fly at Cumbernauld" },
      {
        name: "description",
        content:
          "Start your aviation journey with friendly instructors and unforgettable experiences at Cumbernauld Airport.",
      },
    ],
  }),
});

// --- Animated counter hook ---
function useCounter(target: number, duration: number, isVisible: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let raf = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, target, duration]);
  return count;
}

// Parse a stat string like "4500+" into a numeric value and trailing suffix.
function parseStat(value: string | undefined, fallback: number): { num: number; suffix: string } {
  const v = (value ?? "").trim();
  if (!v) return { num: fallback, suffix: "" };
  const m = v.match(/^(-?\d[\d,]*)(.*)$/);
  if (!m) return { num: fallback, suffix: "" };
  return { num: Number(m[1].replace(/,/g, "")), suffix: m[2].trim() };
}

// --- Rotating badge messages ---
const badgeMessages = [
  "Now accepting PPL students for 2026",
  "Trial lessons from £125",
  "Based at EGPG Cumbernauld",
  "15+ years of Scottish aviation training",
];

// --- Testimonials data ---
const testimonials = [
  {
    quote:
      "The instructors at Phoenix made me feel confident from my very first lesson. Captain McKay's patience and expertise helped me solo in just 12 hours. I couldn't recommend them more highly.",
    name: "James Morrison",
    role: "PPL Student, 2025",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote:
      "I bought my wife a trial lesson for her birthday and she's now halfway through her PPL! The experience flight was incredible — flying over Loch Lomond with the mountains in the background was breathtaking.",
    name: "Claire Henderson",
    role: "Experience Flight & PPL Student",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote:
      "As a self-hire renter, the checkout process was thorough but fair. The aircraft are impeccably maintained and the booking system is straightforward. Phoenix is the best club I've flown with in Scotland.",
    name: "Robert MacLeod",
    role: "Self-Hire Renter, PPL(A)",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote:
      "I'd been nervous about flying for years, but the team at Phoenix were so welcoming that I forgot about my anxiety after ten minutes in the air. Best money I've ever spent.",
    name: "Fiona Campbell",
    role: "30-Minute Trial Lesson",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
];

function Index() {
  // --- Section visibility ---
  const [sectionVisible, setSectionVisible] = useState(false);
  const [fleetVisible, setFleetVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // --- "How would you like to fly?" interactive selector ---
  const [selectedPathway, setSelectedPathway] = useState<"first_flight" | "ppl" | "self_hire">(
    "first_flight",
  );
  const [showAirfieldSpecs, setShowAirfieldSpecs] = useState(false);

  // --- Rotating badge ---
  const [badgeIndex, setBadgeIndex] = useState(0);

  // --- Testimonial carousel ---
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Animated stat counters
  const { data: homeContent } = useQuery({
    queryKey: ["site_content", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("data")
        .eq("section_key", "home")
        .maybeSingle();
      if (error) throw error;
      return (data?.data as Record<string, string> | null) ?? {};
    },
  });
  const hoursStat = parseStat(homeContent?.stat_flight_hours, 4500);
  const studentsStat = parseStat(homeContent?.stat_students, 250);
  const yearsStat = parseStat(homeContent?.stat_years, 15);
  const aircraftStat = parseStat(homeContent?.stat_aircraft, 2);
  const hoursCount = useCounter(hoursStat.num, 2000, statsVisible);
  const studentsCount = useCounter(studentsStat.num, 1800, statsVisible);
  const yearsCount = useCounter(yearsStat.num, 1500, statsVisible);
  const aircraftCount = useCounter(aircraftStat.num, 1200, statsVisible);

  // --- Badge rotation timer ---
  useEffect(() => {
    const timer = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % badgeMessages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // --- Testimonial auto-rotation ---
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // --- Intersection observers ---
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSectionVisible(true);
        sectionObserver.disconnect();
      }
    }, observerOptions);

    const fleetObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setFleetVisible(true);
        fleetObserver.disconnect();
      }
    }, observerOptions);

    const statsObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStatsVisible(true);
        statsObserver.disconnect();
      }
    }, observerOptions);

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    if (fleetRef.current) fleetObserver.observe(fleetRef.current);
    if (statsRef.current) statsObserver.observe(statsRef.current);

    return () => {
      sectionObserver.disconnect();
      fleetObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-background">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[oklch(0.12_0.04_250)] py-20 lg:py-28">
        {/* Static aerial background with high-contrast gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583373834259-46cc92173cb7?q=80&w=2000&auto=format&fit=crop"
            alt="Cessna 172 light aircraft on the Cumbernauld apron"
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/75 to-[oklch(0.12_0.04_250)]/40" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Live Cumbernauld aerodrome status ticker */}
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-white/90 border border-white/15 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-wider uppercase font-semibold text-primary">EGPG</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums text-white/90">RWY 26 / 08</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums text-white/90">120.605 MHz</span>
              <span className="text-white/30">|</span>
              <span key={badgeIndex} className="animate-fade-slide whitespace-nowrap text-white/90">
                {badgeMessages[badgeIndex]}
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Flight Training at Cumbernauld Airport. <br />
              <span className="text-primary font-extrabold">
                Unforgettable views, real flight skills.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Based at Cumbernauld Airport (EGPG), perfectly situated between Glasgow and Edinburgh.
              Fly hands-on over Loch Lomond and the Scottish Highlands with certified, friendly
              flight instructors.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#flight-selector"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-sm font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
              >
                Choose Your Flight Experience
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 bg-white/5 px-6 text-sm font-bold text-white transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                Access Flight Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ "HOW WOULD YOU LIKE TO FLY?" SELECTOR SECTION ═══════ */}
      <section
        id="flight-selector"
        ref={sectionRef}
        className="bg-background py-16 sm:py-24 relative border-b border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`max-w-3xl transition-all duration-700 ease-out ${
              sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary border border-border">
              Flight Programs
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              How would you like to fly?
            </h2>
            <p className="mt-2 text-base text-muted-foreground leading-relaxed">
              Whether you are taking the controls for the first time, training for a private pilot
              licence, or hiring an aircraft for cross-country touring.
            </p>
          </div>

          {/* Segmented Selector Buttons */}
          <div className="mt-8 flex flex-wrap gap-2 p-1.5 rounded-xl bg-muted/60 border border-border max-w-2xl">
            <button
              type="button"
              onClick={() => setSelectedPathway("first_flight")}
              className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                selectedPathway === "first_flight"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="h-4 w-4 text-primary" />
              <span>Take Your First Flight</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPathway("ppl")}
              className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                selectedPathway === "ppl"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Earn Your Pilot&apos;s Licence</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPathway("self_hire")}
              className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                selectedPathway === "self_hire"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlaneTakeoff className="h-4 w-4 text-primary" />
              <span>Hire an Aircraft</span>
            </button>
          </div>

          {/* Dynamic Content Panel */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm transition-all duration-300">
            {selectedPathway === "first_flight" && (
              <div className="grid gap-10 lg:grid-cols-12 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Trial Flight Experience
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Take the controls over Loch Lomond & the Trossachs
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Whether fulfilling a lifelong dream or taking the first step toward a
                    pilot&apos;s licence, your trial flight puts you in the left seat. Under the
                    calm guidance of a CAA-certified instructor, you&apos;ll taxi out, take off from
                    Cumbernauld&apos;s tarmac runway, and fly through the Scottish skies. All flight
                    time counts directly towards an official pilot logbook.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {[
                      "Hands-on controls from your first flight",
                      "Pre-flight briefing & flight certificate",
                      "Logable towards your PPL / LAPL licence",
                      "Spectacular aerial views of Loch Lomond",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Transparent Pricing (Dual Instruction Wet)
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { duration: "30 Mins", price: "£125.00", desc: "Local circuit & Campsies" },
                        { duration: "45 Mins", price: "£175.00", desc: "Loch Lomond south shore" },
                        {
                          duration: "60 Mins",
                          price: "£225.00",
                          desc: "Full Loch & Trossachs tour",
                        },
                      ].map((pkg) => (
                        <div
                          key={pkg.duration}
                          className="rounded-lg border border-border bg-muted/30 p-3 text-center"
                        >
                          <div className="text-xs font-semibold text-muted-foreground">
                            {pkg.duration}
                          </div>
                          <div className="font-mono text-base font-extrabold text-foreground tabular-nums mt-0.5">
                            {pkg.price}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">{pkg.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      to="/flying/experience"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90"
                    >
                      Book Trial Flight Experience
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Mission Profile & Flight Card */}
                <div className="lg:col-span-5 rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Mission Profile
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">EGPG Route</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Departure Airfield</span>
                      <span className="font-mono font-bold text-foreground">
                        Cumbernauld (EGPG)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Runway Surface</span>
                      <span className="font-mono font-bold text-foreground">820m Hard Asphalt</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Cruising Altitude</span>
                      <span className="font-mono font-bold text-foreground tabular-nums">
                        2,500 – 3,500 ft AMSL
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Aircraft Types</span>
                      <span className="font-mono font-bold text-foreground">
                        Cessna 172 / Piper PA28
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                    <div className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      What to Expect
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You will be welcomed in the clubhouse, given an easy pre-flight briefing
                      covering safety and controls, and accompany your instructor to the aircraft.
                      You will take the controls once airborne!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedPathway === "ppl" && (
              <div className="grid gap-10 lg:grid-cols-12 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    PPL(A) & LAPL(A) Course
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    From zero hours to your private pilot licence
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Training for a Private Pilot Licence at Cumbernauld gives you the real-world
                    skills to fly anywhere in the UK and worldwide. You&apos;ll learn navigation,
                    air law, meteorology, and emergency procedures from seasoned instructors who fly
                    both commercial and general aviation.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {[
                      "45 Hours minimum flight instruction",
                      "10 Hours solo flight time required",
                      "9 CAA Ground Theory examinations",
                      "Cross-country navigation to UK airfields",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Transparent Hourly Rates
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Dual Instruction (Wet)
                        </div>
                        <div className="font-mono text-base font-extrabold text-foreground tabular-nums mt-0.5">
                          £210.00 / hr
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Includes instructor, fuel & landing fee
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="text-xs font-semibold text-muted-foreground">
                          Solo Flight (Wet)
                        </div>
                        <div className="font-mono text-base font-extrabold text-foreground tabular-nums mt-0.5">
                          £175.00 / hr
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Supervised solo consolidation hours
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      to="/flying/learn-to-fly"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90"
                    >
                      Explore Complete PPL Roadmap
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: 4-Stage Roadmap */}
                <div className="lg:col-span-5 rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Syllabus Milestones
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      4 Key Stages
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        stage: "Stage 1",
                        title: "Handling & Circuits",
                        detail:
                          "Learn effects of controls, climbing, descending, stalls, and circuits until your First Solo flight.",
                      },
                      {
                        stage: "Stage 2",
                        title: "Cross-Country Navigation",
                        detail:
                          "Map reading, dead reckoning, VOR/GPS tracking, and diversion planning.",
                      },
                      {
                        stage: "Stage 3",
                        title: "Basic Instrument Flight",
                        detail:
                          "Controlling the aircraft solely by reference to instruments and radio navigation.",
                      },
                      {
                        stage: "Stage 4",
                        title: "Qualifying Cross-Country & Test",
                        detail:
                          "150nm solo flight landing at two other airfields, followed by the CAA Skills Test.",
                      },
                    ].map((step) => (
                      <div key={step.stage} className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-primary uppercase">
                            {step.stage}
                          </span>
                          <span className="text-xs font-bold text-foreground">{step.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedPathway === "self_hire" && (
              <div className="grid gap-10 lg:grid-cols-12 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-primary">
                    Qualified Pilot Self-Hire
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Impeccably maintained aircraft for qualified aviators
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Hold a current PPL or LAPL? Phoenix Flight Academy offers wet self-hire on our
                    Cessna 172 and Piper PA28 fleet. Cumbernauld Airport provides quick departure
                    clearances to the Scottish Highlands, the Western Isles, and the UK aerodrome
                    network with zero commercial slot delays.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    {[
                      "Standard 1-hour club checkout flight",
                      "Overnight touring permitted by prior agreement",
                      "Online aircraft scheduling and booking",
                      "No monthly membership subscriptions",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Self-Hire Rates
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 max-w-sm">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Wet Hire Rate (Tachometer Hour)
                      </div>
                      <div className="font-mono text-base font-extrabold text-foreground tabular-nums mt-0.5">
                        £175.00 / hr
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Includes all fuel, oil, and comprehensive hull insurance
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      to="/flying/self-hire"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90"
                    >
                      Book Aerodrome Checkout
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Column: Fleet Specs */}
                <div className="lg:col-span-5 rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Airframe Fleet
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Garmin Equipped
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Cessna 172 Skyhawk
                        </span>
                        <span className="font-mono text-[10px] font-bold text-primary uppercase">
                          High Wing
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        160 hp Lycoming, 4 seats, 110 kt cruise, dual Garmin comms, exceptional
                        visibility for cross-country navigation.
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Piper PA28 Cherokee
                        </span>
                        <span className="font-mono text-[10px] font-bold text-primary uppercase">
                          Low Wing
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        160 hp Lycoming, 4 seats, 115 kt cruise, stable touring platform with
                        comfortable four-seat cabin.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3.5 space-y-2">
                    <div className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5" />
                      Pilot Currency Requirements
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Valid UK CAA PPL/LAPL, current SEP class rating, valid medical (Class 2 or
                      LAPL), and 3 take-offs/landings within the previous 90 days.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Cumbernauld Airfield Details Drawer */}
          <div className="mt-8 border border-border rounded-xl bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAirfieldSpecs(!showAirfieldSpecs)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Cumbernauld Airfield & Flight Operations Data (EGPG)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{showAirfieldSpecs ? "Hide Details" : "View Runway & Airspace Specs"}</span>
                {showAirfieldSpecs ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {showAirfieldSpecs && (
              <div className="p-5 border-t border-border bg-muted/20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Runway 26 / 08
                  </div>
                  <div className="font-mono font-bold text-foreground mt-0.5">
                    820m × 23m Asphalt
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Elevation 356 ft AMSL
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Radio Frequency
                  </div>
                  <div className="font-mono font-bold text-foreground mt-0.5 tabular-nums">
                    120.605 MHz
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Cumbernauld Information (AFISO)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    Traffic Circuits
                  </div>
                  <div className="font-mono font-bold text-foreground mt-0.5">1,400 ft QNH</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    RWY 26 Left Hand / RWY 08 Right Hand
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                    On-Site Facilities
                  </div>
                  <div className="font-mono font-bold text-foreground mt-0.5">
                    AVGAS 100LL & UL91
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Clubhouse café & free visitor parking
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ STATS COUNTER SECTION ═══════ */}
      <section
        ref={statsRef}
        className="bg-[oklch(0.12_0.04_250)] py-20 sm:py-24 border-y border-white/10 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              {
                value: hoursCount,
                suffix: hoursStat.suffix,
                label: "Flight Hours Logged",
                prefix: "",
              },
              {
                value: studentsCount,
                suffix: studentsStat.suffix,
                label: "Students Trained",
                prefix: "",
              },
              {
                value: yearsCount,
                suffix: yearsStat.suffix,
                label: "Years at Cumbernauld",
                prefix: "",
              },
              {
                value: aircraftCount,
                suffix: aircraftStat.suffix,
                label: "Training Aircraft",
                prefix: "",
              },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ease-out ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl font-mono tabular-nums tracking-tight">
                  {stat.prefix}
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="mt-2 text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FLEET TEASER SECTION ═══════ */}
      <section
        ref={fleetRef}
        className="bg-muted/50 py-24 sm:py-32 relative border-b border-border overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Image side */}
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-lg border border-border transition-all duration-1000 ease-out ${
                fleetVisible
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 -translate-x-12 scale-95"
              }`}
            >
              <img
                src="/cessna172.png"
                alt="Cessna 172 Skyhawk"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Text details side */}
            <div
              className={`space-y-6 transition-all duration-1000 ease-out delay-200 ${
                fleetVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Cumbernauld Hangar
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Our Fleet
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                When you start your flight instruction at Phoenix, you secure access to the most
                dependable general aviation aircraft ever designed.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Our exceptionally maintained, fully certified hangar includes stable high-wing
                Cessna 172 units and agile low-wing Piper PA28 cross-country tourers.
              </p>
              <div className="pt-4">
                <Link
                  to="/fleet"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 px-6 text-sm font-bold transition-all hover:bg-primary/20 hover:scale-[1.02]"
                >
                  Explore Cockpit Specs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS SECTION ═══════ */}
      <section className="bg-background py-24 sm:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Student Reviews
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              What Our Pilots Say
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Real feedback from students who trained at Cumbernauld Airport.
            </p>
          </div>

          <div
            className="relative max-w-3xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Testimonial card */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm min-h-[280px]">
              <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />

              <div key={activeTestimonial} className="animate-fade-slide">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <blockquote className="text-base sm:text-lg leading-relaxed text-foreground/90 italic">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-border"
                  />
                  <div>
                    <p className="font-bold text-foreground">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={prevTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeTestimonial
                        ? "w-8 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground/40"
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA BANNER ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.12_0.04_250)] py-24 sm:py-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1474302770737-173ee21bab63?q=80&w=2000&auto=format&fit=crop"
            alt="Sunset over Scottish Highlands from cockpit"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/80 to-[oklch(0.12_0.04_250)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to take the controls?
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-white/75">
            Whether it's your first flight or your hundredth, Phoenix Flight Training is here to
            help you reach your aviation goals. Book your introductory lesson today.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/flying/experience"
              className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/95 hover:shadow-xl focus:outline-none"
            >
              Book Experience Flight
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-14 items-center justify-center rounded-lg border-2 border-white/60 bg-transparent px-8 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white focus:outline-none"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
