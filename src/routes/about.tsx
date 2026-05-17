import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [{ title: "About Us | Phoenix Flight Training" }],
  }),
});

function AboutPage() {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-background sm:text-5xl">
            About Us
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl prose prose-lg">
          <p className="text-xl leading-relaxed text-muted-foreground">
            Phoenix Flight Training is based at Cumbernauld Airport. We offer friendly, professional flight training for those looking to earn their Private Pilot License (PPL), as well as unforgettable experience flights.
          </p>
          {/* We can expand on this content based on the original site */}
          <h2 className="mt-10 text-2xl font-bold text-foreground">Our Story</h2>
          <p className="mt-4 text-muted-foreground">
            With years of experience flying in the challenging but beautiful Scottish airspace, our instructors are dedicated to teaching you the safest and most enjoyable ways to fly.
          </p>
        </div>
      </div>
    </div>
  );
}
