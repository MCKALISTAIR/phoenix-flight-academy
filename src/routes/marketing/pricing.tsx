import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Skyline" },
      {
        name: "description",
        content:
          "Simple per-school pricing. Start free, upgrade when you need more aircraft, students, or instructors.",
      },
      { property: "og:title", content: "Pricing — Skyline" },
      {
        property: "og:description",
        content:
          "Simple per-school pricing. Start free, upgrade when you need more aircraft, students, or instructors.",
      },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Starter",
    price: "$99",
    cadence: "/month",
    description: "Single-school operators getting started.",
    cta: "Start free trial",
    highlight: false,
    features: [
      "Up to 3 aircraft",
      "Up to 50 active students",
      "2 admin seats, unlimited customers",
      "Online bookings + payments",
      "Customer-facing site",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$249",
    cadence: "/month",
    description: "Growing schools with a full team and fleet.",
    cta: "Start free trial",
    highlight: true,
    features: [
      "Up to 15 aircraft",
      "Unlimited students",
      "Unlimited admin and instructor seats",
      "Digital flight log + endorsements",
      "Pilot verification + self-hire",
      "Custom domain & branding",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    cadence: "",
    description: "Multi-base operations, ATOs and academies.",
    cta: "Contact sales",
    highlight: false,
    features: [
      "Unlimited aircraft and bases",
      "Multi-tenant org for franchise networks",
      "SAML SSO and audit log",
      "Custom integrations & SLA",
      "Onboarding & data migration",
      "Dedicated account manager",
    ],
  },
];

function PricingPage() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Pricing that scales with your school.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start free for 30 days. No card required. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-xl border bg-card p-8 ${
                tier.highlight
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {tier.highlight && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{tier.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                {tier.cadence && (
                  <span className="text-sm text-muted-foreground">{tier.cadence}</span>
                )}
              </div>
              <Link
                to="/marketing/contact"
                className={`mt-6 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors ${
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-8 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Prices in USD. EU / UK pricing available — talk to us. Payment processing fees from Stripe apply.
        </p>
      </div>
    </div>
  );
}