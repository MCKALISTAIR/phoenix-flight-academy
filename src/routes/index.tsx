import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Compass,
  PlaneTakeoff,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Radio,
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
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[oklch(0.12_0.04_250)] py-20 lg:py-32">
        {/* Background image with slow zoom */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583373834259-46cc92173cb7?q=80&w=2000&auto=format&fit=crop"
            alt="Cessna 172 light aircraft on the apron"
            className="h-full w-full object-cover opacity-40 scale-105 animate-[pulse_8s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Aerodrome status ticker */}
            <div className="animate-stagger-1 inline-flex items-center gap-2 rounded-md bg-surface-navy/90 px-3 py-1.5 text-xs font-mono font-medium text-white/90 border border-white/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="tracking-wider uppercase font-semibold text-primary">EGPG</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums text-white/80">RWY 26</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums text-white/80">120.605 MHz</span>
              <span className="text-white/30">|</span>
              <span key={badgeIndex} className="animate-fade-slide whitespace-nowrap text-white/90">
                {badgeMessages[badgeIndex]}
              </span>
            </div>

            <h1 className="animate-stagger-2 mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn to fly at <br className="hidden sm:block" />
              <span className="text-primary font-extrabold">Cumbernauld Airport</span>
            </h1>

            <p className="animate-stagger-3 mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Start your aviation journey with friendly instructors and unforgettable experiences.
              Explore the breathtaking skies of Scotland from your local flying school.
            </p>

            <div className="animate-stagger-4 mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/95 hover:shadow-xl focus:outline-none"
              >
                Access Flight Portal
              </Link>
              <Link
                to="/flying/learn-to-fly"
                className="inline-flex h-14 items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 text-base font-bold text-white transition-all hover:bg-white hover:text-[oklch(0.12_0.04_250)] focus:outline-none"
              >
                Discover Syllabus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FLIGHT OPERATIONS MATRIX ═══════ */}
      <section
        ref={sectionRef}
        className="bg-background py-20 sm:py-28 relative border-b border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`mb-14 max-w-2xl transition-all duration-700 ease-out ${
              sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-primary border border-border">
              Flight Operations Programs
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Aviation Pathways at Cumbernauld
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              From your very first logbook entry to statutory PPL certification and cross-country
              airframe hire across the Scottish Highlands.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Compass,
                badge: "LOGBOOK CREDITABLE",
                title: "Trial Experience Flights",
                desc: "Hands-on flight experience under direct instructor supervision over Loch Lomond and the Trossachs. Fully logable towards a future license.",
                rate: "From £125.00",
                rateLabel: "Includes 30m briefing + flight",
                specs: [
                  { k: "Duration", v: "30 / 45 / 60 mins" },
                  { k: "Airframe", v: "C172 or PA28" },
                  { k: "Logbook", v: "Exercises 1–3" },
                ],
                link: "/flying/experience",
                cta: "Reserve Experience",
              },
              {
                icon: BookOpen,
                badge: "STATUTORY 45-HR SYLLABUS",
                title: "Learn to Fly (PPL / LAPL)",
                desc: "Comprehensive flight and ground instruction to earn your UK CAA Private Pilot License under experienced, safety-first flight instructors.",
                rate: "£210.00 / hr",
                rateLabel: "Dual instruction (wet)",
                specs: [
                  { k: "Syllabus", v: "45 Hours (Min)" },
                  { k: "Solo Req", v: "10 Hours Solo" },
                  { k: "Ground", v: "9 CAA e-Exams" },
                ],
                link: "/flying/learn-to-fly",
                cta: "Explore Syllabus",
              },
              {
                icon: PlaneTakeoff,
                badge: "PART-FCL.060 RATED",
                title: "Airframe Self-Hire",
                desc: "Current pilots can hire our exceptionally maintained, fully insured fleet for local Scottish currency flights or multi-day cross-country touring.",
                rate: "£175.00 / hr",
                rateLabel: "Wet hire (tachometer)",
                specs: [
                  { k: "Fleet", v: "C172 & PA28" },
                  { k: "Avionics", v: "Garmin GNS 430" },
                  { k: "Touring", v: "Overnight Permitted" },
                ],
                link: "/flying/self-hire",
                cta: "Check Availability",
              },
            ].map((program, idx) => (
              <div
                key={program.title}
                className={`flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-md ${
                  sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <program.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase text-muted-foreground border border-border">
                      {program.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-foreground">{program.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {program.desc}
                  </p>

                  {/* Telemetry Strip */}
                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-border bg-muted/20 p-2.5 text-center">
                    {program.specs.map((s) => (
                      <div key={s.k}>
                        <span className="block text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {s.k}
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                          {s.v}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing line */}
                  <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                    <span className="text-[11px] text-muted-foreground">{program.rateLabel}</span>
                    <span className="font-mono text-base font-extrabold text-foreground tabular-nums">
                      {program.rate}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to={program.link}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90"
                  >
                    {program.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
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
