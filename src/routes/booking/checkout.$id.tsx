import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  CreditCard,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { getCheckoutSession, completeMockPayment } from "@/lib/mock-payments.functions";
import { initiateStripeCheckout } from "@/lib/stripe-payments.functions";

export const Route = createFileRoute("/booking/checkout/$id")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout | Phoenix Flight Training" }] }),
});

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function CheckoutPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fetchSession = useServerFn(getCheckoutSession);
  const payMock = useServerFn(completeMockPayment);
  const startStripe = useServerFn(initiateStripeCheckout);

  const { data: session, isLoading } = useQuery({
    queryKey: ["checkout-session", id],
    queryFn: () => fetchSession({ data: { bookingId: id } }),
  });

  const [initiatingStripe, setInitiatingStripe] = useState(false);
  const [submittingMock, setSubmittingMock] = useState<"paid" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  async function handleStripeCheckout() {
    setInitiatingStripe(true);
    setError(null);
    setInfoNotice(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await startStripe({ data: { bookingId: id, origin } });

      if (res.success) {
        // Redirect to Stripe's hosted checkout page
        window.location.href = res.url;
        return;
      }

      // If Edge Function / Stripe keys are not active yet, guide the user
      setShowSimulator(true);
      setError(
        res.message ||
          "Stripe Edge Function is not yet configured with STRIPE_SECRET_KEY in Supabase. You can connect your Stripe keys in Lovable, or use the Dev Simulator below to test the complete booking flow.",
      );
    } catch (err) {
      setShowSimulator(true);
      setError(
        err instanceof Error
          ? err.message
          : "Could not initiate Stripe checkout. Use the test simulator below.",
      );
    } finally {
      setInitiatingStripe(false);
    }
  }

  async function handleMockPay(outcome: "paid" | "failed") {
    setSubmittingMock(outcome);
    setError(null);
    try {
      await payMock({ data: { bookingId: id, outcome } });
      navigate({ to: "/booking/confirm/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment simulation failed.");
      setSubmittingMock(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.04_250)] p-8 font-mono text-sm text-white/60">
        Loading…
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.04_250)] p-8 text-white">
        Booking not found.{" "}
        <Link to="/booking" className="underline text-primary">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_250)] text-white">
      <div className="container mx-auto max-w-xl px-4 py-12 sm:px-6">
        <Link
          to="/booking"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel and return
        </Link>

        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              <CreditCard className="h-4 w-4 text-primary" /> Dispatch Checkout
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              256-bit Encrypted
            </div>
          </div>

          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {session.productName}
          </h1>
          <p className="mt-1 text-xs font-mono text-white/60">
            {new Date(session.startsAt).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {new Date(session.startsAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {session.blockCount > 1 && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-white/80">
              <span className="font-bold text-primary block text-xs tracking-wide uppercase font-mono">
                Block Booking Series
              </span>
              <p className="text-xs text-white/60 mt-1">
                You are paying for **Lesson 1 of {session.blockCount}** scheduled slots. The
                remaining {session.blockCount - 1} slots are reserved and will be settled
                individually upon landing.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-surface-navy/60 p-4">
            <dl className="space-y-2.5 text-sm">
              <Row label="Customer" value={`${session.customerName} (${session.customerEmail})`} />
              <Row label="Flight total" value={money(session.priceTotalCents)} isMono />
              <div className="border-t border-white/10 pt-2">
                <Row
                  label={session.paymentMode === "deposit" ? "Deposit due now" : "Total due now"}
                  value={money(session.amountDueCents)}
                  strong
                  isMono
                />
              </div>
            </dl>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Primary Action: Stripe Hosted Checkout */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              disabled={initiatingStripe || !!submittingMock}
              onClick={handleStripeCheckout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {initiatingStripe ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting to Stripe…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {money(session.amountDueCents)} with Card / Apple Pay
                </>
              )}
            </button>

            {/* Accepted Methods Badges */}
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-mono text-white/40">
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>American Express</span>
              <span>•</span>
              <span>Apple Pay</span>
              <span>•</span>
              <span>Google Pay</span>
            </div>
          </div>

          {/* Dev Sandbox / Simulator Accordion */}
          <div className="mt-8 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowSimulator((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold text-white/50 hover:text-white/80 transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                Developer / Sandbox Simulator
              </span>
              {showSimulator ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showSimulator && (
              <div className="mt-3 rounded-xl border border-dashed border-amber-400/20 bg-amber-500/[0.04] p-4 text-xs text-white/70 space-y-3">
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  Use this simulator to test booking confirmation and status changes without
                  requiring live Stripe credentials or test cards.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    disabled={!!submittingMock || initiatingStripe}
                    onClick={() => handleMockPay("paid")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {submittingMock === "paid" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Simulate Successful Payment
                  </button>
                  <button
                    type="button"
                    disabled={!!submittingMock || initiatingStripe}
                    onClick={() => handleMockPay("failed")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {submittingMock === "failed" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Simulate Failed Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  isMono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/60 text-xs font-medium">{label}</span>
      <span
        className={`${strong ? "text-base font-bold text-white" : "font-medium text-white/90"} ${isMono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
