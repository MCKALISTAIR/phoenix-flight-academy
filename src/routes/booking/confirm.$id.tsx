import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import {
  CheckCircle2,
  Calendar,
  Plane,
  User,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
} from "lucide-react";
import { getBookingById } from "@/lib/bookings.functions";
import { verifyStripeSession } from "@/lib/stripe-payments.functions";

export const Route = createFileRoute("/booking/confirm/$id")({
  component: ConfirmPage,
  head: () => ({ meta: [{ title: "Booking Confirmation | Phoenix Flight Training" }] }),
});

function ConfirmPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchBooking = useServerFn(getBookingById);
  const verifySession = useServerFn(verifyStripeSession);

  // Read session_id from query params if returning from Stripe Hosted Checkout
  const sessionId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("session_id")
      : null;

  // If returning with a Stripe session_id, trigger reconciliation
  useEffect(() => {
    if (sessionId) {
      verifySession({ data: { bookingId: id, sessionId } })
        .then(() => qc.invalidateQueries({ queryKey: ["booking", id] }))
        .catch((err) => console.warn("Session reconciliation notice:", err));
    }
  }, [id, sessionId, verifySession, qc]);

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBooking({ data: { id } }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.04_250)] p-8 font-mono text-sm text-white/60">
        Loading…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[oklch(0.12_0.04_250)] p-8 text-white">
        Booking not found.{" "}
        <Link to="/booking" className="underline text-primary">
          Back
        </Link>
      </div>
    );
  }

  const product = (data as { booking_products: { name: string } | null }).booking_products;
  const aircraft = (data as { aircraft: { registration: string; model: string } | null }).aircraft;
  const instructor = (data as { instructors: { name: string } | null }).instructors;
  const isPaidOrDeposit = data.payment_status === "paid" || data.payment_status === "deposit_paid";

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_250)] text-white">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {data.status === "confirmed" ? "Flight Booking Confirmed" : "Booking received"}
          </h1>
          <p className="mt-2 text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            {data.status === "confirmed"
              ? "Your aircraft slot and reservation are locked into our dispatch calendar. We look forward to seeing you at Cumbernauld (EGPG)."
              : "Our ops dispatch team is reviewing your flight details. We will confirm your slot shortly."}
          </p>

          {isPaidOrDeposit && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-400 border border-emerald-500/30">
              <Check className="h-3.5 w-3.5" />
              {data.payment_status === "paid"
                ? "Payment Verified via Stripe"
                : "Deposit Verified via Stripe — Remainder Due at Dispatch"}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 font-mono">
              Flight Reservation Summary
            </h2>
            <span className="text-xs font-mono text-primary font-semibold">
              REF #{data.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <dl className="mt-5 space-y-3.5 text-sm">
            <Row
              icon={Calendar}
              label="Departure Time"
              value={new Date(data.starts_at).toLocaleString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              isMono
            />
            <Row icon={Plane} label="Product" value={product?.name ?? "—"} />
            <Row
              icon={Plane}
              label="Aircraft"
              value={aircraft ? `${aircraft.registration} (${aircraft.model})` : "Standard Fleet"}
            />
            {instructor && <Row icon={User} label="Instructor" value={instructor.name} />}
            <Row
              icon={CreditCard}
              label="Flight Total"
              value={`£${(data.price_total_cents / 100).toFixed(2)}`}
              isMono
            />
            <Row
              icon={ShieldCheck}
              label="Payment Status"
              value={data.payment_status.replace("_", " ")}
              highlight={data.payment_status !== "unpaid"}
              isMono
            />
            <Row
              icon={Clock}
              label="Booking Status"
              value={data.status}
              highlight={data.status === "confirmed"}
              isMono
            />
          </dl>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/booking/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Go to Student Portal
          </Link>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Book Another Flight <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  isMono,
  highlight,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  isMono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-white/50 text-xs">
        <Icon className="h-4 w-4 text-white/40" />
        {label}
      </span>
      <span
        className={`capitalize text-xs font-semibold ${
          highlight ? "text-emerald-400" : "text-white/90"
        } ${isMono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
