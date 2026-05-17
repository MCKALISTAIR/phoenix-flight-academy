import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Phoenix Flight Training" },
      { name: "description", content: "Privacy policy for Phoenix Flight Training, Cumbernauld Airport." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      <div className="bg-[oklch(0.12_0.04_250)] py-16 text-white sm:py-20 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.08),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-white">Privacy Policy</h1>
          <p className="mt-4 text-white/70 text-sm">Last updated: May 2026</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">1. Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Phoenix Flight Training is a UK Civil Aviation Authority (CAA) approved flight training organisation based at Cumbernauld Airport, G68 0PR, Scotland. We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you contact us, register for training, or use our booking portal, we may collect: your name, email address, phone number, date of birth, medical certificate details, pilot licence information, and training history.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">3. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your data solely to provide flight training services, maintain regulatory compliance with the CAA, manage your training record, and communicate with you about your training schedule and progress. We do not sell your data to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            Under UK GDPR, you have the right to access, rectify, erase, and port your data. To exercise any of these rights, please contact us at{" "}
            <a href="mailto:info@phoenixflighttraining.co.uk" className="text-primary hover:underline">
              info@phoenixflighttraining.co.uk
            </a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy-related enquiries, contact our Data Controller at Phoenix Flight Training, Cumbernauld Airport, G68 0PR or by email at{" "}
            <a href="mailto:info@phoenixflighttraining.co.uk" className="text-primary hover:underline">
              info@phoenixflighttraining.co.uk
            </a>.
          </p>
        </section>

        <div className="pt-4">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
