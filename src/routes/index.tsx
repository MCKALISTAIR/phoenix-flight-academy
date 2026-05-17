import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, PlaneTakeoff } from "lucide-react";

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
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-foreground py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          {/* Placeholder image for a Cessna or beautiful sky */}
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2000&auto=format&fit=crop"
            alt="Aircraft in flight"
            className="h-full w-full object-cover opacity-40"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn to fly at <br className="hidden sm:block" />
              <span className="text-primary">Cumbernauld Airport</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/90 sm:text-xl">
              Start your aviation journey with friendly instructors and unforgettable experiences. Explore the breathtaking skies of Scotland from the comfort of your local flying school.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/booking"
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
              >
                Portal Login
              </Link>
              <Link
                to="/flying/learn-to-fly"
                className="inline-flex h-14 items-center justify-center rounded-lg border-2 border-background bg-transparent px-8 text-base font-semibold text-background transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
              >
                Discover Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-background py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Aviation Journey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're looking for a one-off adventure or want to earn your Private Pilot License, we have the right path for you.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Experience Flights</h3>
              <p className="mb-8 flex-1 text-muted-foreground">
                Take the controls for the very first time. The perfect gift or introduction to the world of aviation.
              </p>
              <Link
                to="/flying/experience"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Find out more <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Learn to Fly</h3>
              <p className="mb-8 flex-1 text-muted-foreground">
                Comprehensive training for your Private Pilot License (PPL) with experienced, friendly instructors.
              </p>
              <Link
                to="/flying/learn-to-fly"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Start your syllabus <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <PlaneTakeoff className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">Self Hire</h3>
              <p className="mb-8 flex-1 text-muted-foreground">
                Already have your license? Hire our well-maintained Cessna 172 or Piper PA28 fleet.
              </p>
              <Link
                to="/flying/self-hire"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View fleet & rates <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Teaser Section */}
      <section className="bg-muted py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-foreground">
               <img
                  src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=1200&auto=format&fit=crop"
                  alt="Cessna 172"
                  className="h-full w-full object-cover"
                />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Our Fleet
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                When you start your flying lessons at Phoenix Flight Training you will have access to some of the most popular training aircraft in the world. 
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Our well maintained and fully insured fleet of aircraft based at Cumbernauld airport includes the reliable Cessna 172 and the agile Piper PA28.
              </p>
              <div className="mt-10">
                <Link
                  to="/fleet"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Explore the Fleet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
