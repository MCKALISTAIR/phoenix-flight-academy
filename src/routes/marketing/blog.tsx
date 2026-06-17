import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/marketing/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Skyline" },
      {
        name: "description",
        content:
          "Notes from the team: building software for flight schools, lessons from real operations, and product updates.",
      },
      { property: "og:title", content: "Blog — Skyline" },
      {
        property: "og:description",
        content: "Notes from the team building software for flight schools.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          The blog is coming.
        </h1>
        <p className="mt-4 text-muted-foreground">
          We're writing up the lessons from real flight-school operations,
          product notes, and the occasional rant about avionics UX. Subscribe
          and we'll let you know when the first post lands.
        </p>
      </div>
    </div>
  );
}