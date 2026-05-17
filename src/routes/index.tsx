import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, PlaneTakeoff, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Phoenix Flight Training | Learn to Fly at Cumbernauld" },
      { name: "description", content: "Start your aviation journey with friendly instructors and unforgettable experiences at Cumbernauld Airport." },
    ],
  }),
});

function Index() {
  const [sectionVisible, setSectionVisible] = useState(false);
  const [fleetVisible, setFleetVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const fleetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // Triggers slightly before element enters viewport
    };

    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSectionVisible(true);
        sectionObserver.disconnect(); // Only animate in once
      }
    }, observerOptions);

    const fleetObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setFleetVisible(true);
        fleetObserver.disconnect();
      }
    }, observerOptions);

    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    if (fleetRef.current) fleetObserver.observe(fleetRef.current);

    return () => {
      sectionObserver.disconnect();
      fleetObserver.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[oklch(0.12_0.04_250)] py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2000&auto=format&fit=crop"
            alt="Aircraft in flight"
            className="h-full w-full object-cover opacity-45 scale-105 animate-[pulse_8s_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-[fadeIn_1s_ease-out]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Pilot Academy Cumbernauld
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn to fly at <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Cumbernauld Airport</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              Start your aviation journey with friendly instructors and unforgettable experiences. Explore the breathtaking skies of Scotland from your local flying school.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/booking"
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/95 focus:outline-none"
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

      {/* Services Section with Staggered Scroll Entrance Animations */}
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
            
            {/* Card 1 - Experience Flights */}
            <div
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Experience Flights</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                Take the controls for the very first time. The perfect gift or introduction to the beautiful world of Scottish aviation.
              </p>
              <Link
                to="/flying/experience"
                className="inline-flex items-center text-sm font-semibold text-primary group/link hover:underline"
              >
                Find out more 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

            {/* Card 2 - Learn to Fly */}
            <div
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
              }`}
              style={{ transitionDelay: "250ms" }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Learn to Fly</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                Comprehensive flight syllabus instruction for your Private Pilot License (PPL) under dedicated EASA and CAA certified line CFI.
              </p>
              <Link
                to="/flying/learn-to-fly"
                className="inline-flex items-center text-sm font-semibold text-primary group/link hover:underline"
              >
                Start your syllabus 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

            {/* Card 3 - Self Hire */}
            <div
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                <PlaneTakeoff className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Self Hire</h3>
              <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
                Already hold your pilot license? Rent our exceptionally maintained, fully insured Cessna 172 and Piper PA28 fleet.
              </p>
              <Link
                to="/flying/self-hire"
                className="inline-flex items-center text-sm font-semibold text-primary group/link hover:underline"
              >
                View fleet & rates 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Animated Fleet Teaser Section */}
      <section ref={fleetRef} className="bg-muted/50 py-24 sm:py-32 relative border-t border-border overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Image side */}
            <div className={`relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-lg border border-border transition-all duration-1000 ease-out ${
              fleetVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-12 scale-95"
            }`}>
               <img
                  src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=1200&auto=format&fit=crop"
                  alt="Cessna 172"
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
    </div>
  );
}
