import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageSquare, Compass, Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContactSearch = {
  subject?: string;
};

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    return {
      subject: search.subject as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Contact Us & Location | Phoenix Flight Training" },
      { name: "description", content: "Visit Phoenix Flight Training at Cumbernauld Airport. Phone, email, location directions, and direct message contact form." }
    ],
  }),
});

function ContactPage() {
  const search = Route.useSearch();
  const initialSubject = search.subject || "general";
  
  const [subject, setSubject] = useState(initialSubject);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const getSubjectLabel = () => {
    switch (subject) {
      case "ppl":
        return "PPL Flight Training";
      case "self-hire":
        return "Aircraft Rental & Self-Hire Checkout";
      case "voucher":
        return "Experience Flight Vouchers";
      default:
        return "General Query";
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g., name@example.com).";
    }

    if (!message.trim()) {
      newErrors.message = "Please include some details about your enquiry.";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message is too short. Please provide at least 10 characters so we can assist you better.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitting(true);
    setServerError(null);

    try {
      const subjectLabel = getSubjectLabel();
      const formattedMessage = `[Subject: ${subjectLabel}]\n\n${message.trim()}`;
      const { error: insertError } = await supabase.from("contact_submissions").insert({
        name: name.trim(),
        email: email.trim(),
        company: subjectLabel,
        message: formattedMessage,
        source: "contact_page",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to send your message. Please try again or contact operations directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Visual background hero banner */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1600&auto=format&fit=crop"
            alt="Cumbernauld hangar view"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Get in Touch</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Ready to book your first lesson or have questions about gaining your pilot license? The Phoenix flight operations line is always open.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          
          {/* Details side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-extrabold text-foreground">Flight Operations</h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                We are based directly inside the main terminal facilities at Cumbernauld Airport. Pop in to meet the crew or reach out using the operational details below.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Call Flight Line</h3>
                  <p className="mt-1 text-base text-muted-foreground">07769 690041</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Email Operations</h3>
                  <p className="mt-1 text-base text-muted-foreground">info@phoenixflighttraining.co.uk</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Terminal Hangar Location</h3>
                  <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                    Phoenix Flight Training<br />
                    Main Runway Terminal Building, Cumbernauld Airport<br />
                    G68 0PR
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map — Cumbernauld Airport */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-md border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2228.3!2d-3.979!3d55.975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4888483020d5e64d%3A0x6ae29b7e6fd42e77!2sCumbernauld%20Airport!5e0!3m2!1sen!2suk!4v1!5m2!1sen!2suk"
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cumbernauld Airport Location"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold text-slate-100 border border-white/10 flex items-center gap-2 pointer-events-none">
                <Compass className="h-3.5 w-3.5 text-primary" />
                EGPG — Cumbernauld Airport
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm h-fit relative overflow-hidden">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 dark:text-green-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Inquiry Received</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Thank you, {name}. Your inquiry regarding <strong className="text-primary">{getSubjectLabel()}</strong> has been dispatched directly to the Phoenix Flight operations desk at Cumbernauld. A flight coordinator will contact you shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setServerError(null);
                    setName("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-accent"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Send Message</h3>
                </div>

                {search.subject && (
                  <div className="mb-5 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-xs text-primary font-medium">
                    🔍 Pre-selected route: <strong className="uppercase">{getSubjectLabel()}</strong>
                  </div>
                )}

                {serverError && (
                  <div className="mb-5 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-xs text-destructive space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                      Submission Error
                    </p>
                    <p>{serverError}</p>
                  </div>
                )}
                
                {Object.keys(errors).length > 0 && (
                  <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/25 p-4 text-xs text-red-700 dark:text-red-400 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="font-bold flex items-center gap-1.5 text-red-800 dark:text-red-300">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" /> 
                      Please correct the following errors:
                    </p>
                    <ul className="list-disc list-inside pl-1 space-y-0.5">
                      {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-foreground">Enquiry Subject</label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2.5 shadow-sm text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="general">General Aviation Inquiry</option>
                      <option value="ppl">PPL Flight Training & Instruction</option>
                      <option value="self-hire">Aircraft Rental & Self-Hire Checkout</option>
                      <option value="voucher">Experience Flight Vouchers & Trial Lessons</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Capt. Alistair McKay"
                      className={`mt-2 block w-full rounded-lg border bg-background px-4 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary focus:ring-primary"}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-500" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`mt-2 block w-full rounded-lg border bg-background px-4 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary focus:ring-primary"}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-500" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-foreground">Flight Request / Message</label>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Let us know your training objectives, current licenses (if any), or experience voucher preferences..."
                      className={`mt-2 block w-full rounded-lg border bg-background px-4 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary focus:ring-primary"}`}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-red-500" />
                        {errors.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.01] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting Inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit {getSubjectLabel()} Inquiry
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
