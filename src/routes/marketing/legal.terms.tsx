import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/marketing/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Skyline" },
      {
        name: "description",
        content: "Terms of service governing the use of the Skyline platform.",
      },
      { property: "og:title", content: "Terms of Service — Skyline" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="border-b border-border/60">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: today</p>
        <div className="prose mt-10 max-w-none space-y-6 text-muted-foreground">
          <p>
            These Terms of Service ("Terms") govern your access to and use of
            Skyline (the "Service"). By creating an account or using the Service
            you agree to these Terms. If you do not agree, do not use the Service.
          </p>
          <h2 className="text-base font-semibold text-foreground">1. Your account</h2>
          <p>
            You are responsible for activity on your account and for keeping your
            credentials secure. You must be at least 18 years old to sign up.
          </p>
          <h2 className="text-base font-semibold text-foreground">2. Your data</h2>
          <p>
            You retain all rights to the data you put into Skyline. You grant us
            a limited licence to process it solely to operate the Service for you.
          </p>
          <h2 className="text-base font-semibold text-foreground">3. Subscription and payment</h2>
          <p>
            Paid plans are billed monthly or annually in advance. You can cancel
            anytime; access continues until the end of the paid period.
          </p>
          <h2 className="text-base font-semibold text-foreground">4. Acceptable use</h2>
          <p>
            You agree not to misuse the Service, including attempting to access
            another customer's data, reverse engineering, or using the Service
            for unlawful activity.
          </p>
          <h2 className="text-base font-semibold text-foreground">5. Liability</h2>
          <p>
            The Service is provided "as is". To the maximum extent permitted by
            law, our aggregate liability under these Terms is limited to the
            fees you paid in the 12 months preceding the claim.
          </p>
          <h2 className="text-base font-semibold text-foreground">6. Contact</h2>
          <p>
            Questions about these Terms? Email hello@skyline.aero.
          </p>
          <p className="text-xs italic">
            This is a placeholder template. Replace with terms drafted or
            reviewed by your lawyer before going to market.
          </p>
        </div>
      </div>
    </div>
  );
}