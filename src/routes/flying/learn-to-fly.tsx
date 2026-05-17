import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flying/learn-to-fly")({
  component: LearnToFlyPage,
  head: () => ({
    meta: [{ title: "Learn to Fly | Phoenix Flight Training" }],
  }),
});

function LearnToFlyPage() {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            Learn to Fly
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-background/80">
            Comprehensive training for your Private Pilot License (PPL) with experienced, friendly instructors.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-lg">
          <p className="text-xl leading-relaxed text-muted-foreground">
            Earning your Private Pilot License (PPL) is a challenging but incredibly rewarding experience. At Phoenix Flight Training, we guide you through every step of the syllabus.
          </p>
          <div className="mt-10 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">The PPL Syllabus</h2>
              <p className="mt-4 text-muted-foreground">
                The PPL requires a minimum of 45 hours of flight training, which includes dual instruction with an instructor and solo flight time. You must also pass written exams in subjects such as Aviation Law, Navigation, and Meteorology.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">Why Choose Us?</h2>
              <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
                <li>Experienced, patient instructors dedicated to your success.</li>
                <li>A well-maintained fleet of Cessna 172 and Piper PA28 aircraft.</li>
                <li>Uncontrolled airspace around Cumbernauld, meaning less time waiting and more time flying.</li>
                <li>A friendly, club-like atmosphere.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <p className="mb-6 text-muted-foreground">Ready to start your journey?</p>
            <a href="/contact" className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105">
              Contact Us for Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
