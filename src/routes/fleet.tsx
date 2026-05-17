import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/fleet")({
  component: FleetPage,
  head: () => ({
    meta: [{ title: "Our Fleet | Phoenix Flight Training" }],
  }),
});

function FleetPage() {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            Our Fleet
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-background/80">
            Train and fly in some of the most popular and reliable aircraft in general aviation.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Cessna 172 */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="aspect-video w-full bg-muted">
               <img src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=800&auto=format&fit=crop" alt="Cessna 172" className="h-full w-full object-cover" />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground">Cessna 172</h2>
              <p className="mt-4 text-muted-foreground">
                The Cessna 172 Skyhawk is the most popular single-engine aircraft ever built. It's incredibly stable, forgiving, and perfect for initial flight training.
              </p>
            </div>
          </div>

          {/* Piper PA28 */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="aspect-video w-full bg-muted">
               <img src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800&auto=format&fit=crop" alt="Piper PA28" className="h-full w-full object-cover" />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground">Piper PA28</h2>
              <p className="mt-4 text-muted-foreground">
                The Piper PA-28 Cherokee is a family of light aircraft designed for flight training, air taxi, and personal use. A fantastic low-wing alternative to the Cessna.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
