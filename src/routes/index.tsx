import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, PlaneTakeoff, Sparkles, Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/")(
  {
  component: Index,
  head: () => ({
    meta: [
      { title: "Phoenix Flight Training | Learn to Fly at Cumbernauld" },
      { name: "description", content: "Start your aviation journey with friendly instructors and unforgettable experiences at Cumbernauld Airport." },
    ],
  }),
});

// --- Animated counter hook ---
function useCounter(target: number, duration: number, isVisible: boolean) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  return count;
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
    quote: "The instructors at Phoenix made me feel confident from my very first lesson. Captain McKay's patience and expertise helped me solo in just 12 hours. I couldn't recommend them more highly.",
    name: "James Morrison",
    role: "PPL Student, 2025",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote: "I bought my wife a trial lesson for her birthday and she's now halfway through her PPL! The experience flight was incredible — flying over Loch Lomond with the mountains in the background was breathtaking.",
    name: "Claire Henderson",
    role: "Experience Flight & PPL Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote: "As a self-hire renter, the checkout process was thorough but fair. The aircraft are impeccably maintained and the booking system is straightforward. Phoenix is the best club I've flown with in Scotland.",
    name: "Robert MacLeod",
    role: "Self-Hire Renter, PPL(A)",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop&crop=face",
    stars: 5,
  },
  {
    quote: "I'd been nervous about flying for years, but the team at Phoenix were so welcoming that I forgot about my anxiety after ten minutes in the air. Best money I've ever spent.",
    name: "Fiona Campbell",
    role: "30-Minute Trial Lesson",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop&crop=face",
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
  const hoursCount = useCounter(4500, 2000, statsVisible);
  const studentsCount = useCounter(250, 1800, statsVisible);
  const yearsCount = useCounter(15, 1500, statsVisible);
  const aircraftCount = useCounter(3, 1200, statsVisible);

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
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2000&auto=format&fit=crop"
            alt="Aircraft in flight"
            className="h-full w-full object-cover opacity-40 scale-105 animate-[pulse_8s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>

        {/* Ambient floating particles */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-primary/30 animate-[float_7s_ease-in-out_infinite]" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/10 animate-[float_9s_ease-in-out_infinite_1s]" />
          <div className="absolute bottom-1/3 left-1/2 w-0.5 h-0.5 rounded-full bg-primary/20 animate-[float_11s_ease-in-out_infinite_2s]" />
          <div className="absolute top-2/3 right-1/4 w-1 h-1 rounded-full bg-white/15 animate-[float_8s_ease-in-out_infinite_0.5s]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Rotating badge */}
            <span className="animate-stagger-1 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm border border-primary/20 overflow-hidden">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span key={badgeIndex} className="animate-fade-slide whitespace-nowrap">
                {badgeMessages[badgeIndex]}
              </span>
            </span>

            <h1 className="animate-stagger-2 mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn to fly at <br className="hidden sm:block" />
              <span className="animate-shimmer bg-gradient-to-r from-primary via-orange-300 to-primary bg-clip-text text-transparent">Cumbernauld Airport</span>
            </h1>

            <p className="animate-stagger-3 mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Start your aviation journey with friendly instructors and unforgettable experiences. Explore the breathtaking skies of Scotland from your local flying school.
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

      {/* ═══════ SERVICES SECTION ═══════ */}
      <section ref={sectionRef} className="bg-background py-24 sm:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className={`mb-20 max-w-2xl transition-all duration-1000 ease-out ${
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Your Training Roadmap</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Your Aviation Journey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Whether you're looking for a one-off adventure or want to earn your Private Pilot License, we have the right path for you.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Compass,
                title: "Experience Flights",
                desc: "Take the controls for the very first time. The perfect gift or introduction to the beautiful world of Scottish aviation.",
                link: "/flying/experience",
                cta: "Find out more",
                delay: "100ms",
              },
              {
                icon: BookOpen,
                title: "Learn to Fly",
                desc: "Comprehensive flight syllabus instruction for your Private Pilot License (PPL) under dedicated EASA and CAA certified line CFI.",
                link: "/flying/learn-to-fly",
                cta: "Start your syllabus",
                delay: "250ms",
              },
              {
                icon: PlaneTakeoff,
                title: "Self Hire",
                desc: "Already hold your pilot license? Rent our exceptionally maintained, fully insured Cessna 172 and Piper PA28 fleet.",
                link: "/flying/self-hire",
                cta: "View fleet & rates",
                delay: "400ms",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 ${
                  sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
                }`}
                style={{ transitionDelay: card.delay }}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                  <card.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{card.title}</h3>
                <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
                <Link
                  to={card.link}
                  className="inline-flex items-center text-sm font-semibold text-primary group/link hover:underline"
                >
                  {card.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STATS COUNTER SECTION ═══════ */}
      <section ref={statsRef} className="bg-[oklch(0.12_0.04_250)] py-20 sm:py-24 border-y border-white/5 relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: hoursCount, suffix: "+", label: "Flight Hours Logged", prefix: "" },
              { value: studentsCount, suffix: "+", label: "Students Trained", prefix: "" },
              { value: yearsCount, suffix: "+", label: "Years at Cumbernauld", prefix: "" },
              { value: aircraftCount, suffix: "", label: "Training Aircraft", prefix: "" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ease-out ${
                  statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl tabular-nums">
                  {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                </div>
                <p className="mt-2 text-sm font-medium text-white/60 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FLEET TEASER SECTION ═══════ */}
      <section ref={fleetRef} className="bg-muted/50 py-24 sm:py-32 relative border-b border-border overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Image side */}
            <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-lg border border-border transition-all duration-1000 ease-out ${
              fleetVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-12 scale-95"
            }`}>
              <img
                src="/cessna172.png"
                alt="Cessna 172 Skyhawk"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Text details side */}
            <div className={`space-y-6 transition-all duration-1000 ease-out delay-200 ${
              fleetVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Cumbernauld Hangar</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Our Fleet
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                When you start your flight instruction at Phoenix, you secure access to the most dependable general aviation aircraft ever designed.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Our exceptionally maintained, fully certified hangar includes stable high-wing Cessna 172 units and agile low-wing Piper PA28 cross-country tourers.
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Student Reviews</span>
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
                    <p className="font-bold text-foreground">{testimonials[activeTestimonial].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[activeTestimonial].role}</p>
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
                      idx === activeTestimonial ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
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
            Whether it's your first flight or your hundredth, Phoenix Flight Training is here to help you reach your aviation goals. Book your introductory lesson today.
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
