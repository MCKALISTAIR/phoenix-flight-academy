import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketing/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Skyline" },
      {
        name: "description",
        content:
          "Talk to the Skyline team. Book a demo, ask about migration, or start a free trial.",
      },
      { property: "og:title", content: "Contact — Skyline" },
      {
        property: "og:description",
        content: "Book a demo, ask about migration, or start a free trial.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      company: String(form.get("company") ?? "").trim() || null,
      message: String(form.get("message") ?? "").trim(),
      source: "marketing/contact",
    };
    if (!payload.name || !payload.email || !payload.message) {
      setError("Please fill in name, email and a message.");
      setState("error");
      return;
    }
    const { error } = await supabase.from("contact_submissions").insert(payload);
    if (error) {
      setError(error.message);
      setState("error");
      return;
    }
    setState("done");
    e.currentTarget.reset();
  }

  return (
    <div className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Let's talk.</h1>
          <p className="mt-4 text-muted-foreground">
            Book a demo, ask about migration, or start a free 30-day trial.
            We typically reply within one working day.
          </p>
          <div className="mt-10 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <a href="mailto:hello@skyline.aero" className="hover:text-primary">
                hello@skyline.aero
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">United Kingdom — operating worldwide.</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-8 shadow-sm"
        >
          {state === "done" ? (
            <div className="flex flex-col items-start gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold">Thanks — message received.</h2>
              <p className="text-sm text-muted-foreground">
                We'll be in touch within one working day. Keep an eye on your inbox
                (and your spam folder, just in case).
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <Field label="Your name" name="name" required placeholder="Jane Pilot" />
              <Field label="Email" name="email" type="email" required placeholder="you@school.aero" />
              <Field label="Flight school" name="company" placeholder="Cumbernauld Flight Centre" />
              <div>
                <label className="text-sm font-medium" htmlFor="message">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="We run 6 aircraft and 4 instructors, looking to replace our current booking system…"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={state === "submitting"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {state === "submitting" ? "Sending…" : "Send message"}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}