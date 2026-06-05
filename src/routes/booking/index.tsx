import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plane, GraduationCap, Compass, ArrowRight, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { listPublishedBookingProducts } from "@/lib/booking-products.functions";

export const Route = createFileRoute("/booking/")({
  component: BookingHome,
  head: () => ({
    meta: [
      { title: "Book a Flight | Phoenix Flight Training" },
      { name: "description", content: "Book a trial flight, training lesson, or self-hire aircraft at Cumbernauld." },
    ],
  }),
});

const KIND_META: Record<string, { icon: typeof Plane; label: string; blurb: string; accent: string }> = {
  experience: {
    icon: Compass,
    label: "Experience Flight",
    blurb: "A taste of flying with a qualified instructor — perfect as a gift or first lesson.",
    accent: "from-sky-500 to-blue-600",
  },
  lesson: {
    icon: GraduationCap,
    label: "Training Lesson",
    blurb: "Book a PPL/LAPL training lesson with your instructor.",
    accent: "from-indigo-500 to-purple-600",
  },
  self_hire: {
    icon: Plane,
    label: "Self-Hire Aircraft",
    blurb: "Reserve a club aircraft for qualified pilots (wet rate).",
    accent: "from-emerald-500 to-teal-600",
  },
};

function formatMoney(cents: number | null | undefined) {
  if (cents == null) return null;
  return `£${(cents / 100).toFixed(2)}`;
}

function BookingHome() {
  const fetchProducts = useServerFn(listPublishedBookingProducts);
  const { data: products, isLoading } = useQuery({
    queryKey: ["booking-products", "published"],
    queryFn: () => fetchProducts(),
  });

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_270)] text-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Book a flight</h1>
          <p className="mt-3 text-white/60">
            Choose what you'd like to book. Experience flights can be booked by anyone; lessons and self-hire require an account.
          </p>
        </div>

        {isLoading ? (
          <div className="text-white/50">Loading available flights…</div>
        ) : !products || products.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/60">
            No booking products are currently published. Staff can add them in the CMS.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const meta = KIND_META[p.kind];
              const Icon = meta.icon;
              const price =
                p.kind === "experience"
                  ? formatMoney(p.package_price_cents)
                  : p.kind === "lesson"
                  ? `from ${formatMoney(p.instructor_fee_per_hour_cents) ?? "£—"}/hr + aircraft`
                  : "Aircraft wet rate";
              return (
                <Link
                  key={p.id}
                  to="/booking/book/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-[oklch(0.55_0.22_270)]/50 hover:bg-white/10"
                >
                  <div className={`bg-gradient-to-br ${meta.accent} p-6`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-90">{meta.label}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold">{p.name}</h3>
                    {p.tagline && <p className="mt-1 text-sm opacity-80">{p.tagline}</p>}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    {p.description && <p className="text-sm text-white/60">{p.description}</p>}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-white/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{p.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="capitalize">
                          {p.payment_mode === "deposit" ? `${p.deposit_pct}% deposit` : p.payment_mode}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-white/70">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{price}</span>
                      </div>
                    </div>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[oklch(0.75_0.18_270)] transition-transform group-hover:translate-x-1">
                      Book this <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}