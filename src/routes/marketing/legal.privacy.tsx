import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/marketing/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Skyline" },
      {
        name: "description",
        content: "How Skyline collects, uses and protects personal data.",
      },
      { property: "og:title", content: "Privacy Policy — Skyline" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: today</p>
        <div className="prose mt-10 max-w-none space-y-6 text-muted-foreground">
          <p>
            This Privacy Policy describes how Skyline ("we", "us") collects, uses
            and shares personal data when you use the Service.
          </p>
          <h2 className="text-base font-semibold text-foreground">Data we collect</h2>
          <p>
            Account information you provide (name, email, organisation), the data
            you put into the Service (students, bookings, fleet, documents), and
            basic operational logs needed to run and secure the Service.
          </p>
          <h2 className="text-base font-semibold text-foreground">How we use it</h2>
          <p>
            Only to operate and improve the Service for you. We do not sell your
            data, and we do not use it to train AI models.
          </p>
          <h2 className="text-base font-semibold text-foreground">Sub-processors</h2>
          <p>
            We use a small number of trusted infrastructure providers (hosting,
            database, email, payments). A current list is available on request.
          </p>
          <h2 className="text-base font-semibold text-foreground">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal
            data at any time. Email privacy@skyline.aero.
          </p>
          <p className="text-xs italic">
            This is a placeholder template. Replace with a policy drafted or
            reviewed by your lawyer before going to market.
          </p>
        </div>
      </div>
    </div>
  );
}