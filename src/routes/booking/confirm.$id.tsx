import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Calendar, Plane, User, CreditCard, ArrowRight } from "lucide-react";
import { getBookingById } from "@/lib/bookings.functions";

export const Route = createFileRoute("/booking/confirm/$id")({
  component: ConfirmPage,
  head: () => ({ meta: [{ title: "Booking received | Phoenix Flight Training" }] }),
});

function ConfirmPage() {
  const { id } = Route.useParams();
  const fetchBooking = useServerFn(getBookingById);
  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBooking({ data: { id } }),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white/60">Loading…</div>;
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white">
        Booking not found. <Link to="/booking" className="underline">Back</Link>
      </div>
    );
  }

  const product = (data as { booking_products: { name: string } | null }).booking_products;
  const aircraft = (data as { aircraft: { registration: string; model: string } | null }).aircraft;
  const instructor = (data as { instructors: { name: string } | null }).instructors;

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_270)] text-white">
      <div className="container mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold">
            {data.status === "confirmed" ? "Booking confirmed!" : "Booking received!"}
          </h1>
          <p className="mt-2 text-white/60">
            {data.status === "confirmed"
              ? "We've confirmed your booking. You'll receive an email shortly."
              : "Our team will review and confirm your booking shortly. We'll be in touch by email."}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row icon={Calendar} label="When" value={new Date(data.starts_at).toLocaleString("en-GB")} />
            <Row icon={Plane} label="Product" value={product?.name ?? "—"} />
            <Row icon={Plane} label="Aircraft" value={aircraft ? `${aircraft.registration} — ${aircraft.model}` : "—"} />
            {instructor && <Row icon={User} label="Instructor" value={instructor.name} />}
            <Row
              icon={CreditCard}
              label="Total"
              value={`£${(data.price_total_cents / 100).toFixed(2)} (${data.payment_status})`}
            />
            <Row icon={CheckCircle2} label="Status" value={data.status} />
          </dl>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
          >
            Book another <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-white/50">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}