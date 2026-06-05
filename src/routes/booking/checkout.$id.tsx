import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CreditCard, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { getCheckoutSession, completeMockPayment } from "@/lib/mock-payments.functions";

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
  const pay = useServerFn(completeMockPayment);

  const { data: session, isLoading } = useQuery({
    queryKey: ["checkout-session", id],
    queryFn: () => fetchSession({ data: { bookingId: id } }),
  });

  const [submitting, setSubmitting] = useState<"paid" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(outcome: "paid" | "failed") {
    setSubmitting(outcome);
    setError(null);
    try {
      await pay({ data: { bookingId: id, outcome } });
      navigate({ to: "/booking/confirm/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setSubmitting(null);
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white/60">Loading…</div>;
  }
  if (!session) {
    return (
      <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white">
        Booking not found. <Link to="/booking" className="underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_270)] text-white">
      <div className="container mx-auto max-w-xl px-4 py-12 sm:px-6">
        <Link
          to="/booking"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel and return
        </Link>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4" />
          Mock checkout — no real payment provider connected yet.
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
            <CreditCard className="h-4 w-4" /> Checkout
          </div>
          <h1 className="mt-3 text-2xl font-extrabold">{session.productName}</h1>
          <p className="mt-1 text-sm text-white/60">
            {new Date(session.startsAt).toLocaleString("en-GB")}
          </p>

          <dl className="mt-6 space-y-2 text-sm">
            <Row label="Customer" value={`${session.customerName} (${session.customerEmail})`} />
            <Row label="Booking total" value={money(session.priceTotalCents)} />
            <Row
              label={session.paymentMode === "deposit" ? "Deposit due now" : "Due now"}
              value={money(session.amountDueCents)}
              strong
            />
          </dl>

          <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-white/40">
            <Lock className="mb-1 inline h-3 w-3" /> In production this opens hosted checkout
            (Stripe / Paddle). For now the buttons below simulate the webhook callback.
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!!submitting}
              onClick={() => handlePay("paid")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting === "paid" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              Pay {money(session.amountDueCents)}
            </button>
            <button
              type="button"
              disabled={!!submitting}
              onClick={() => handlePay("failed")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              Simulate failure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/50">{label}</span>
      <span className={strong ? "text-base font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}