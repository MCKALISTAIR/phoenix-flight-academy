import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { CreditCard, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { getCheckoutSession } from "@/lib/mock-payments.functions";
import { createBookingCheckout } from "@/lib/payments.functions";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/booking/checkout/$id")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout | Phoenix Flight Training" },
      {
        name: "description",
        content: "Securely pay for your Phoenix Flight Training booking by card.",
      },
    ],
  }),
});

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function CheckoutPage() {
  const { id } = Route.useParams();
  const fetchSession = useServerFn(getCheckoutSession);
  const startCheckout = useServerFn(createBookingCheckout);

  const { data: session, isLoading } = useQuery({
    queryKey: ["checkout-session", id],
    queryFn: () => fetchSession({ data: { bookingId: id } }),
  });

  const [error, setError] = useState<string | null>(null);

  // Stable across renders — changing this function remounts the payment form.
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    const returnUrl = `${window.location.origin}/booking/confirm/${id}?session_id={CHECKOUT_SESSION_ID}`;
    const result = await startCheckout({
      data: { bookingId: id, returnUrl, environment: getStripeEnvironment() },
    });
    if ("error" in result) {
      setError(result.error);
      throw new Error(result.error);
    }
    if (!result.clientSecret) throw new Error("Payment provider did not return a session.");
    return result.clientSecret;
  }, [id, startCheckout]);

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
      <PaymentTestModeBanner />
      <div className="container mx-auto max-w-xl px-4 py-12 sm:px-6">
        <Link
          to="/booking"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel and return
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              <CreditCard className="h-4 w-4 text-primary" /> Dispatch Checkout
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure payment
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

          {/* Embedded card payment form */}
          <div className="mt-6 rounded-xl bg-white p-2 sm:p-3" id="checkout">
            <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 text-[11px] font-mono text-white/40">
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
