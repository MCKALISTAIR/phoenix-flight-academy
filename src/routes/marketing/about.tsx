import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/marketing/about")({
  head: () => ({
    meta: [
      { title: "About — Skyline" },
      {
        name: "description",
        content:
          "Skyline is a flight-school operations platform built by pilots who got tired of running their schools on spreadsheets.",
      },
      { property: "og:title", content: "About — Skyline" },
      {
        property: "og:description",
        content:
          "Built by pilots who got tired of running their schools on spreadsheets.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          We're building the software flight schools deserve.
        </h1>
        <div className="prose mt-10 max-w-none space-y-6 text-muted-foreground">
          <p>
            Skyline started inside a working flight school. The team behind it
            spent years running operations on spreadsheets, group chats, a
            paper diary and three different calendars that never agreed.
            Customers had to phone in to book. Instructors found out about
            cancellations on the day. AOG status was a sticky note on a clipboard.
          </p>
          <p>
            We tried every general-purpose booking and CRM tool. None of them
            understood the things a flight school cares about: wet rates,
            instructor fees per hour, EASA-style logbook entries, document
            expiries, self-hire approvals, 50hr inspections, weather-driven
            cancellations.
          </p>
          <p>
            So we built Skyline. Today it runs real operations day-to-day, and
            we're rolling it out to schools beyond the one it was born in. Our
            customers are ATOs, DTOs, experience-flight operators and self-fly
            hire clubs across the UK and Europe.
          </p>
          <p>
            We're a small team. We answer support emails ourselves. We fly the
            aircraft you fly. If you're a flight school owner or chief instructor
            and any of this resonates, get in touch — we love a chat about how
            you run things.
          </p>
        </div>
      </div>
    </div>
  );
}