import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flying/experience")({
  component: ExperiencePage,
  head: () => ({
    meta: [{ title: "Experience Flights | Phoenix Flight Training" }],
  }),
});

function ExperiencePage() {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            Experience Flights
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-background/80">
            Take the controls for the very first time. The perfect gift or introduction to the world of aviation.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-lg">
          <p className="text-xl leading-relaxed text-muted-foreground">
            An experience flight is the perfect way to see what flying a light aircraft is all about. You'll be briefed by one of our professional instructors before taking to the skies over Cumbernauld and the beautiful Scottish landscape.
          </p>
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">What to Expect</h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Pre-flight briefing on the ground.</li>
              <li>Introduction to the aircraft controls.</li>
              <li>A flight where you can take the controls yourself (if you wish!).</li>
              <li>A post-flight debriefing and a chance to ask any questions about further training.</li>
            </ul>
          </div>
          <div className="mt-10 text-center">
            <Link to="/booking" className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105">
              Book Your Experience
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
