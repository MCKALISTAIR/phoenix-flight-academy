import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/flying/self-hire")({
  component: SelfHirePage,
  head: () => ({
    meta: [{ title: "Self Hire | Phoenix Flight Training" }],
  }),
});

function SelfHirePage() {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            Self Hire
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-background/80">
            Hire our well-maintained Cessna 172 or Piper PA28 fleet.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-lg">
          <p className="text-xl leading-relaxed text-muted-foreground">
            For qualified pilots, we offer competitive rates for self-hire of our aircraft. Whether you're hour building, taking friends for a flight, or just keeping your skills sharp, our fleet is available for you.
          </p>
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground">Requirements</h2>
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>A valid PPL or higher.</li>
              <li>Current medical certificate.</li>
              <li>A club checkout flight with one of our instructors.</li>
              <li>Recent flying experience (check with us for specific recency requirements).</li>
            </ul>
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/booking" className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105">
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
