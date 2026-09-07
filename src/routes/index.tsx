import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Compass,
  PlaneTakeoff,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Radio,
  MapPin,
  Gauge,
  Wrench,
  Fuel,
  Activity,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type HomeSearch = {
  pathway?: "experience" | "training" | "hire";
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const p = search.pathway;
    if (p === "experience" || p === "training" || p === "hire") {
      return { pathway: p };
    }
    return {};
  },
  component: Index,
  head: () => ({
    meta: [
      { title: "Phoenix Flight Training | Learn to Fly at Cumbernauld Airport" },
      {
        name: "description",
        content:
          "Take the controls at Cumbernauld Airport (EGPG). Introductory flight experiences, comprehensive PPL & LAPL training, and Piper PA-28 self-hire over Loch Lomond.",
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
      "As a self-hire renter, the checkout process was thorough but fair. The PA-28 is impeccably maintained and the booking system is straightforward. Phoenix is the best club I've flown with in Scotland.",
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

// Motion animation variants for staggered text-mask reveal
const headlineMaskContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const headlineMaskItem = {
  hidden: { y: "115%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 24,
      stiffness: 140,
      mass: 0.8,
    },
  },
};

function Index() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });

  // Optimistic local state synced with query parameter (?pathway=experience|training|hire)
  const [selectedPathway, setSelectedPathway] = useState<"experience" | "training" | "hire">(
    search.pathway ?? "experience",
  );

  useEffect(() => {
    if (search.pathway && search.pathway !== selectedPathway) {
      setSelectedPathway(search.pathway);
    }
  }, [search.pathway, selectedPathway]);

  const handlePathwayChange = useCallback(
    (value: string) => {
      const validPathway: "experience" | "training" | "hire" =
        value === "training" || value === "hire" ? value : "experience";
      setSelectedPathway(validPathway);
      navigate({
        search: (prev) => ({ ...prev, pathway: validPathway }),
        replace: true,
        resetScroll: false,
      });
    },
    [navigate],
  );

  // --- Video hero playback & accessibility ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Parallax scroll for hero background tarmac imagery
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    setIsHydrated(true);
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
      return;
    }

    // Ensure audio is muted for iOS Safari autoplay policies
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // --- Section visibility observers ---
  const [sectionVisible, setSectionVisible] = useState(false);
  const [fleetVisible, setFleetVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [pohOpen, setPohOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // --- Testimonial carousel ---
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Animated stat counters (Fallbacks reflect authentic 30+ yrs and single PA-28)
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
  const yearsStat = parseStat(homeContent?.stat_years, 30);
  const aircraftStat = parseStat(homeContent?.stat_aircraft, 1);
  const hoursCount = useCounter(hoursStat.num, 2000, statsVisible);
  const studentsCount = useCounter(studentsStat.num, 1800, statsVisible);
  const yearsCount = useCounter(yearsStat.num, 1500, statsVisible);
  const aircraftCount = useCounter(aircraftStat.num, 1200, statsVisible);

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
    <div className="flex flex-col overflow-hidden bg-[oklch(0.08_0.02_260)] text-foreground">
      {/* ═══════ HERO SECTION (Cinematic Atmospheric Stage Lighting & +40% Typography) ═══════ */}
      <section
        ref={heroSectionRef}
        className="relative flex min-h-[90vh] lg:min-h-[95vh] items-center justify-center overflow-hidden bg-[oklch(0.08_0.02_260)] py-24 sm:py-32 lg:py-36"
      >
        {/* Continuous Subtle Parallax Background (Tarmac & Cockpit Video/Imagery) */}
        <motion.div
          style={{ y: yParallax, scale: scaleParallax }}
          className="absolute inset-0 z-0 h-[125%] -top-[12%] w-full pointer-events-none"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/piper-pa28-apron.jpg"
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40 transition-opacity duration-700"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-the-clouds-in-a-plane-cockpit-43093-large.mp4"
              type="video/mp4"
            />
          </video>
          {/* Moody Stage Lighting Overlays (The 1975 Aesthetic: Deep canvas, striking lighting) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_260)] via-[oklch(0.08_0.02_260)]/75 to-[oklch(0.08_0.02_260)]/50" />
          <div className="absolute inset-0 stage-lighting" />
          <div className="absolute inset-0 stage-lighting-spotlight" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.08_0.02_260)_85%)] opacity-90" />
        </motion.div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Aerospace Metadata Identifier Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-mono font-medium text-white/90 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <span className="tracking-widest uppercase font-bold text-primary">EGPG</span>
              <span className="text-white/30">/</span>
              <span className="text-white/90 font-semibold">Cumbernauld</span>
              <span className="text-white/30">/</span>
              <span className="tabular-nums text-white/80">55°58′32″N 003°57′41″W</span>
              <span className="text-white/30">/</span>
              <span className="tabular-nums text-white/80">Elev 356 FT</span>
            </div>

            {/* +40% Scaled Hero Typography with Staggered Text-Mask Reveal Animation */}
            <motion.h1
              variants={headlineMaskContainer}
              initial="hidden"
              animate="show"
              className="mt-8 text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black tracking-[-0.045em] text-white leading-[0.92] sm:leading-[0.92] lg:leading-[0.90]"
            >
              <span className="block overflow-hidden pb-1">
                <motion.span variants={headlineMaskItem} className="block">
                  Where Scottish Aviators
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1">
                <motion.span variants={headlineMaskItem} className="block">
                  Take Flight.
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1 text-primary">
                <motion.span variants={headlineMaskItem} className="block">
                  Precision training at Cumbernauld Airport.
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-white/80 font-normal"
            >
              Operating from Cumbernauld Airport (EGPG) with immediate departure routes over the
              Campsie Fells and Loch Lomond. Experienced one-to-one instruction, authentic low-wing
              Piper PA-28 flight dynamics, and over 30 years of Scottish aviation training.
            </motion.p>

            {/* Magnetic Spring Physics Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <MagneticButton
                asChild
                size="lg"
                className="h-14 px-8 text-sm font-bold shadow-none active:scale-[0.98]"
              >
                <a href="#flight-selector">
                  Choose Your Flight Experience
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </MagneticButton>

              <MagneticButton
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-sm font-bold bg-white/[0.05] text-white hover:bg-white/[0.12] hover:text-white active:scale-[0.98] ring-offset-[oklch(0.08_0.02_260)] backdrop-blur-md border-0"
              >
                <Link to="/login">Access Flight Portal</Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ ASYMMETRICAL BENTO BOX PATHWAY SELECTOR SECTION ═══════ */}
      <section
        id="flight-selector"
        ref={sectionRef}
        className="relative bg-[oklch(0.08_0.02_260)] py-24 sm:py-32 border-b border-white/10 overflow-x-clip"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`max-w-3xl transition-all duration-700 ease-out ${
              sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
              Flight Pathways
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-5xl leading-tight">
              How would you like to fly?
            </h2>
            <p className="mt-3 text-base sm:text-lg text-white/70 leading-relaxed">
              Whether taking the controls for the first time, progressing through your private pilot
              licence, or self-hiring our Piper PA-28 for cross-country touring.
            </p>
          </div>

          {/* Radix Tabs Bento Pathway Selector */}
          <Tabs
            value={selectedPathway}
            onValueChange={handlePathwayChange}
            className="mt-10 w-full"
          >
            {/* Segmented Tab Triggers */}
            <TabsList className="h-auto p-1.5 bg-white/[0.04] rounded-2xl flex flex-wrap gap-2 max-w-2xl backdrop-blur-md">
              <TabsTrigger
                value="experience"
                className="flex-1 min-w-[160px] h-12 px-4 text-xs font-bold gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
              >
                <Compass className="h-4 w-4 text-primary shrink-0" />
                <span>Take Your First Flight</span>
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="flex-1 min-w-[160px] h-12 px-4 text-xs font-bold gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
              >
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <span>Learn to Fly</span>
              </TabsTrigger>
              <TabsTrigger
                value="hire"
                className="flex-1 min-w-[160px] h-12 px-4 text-xs font-bold gap-2 text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all"
              >
                <PlaneTakeoff className="h-4 w-4 text-primary shrink-0" />
                <span>Hire an Aircraft</span>
              </TabsTrigger>
            </TabsList>

            {/* Zero-CLS Stacked Bento Content Panels */}
            <div className="mt-8 grid grid-cols-1 grid-rows-1">
              {/* PATHWAY 1: EXPERIENCE FLIGHTS */}
              <TabsContent
                value="experience"
                forceMount
                className="col-start-1 row-start-1 mt-0 data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden data-[state=active]:visible"
              >
                {/* 12-Column Asymmetrical Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left 7 Columns: Core Offering, Rates & Magnetic CTA */}
                  <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative overflow-hidden">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                          Trial Flight Experience
                        </span>
                        <span className="text-white/30">/</span>
                        <span className="text-xs font-mono text-zinc-400">
                          Logbook Hours Included
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                        Take the controls over Loch Lomond & the Trossachs
                      </h3>

                      <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
                        Whether fulfilling a lifelong dream or embarking on your pilot journey, your
                        trial lesson puts you in the left seat. Under the expert supervision of a
                        certified flight instructor, you will taxi, take off from Cumbernauld&apos;s
                        820m asphalt runway, and pilot through the Scottish skies. All flight time
                        counts directly towards an official pilot logbook.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        {[
                          "Hands-on controls from your very first flight",
                          "Full pre-flight safety briefing & certificate",
                          "Loggable towards your UK PPL / LAPL licence",
                          "Spectacular panoramic views over Loch Lomond",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90"
                          >
                            <CheckCircle2 className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                        Flight Voucher Options (Dual Instruction Wet)
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
                        {[
                          {
                            duration: "30 Mins",
                            price: "£125.00",
                            desc: "Local circuit & Campsies",
                          },
                          {
                            duration: "45 Mins",
                            price: "£175.00",
                            desc: "Loch Lomond south shore",
                          },
                          {
                            duration: "60 Mins",
                            price: "£225.00",
                            desc: "Full Loch & Trossachs tour",
                          },
                        ].map((pkg) => (
                          <div key={pkg.duration} className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-2xl font-black text-white tabular-nums">
                                {pkg.price}
                              </span>
                              <span className="font-mono text-xs font-semibold text-zinc-400">
                                / {pkg.duration}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400">{pkg.desc}</div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <MagneticButton
                          asChild
                          className="h-12 px-7 text-xs font-bold shadow-none active:scale-[0.98]"
                        >
                          <Link to="/flying/experience">
                            Book Experience Flight Voucher
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </MagneticButton>
                      </div>
                    </div>
                  </div>

                  {/* Right 5 Columns: Asymmetrical Stack (Breakout Airframe + High-Density Telemetry) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Bento Cell 2: Breakout Airframe Stage */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <PlaneTakeoff className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Training Airframe
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">G-BCDF</span>
                      </div>

                      {/* Overlapping Breakout Airframe Image */}
                      <div className="relative mt-4 lg:-mr-8 lg:-mt-4 z-10">
                        <div className="overflow-hidden rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] group">
                          <img
                            src="/images/piper-pa28-apron.jpg"
                            alt="Piper PA-28 Cherokee Archer III on the Cumbernauld apron"
                            className="h-56 sm:h-64 lg:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                        <strong className="text-white">Low-Wing Ground Effect:</strong> The PA-28
                        Cherokee Archer III cushions touchdowns onto Cumbernauld&apos;s 820m asphalt
                        runway, giving students instinctive flare control.
                      </p>
                    </div>

                    {/* Bento Cell 3: High-Density Telemetry & What to Expect */}
                    <div className="glass-card rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Flight Profile Dossier
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">EGPG Circuit</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Departure Runway</span>
                          <span className="font-mono font-bold text-white">
                            EGPG 820m Hard Asphalt
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Cruising Corridor</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            2,500 – 3,500 ft AMSL
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Avionics & Controls</span>
                          <span className="font-mono font-bold text-white">
                            Dual Controls / Garmin
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] p-3.5 space-y-1.5">
                        <div className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Briefing & Walkaround
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Arrive at Cumbernauld Airport clubhouse, meet your instructor for a
                          15-minute briefing, and walk out to the aircraft. You will take the
                          controls immediately once established in the climb!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PATHWAY 2: LEARN TO FLY (Inclusive Training) */}
              <TabsContent
                value="training"
                forceMount
                className="col-start-1 row-start-1 mt-0 data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden data-[state=active]:visible"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left 7 Columns: Training Scope, Rates & CTA */}
                  <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative overflow-hidden">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                          Flight Training
                        </span>
                        <span className="text-white/30">/</span>
                        <span className="text-xs font-mono text-zinc-400">
                          DTO Certified Instruction
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                        Learn to fly at Cumbernauld with seasoned instructors
                      </h3>

                      <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
                        Phoenix Flight Academy provides comprehensive, one-to-one flight instruction
                        tailored to your aviation goals. Whether you are aiming for a full Private
                        Pilot Licence (PPL), a Light Aircraft Pilot Licence (LAPL), or adding night
                        and instrument ratings, our 30+ years of instructional experience ensures
                        safe, methodical progress.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        {[
                          "UK CAA PPL(A) & LAPL(A) instruction",
                          "Night rating & IMC / IR(R) qualifications",
                          "Ground school theory tutoring & exam prep",
                          "Cross-country navigation to UK aerodromes",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90"
                          >
                            <CheckCircle2 className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Flight Training Rates
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-12 gap-y-4">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-black text-white tabular-nums">
                              £210.00
                            </span>
                            <span className="font-mono text-xs font-semibold text-zinc-400">
                              / hr wet
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-zinc-300">
                            Dual Instruction
                          </div>
                          <div className="text-xs text-zinc-400">
                            Senior CFI instructor, fuel & home landing fees included
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-black text-white tabular-nums">
                              £175.00
                            </span>
                            <span className="font-mono text-xs font-semibold text-zinc-400">
                              / hr wet
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-zinc-300">Supervised Solo</div>
                          <div className="text-xs text-zinc-400">
                            Consolidation flight hours towards licence issue
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <MagneticButton
                          asChild
                          className="h-12 px-7 text-xs font-bold shadow-none active:scale-[0.98]"
                        >
                          <Link to="/flying/learn-to-fly">
                            Explore Flight Training Pathway
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </MagneticButton>
                      </div>
                    </div>
                  </div>

                  {/* Right 5 Columns: Asymmetrical Stack (Breakout Walkaround + Training Mentorship) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Bento Cell 2: Breakout Preflight Walkaround Image */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Aviation Mentorship
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">
                          30+ Yrs Experience
                        </span>
                      </div>

                      {/* Overlapping Breakout Walkaround Image */}
                      <div className="relative mt-4 lg:-mr-8 lg:-mt-4 z-10">
                        <div className="overflow-hidden rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] group">
                          <img
                            src="/images/piper-pa28-walkaround.jpg"
                            alt="Student and flight instructor conducting pre-flight fuel check on the Piper PA-28"
                            className="h-56 sm:h-64 lg:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                        <strong className="text-white">Single Airframe Consistency:</strong> Train
                        on the same dedicated Piper PA-28 Archer III, eliminating cockpit
                        re-adaptation between lessons.
                      </p>
                    </div>

                    {/* Bento Cell 3: Syllabus Steps */}
                    <div className="glass-card rounded-3xl p-6 space-y-3">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Instruction Highlights
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">CAA Syllabus</span>
                      </div>

                      <div className="divide-y divide-white/5">
                        {[
                          {
                            title: "Flexible Training Cadence",
                            detail: "Fly weekly or intensive blocks around your work commitments.",
                          },
                          {
                            title: "Scottish Highland Navigation",
                            detail:
                              "Master mountain valley routes, coastal waypoints, and airspace.",
                          },
                          {
                            title: "In-House Ground Examinations",
                            detail:
                              "Complete theoretical exams directly at our Cumbernauld facility.",
                          },
                        ].map((step, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                            <div className="text-xs font-bold text-white">{step.title}</div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                              {step.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PATHWAY 3: AIRCRAFT SELF-HIRE */}
              <TabsContent
                value="hire"
                forceMount
                className="col-start-1 row-start-1 mt-0 data-[state=inactive]:invisible data-[state=inactive]:pointer-events-none data-[state=inactive]:h-0 data-[state=inactive]:overflow-hidden data-[state=active]:visible"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left 7 Columns: Self-Hire Offering, Rate & CTA */}
                  <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative overflow-hidden">
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                          Qualified Aviator Hire
                        </span>
                        <span className="text-white/30">/</span>
                        <span className="text-xs font-mono text-zinc-400">Ready to Dispatch</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                        Piper PA-28 wet self-hire for licensed aviators
                      </h3>

                      <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
                        Hold a current UK CAA PPL or LAPL? Phoenix Flight Academy offers wet
                        self-hire on our impeccably maintained Piper PA-28 Cherokee / Archer III.
                        Cumbernauld Airport provides rapid departures without commercial slot
                        delays, unlocking immediate cross-country flights to the Highlands, the
                        Western Isles, and the UK airfield network.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        {[
                          "Standard 1-hour club checkout with our CFI",
                          "Multi-day & overnight touring by prior arrangement",
                          "Direct online scheduling and booking calendar",
                          "Zero monthly membership or standing club fees",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90"
                          >
                            <CheckCircle2 className="h-4 w-4 text-zinc-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Self-Hire Rates
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-2xl font-black text-white tabular-nums">
                            £175.00
                          </span>
                          <span className="font-mono text-xs font-semibold text-zinc-400">
                            / tach hr wet
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-300">
                          Piper PA-28 Archer III (G-BCDF)
                        </div>
                        <div className="text-xs text-zinc-400">
                          Includes all AVGAS 100LL fuel, oil, and comprehensive hull insurance
                        </div>
                      </div>

                      <div className="pt-2">
                        <MagneticButton
                          asChild
                          className="h-12 px-7 text-xs font-bold shadow-none active:scale-[0.98]"
                        >
                          <Link to="/flying/self-hire">
                            Book Aerodrome Checkout
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </MagneticButton>
                      </div>
                    </div>
                  </div>

                  {/* Right 5 Columns: Asymmetrical Stack (Breakout Touring + Checkout Requirements) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Bento Cell 2: Breakout Touring Flight Image */}
                    <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Airframe Dossier
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">G-BCDF / 180 HP</span>
                      </div>

                      {/* Overlapping Breakout Touring Image */}
                      <div className="relative mt-4 lg:-mr-8 lg:-mt-4 z-10">
                        <div className="overflow-hidden rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] group">
                          <img
                            src="/images/piper-pa28-touring.jpg"
                            alt="Piper PA-28 cruising above Scottish mountain peaks"
                            className="h-56 sm:h-64 lg:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                        <strong className="text-white">Lycoming O-360 Reliability:</strong> 180 HP
                        powerplant, 115 KTAS cruise speed, 4 seats, dual Garmin comms, and 50-gallon
                        fuel capacity.
                      </p>
                    </div>

                    {/* Bento Cell 3: Checkout Criteria */}
                    <div className="glass-card rounded-3xl p-6 space-y-3">
                      <div className="flex items-center justify-between pb-3">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-primary" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Checkout Requirements
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">Currency Check</span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Valid UK CAA PPL/LAPL, current SEP class rating, valid medical (Class 1, 2,
                        or LAPL), and 3 takeoffs/landings in the last 90 days. Checkout includes
                        local departure and circuit procedures.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* ═══════ STATS COUNTER SECTION (Atmospheric High-Contrast Telemetry) ═══════ */}
      <section
        ref={statsRef}
        className="bg-[oklch(0.08_0.02_260)] py-24 sm:py-32 border-b border-white/10 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 sm:gap-y-12 lg:gap-y-0 lg:divide-x lg:divide-white/5">
            {[
              {
                value: hoursCount,
                suffix: hoursStat.suffix,
                label: "Flight Hours Instructed",
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
                label: "Dedicated Training Fleet",
                prefix: "",
              },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`px-4 sm:px-8 text-center transition-all duration-700 ease-out ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono tabular-nums tracking-tight">
                  {stat.prefix}
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="mt-3 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ASYMMETRICAL BENTO: OUR TRAINING & HIRE FLEET ═══════ */}
      <section
        ref={fleetRef}
        className="relative bg-[oklch(0.07_0.02_260)] py-28 sm:py-36 border-b border-white/10 overflow-x-clip stage-lighting-spotlight"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            className={`max-w-3xl transition-all duration-700 ease-out ${
              fleetVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="glass-pill px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-primary">
                Cumbernauld Hangar
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our Training & Hire Fleet
            </h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-zinc-400">
              When you step into the cockpit at Phoenix, you fly our dedicated Piper PA-28 Cherokee
              Archer III — one of the most dependable, forgiving, and proven aircraft in aviation
              history.
            </p>
          </div>

          {/* 12-Column Asymmetrical Bento Composition */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Cell 1 (Span 8 cols): Main Airframe Stage with Breakout Flight Imagery */}
            <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-10 relative overflow-visible flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                      Airframe Registry
                    </span>
                    <span className="text-white/40">/</span>
                    <span className="font-mono text-xs font-bold text-white">G-BCDF</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Piper PA-28-181 Archer III
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                  Dedicated single-airframe training reality. Impeccably maintained under strict UK
                  CAA Part-ML maintenance regulations, featuring dual flight controls, an
                  exceptionally reliable 180 HP Lycoming O-360 powerplant, and responsive low-wing
                  aerodynamics designed for Scottish mountain air.
                </p>
              </div>

              {/* Overlapping Breakout Airframe Image */}
              <div className="relative mt-4 lg:-mr-10 lg:-mb-6 z-10">
                <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] group">
                  <img
                    src="/images/piper-pa28-flight.jpg"
                    alt="Piper PA-28 Cherokee Archer III banking over Scottish highlands"
                    className="h-72 sm:h-96 lg:h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            {/* Cell 2 (Span 4 cols): Consolidated 4 Human-Readable Specs & Technical POH Specs Modal */}
            <div className="lg:col-span-4 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                      Aircraft Specifications
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Engine", value: "180 HP Lycoming" },
                    { label: "Cruise Speed", value: "115 kts" },
                    { label: "Range", value: "500+ nm" },
                    { label: "Seating", value: "4 Seats" },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="rounded-2xl bg-white/[0.03] p-4 flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        {spec.label}
                      </span>
                      <span className="font-mono text-base font-bold text-white mt-1.5 tabular-nums">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Single Understated Technical POH Specs Modal Trigger */}
              <Dialog open={pohOpen} onOpenChange={setPohOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setPohOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-4 py-3 text-xs font-mono font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white cursor-pointer"
                  >
                    <span>View Technical POH Specs</span>
                    <Info className="h-3.5 w-3.5 text-zinc-400" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-[#0B0F17] border-0 text-white shadow-2xl p-6 sm:p-8">
                  <DialogHeader className="text-left space-y-1.5 pb-4">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                      Pilot Operating Handbook (POH)
                    </div>
                    <DialogTitle className="text-xl sm:text-2xl font-black text-white">
                      Piper PA-28-181 Archer III (G-BCDF)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 leading-relaxed">
                      Technical operating limits, placarded airspeed matrix, and airframe
                      engineering telemetry.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* V-Speeds Matrix Placard */}
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3">
                        V-Speed Placard Limitations
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { code: "Vy", label: "Best Rate of Climb", speed: "76 KIAS" },
                          { code: "Vx", label: "Best Angle of Climb", speed: "64 KIAS" },
                          { code: "Vso", label: "Stall (Full Flaps)", speed: "45 KIAS" },
                          { code: "Vs1", label: "Stall (Clean)", speed: "50 KIAS" },
                          { code: "Va", label: "Manoeuvring Speed", speed: "113 KIAS" },
                          { code: "Vfe", label: "Max Flap Extended", speed: "102 KIAS" },
                          { code: "Vne", label: "Never Exceed Speed", speed: "154 KIAS" },
                          { code: "Vc", label: "Cruise (75% Power)", speed: "115 KTAS" },
                        ].map((v) => (
                          <div key={v.code} className="rounded-xl bg-white/[0.03] p-3 text-center">
                            <span className="block font-mono font-bold text-primary text-xs">
                              {v.code}
                            </span>
                            <span className="block font-mono font-black text-white text-sm tabular-nums mt-0.5">
                              {v.speed}
                            </span>
                            <span className="block text-[10px] text-zinc-400 mt-0.5">
                              {v.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Engineering & Fuel Specifications */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-white/[0.03] p-4 space-y-1">
                        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          Powerplant & Prop
                        </div>
                        <div className="font-bold text-white">Lycoming O-360-A4M (180 HP)</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Direct-drive 4-cylinder engine with fixed-pitch Sensenich propeller.
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] p-4 space-y-1">
                        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          Fuel & Endurance
                        </div>
                        <div className="font-bold text-white">189 L / 50 USG (48 USG Usable)</div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          AVGAS 100LL fuel burn approx 38 L/hr (~4.5 hrs total endurance).
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="text-xs text-zinc-300 hover:text-white"
                      >
                        <Link to="/fleet">
                          Open Full Airframe Tech Dossier{" "}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Cell 3 (Span 5 cols): Cockpit Perspective Breakout */}
            <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 relative overflow-visible flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Cockpit Avionics
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">Dual Controls</span>
              </div>

              {/* Inset Cockpit Perspective Breakout Image */}
              <div className="relative -mt-2 lg:-mt-4 z-10">
                <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] group">
                  <img
                    src="/images/piper-pa28-cockpit.jpg"
                    alt="Piper PA-28 analog cockpit and avionics over Scottish glens"
                    className="h-56 sm:h-64 lg:h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-white">Low-Wing Pilot Ergonomics</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Superior upward and banked visibility in the traffic circuit. Traditional analog
                  six-pack instrumentation builds foundational scan discipline, paired with Garmin
                  avionics.
                </p>
              </div>
            </div>

            {/* Cell 4 (Span 7 cols): Fleet Dispatch & Technical Dossier */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3">
                  <Fuel className="h-4 w-4 text-primary" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">
                    Flight Operations & Dispatch
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-1">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Wet Self-Hire Rate
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                      £175.00 <span className="text-xs font-normal text-zinc-400">/ tach hr</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      AVGAS 100LL fuel & comprehensive insurance included
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Dual Instruction Rate
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                      £210.00 <span className="text-xs font-normal text-zinc-400">/ hr</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Senior CFI flight instructor & home landing fees
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stationed at Cumbernauld Hangar 2 with swift dispatch clearances. Ideal for
                  student cross-country qualifying flights and qualified pilot touring across the
                  Scottish islands.
                </p>
              </div>

              <div className="pt-2">
                <MagneticButton
                  asChild
                  size="lg"
                  className="h-12 px-7 text-sm font-bold shadow-none active:scale-[0.98]"
                >
                  <Link to="/fleet">
                    Explore PA-28 Technical Dossier
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS SECTION (Moody Stage Atmosphere) ═══════ */}
      <section className="relative bg-[oklch(0.08_0.02_260)] py-28 sm:py-36 overflow-hidden border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="glass-pill px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-primary">
              Student Reviews
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              What Our Pilots Say
            </h2>
            <p className="mt-3 text-base text-white/70 leading-relaxed">
              Authentic feedback from students and licensed aviators who trained at Cumbernauld
              Airport.
            </p>
          </div>

          <div
            className="relative max-w-3xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Testimonial glass card */}
            <div className="relative overflow-hidden rounded-3xl glass-card p-8 sm:p-12 shadow-none min-h-[280px]">
              <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/15" />

              <div key={activeTestimonial} className="animate-fade-slide">
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[activeTestimonial].stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <blockquote className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/90 italic font-normal">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="h-12 w-12 rounded-full object-cover shadow-md"
                  />
                  <div>
                    <p className="font-bold text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-zinc-400">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={prevTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeTestimonial
                        ? "w-8 bg-primary"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextTestimonial}
                className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA BANNER (Cinematic Flight Deck Backdrop & Magnetic CTAs) ═══════ */}
      <section className="relative overflow-hidden bg-[oklch(0.07_0.02_260)] py-28 sm:py-36 stage-lighting">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/piper-pa28-cockpit.jpg"
            alt="Piper PA-28 Cherokee cockpit flight deck over Scottish glens"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.07_0.02_260)] via-[oklch(0.07_0.02_260)]/85 to-[oklch(0.07_0.02_260)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to take the controls?
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-zinc-400">
            Whether it's your first flight or your hundredth, Phoenix Flight Training is here to
            help you reach your aviation goals. Book your introductory flight voucher or checkout
            today.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <MagneticButton
              asChild
              size="lg"
              className="h-14 px-8 text-base font-bold shadow-none active:scale-[0.98]"
            >
              <Link to="/flying/experience">Book Experience Flight</Link>
            </MagneticButton>
            <MagneticButton
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-bold border-0 bg-white/5 text-white hover:bg-white/10 ring-offset-[oklch(0.07_0.02_260)] backdrop-blur-md active:scale-[0.98]"
            >
              <Link to="/contact">Get in Touch</Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
