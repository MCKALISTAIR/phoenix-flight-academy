import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Terms and conditions for using Phoenix Flight Training services at Cumbernauld Airport.",
      },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      <div className="bg-[oklch(0.12_0.04_250)] py-16 text-white sm:py-20 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.08),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-white/70 text-sm">Last updated: May 2026</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing Phoenix Flight Training services, booking a flight lesson, or using our web
            portal, you agree to be bound by these Terms of Service and all applicable UK aviation
            regulations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. Booking & Cancellations</h2>
          <p className="text-muted-foreground leading-relaxed">
            All flight bookings are subject to a minimum 24-hour cancellation notice. Lessons
            cancelled with less than 24 hours notice may be charged at the full hourly rate. Weather
            cancellations by Phoenix Flight Training carry no charge and will be rebooked at the
            earliest mutually convenient date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">3. Medical Requirements</h2>
          <p className="text-muted-foreground leading-relaxed">
            All student pilots undertaking solo flight must hold a valid CAA Class 2 Medical
            Certificate. It is the student's sole responsibility to ensure their medical
            certification remains current. Phoenix Flight Training accepts no liability for training
            delays arising from medical certification issues.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Aircraft Hire Conditions</h2>
          <p className="text-muted-foreground leading-relaxed">
            Self-hire pilots must hold a valid PPL or LAPL with appropriate ratings, a current Class
            2 Medical, a valid BFR within the last 24 months, and an active annual club membership.
            A club checkout flight is mandatory for all new renters regardless of prior experience.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Phoenix Flight Training carries full UK CAA-mandated third-party liability insurance.
            Personal injury, baggage loss, or consequential damages not covered under our policy
            remain the student or renter's responsibility. We strongly recommend personal aviation
            insurance for all flight operations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">6. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These terms are governed by the laws of Scotland. Any disputes shall be subject to the
            exclusive jurisdiction of the Scottish Courts.
          </p>
        </section>

        <div className="pt-4">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
