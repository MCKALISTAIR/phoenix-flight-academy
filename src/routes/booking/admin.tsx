import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Plane,
  Crown,
  TrendingUp,
  Users,
  PoundSterling,
  AlertTriangle,
  Tag,
  BarChart3,
  Shield,
  RefreshCw,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { listAllBookings, updateBookingStatus } from "@/lib/bookings.functions";
import { useState } from "react";

export const Route = createFileRoute("/booking/admin")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Operations | Phoenix Flight Training" }],
  }),
});

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function formatDocType(type: string): string {
  const mapping: Record<string, string> = {
    medical_class1: "Medical Class 1",
    medical_class2: "Medical Class 2",
    medical_lapl: "LAPL Medical",
    student_pilot_license: "Student License",
    ppl: "PPL License",
    lapl: "LAPL License",
    rt_license: "RT License",
    language_proficiency: "ELP",
  };
  return mapping[type] || type.replace(/_/g, " ");
}

function AdminDashboard() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllBookings);
  const updateStatus = useServerFn(updateBookingStatus);
  const [refreshing, setRefreshing] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => fetchAll({ data: { status: null } }),
  });

  const mut = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  async function refresh() {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    setRefreshing(false);
  }

  // Derived stats
  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(
    (b) => b.starts_at.slice(0, 10) === today && b.status === "confirmed",
  );
  const revenueToday = todayBookings.reduce((s, b) => s + b.price_total_cents, 0);
  const revenueMonth = bookings
    .filter((b) => {
      const bMonth = b.starts_at.slice(0, 7);
      const nowMonth = new Date().toISOString().slice(0, 7);
      return bMonth === nowMonth && (b.status === "confirmed" || b.status === "completed");
    })
    .reduce((s, b) => s + b.price_total_cents, 0);

  const flagged = bookings.filter(
    (b) =>
      (b as { safety_flag?: boolean }).safety_flag === true &&
      (b.status === "pending" || b.status === "confirmed"),
  );
  const withDiscounts = bookings.filter(
    (b) =>
      (b as { discount_applied_cents?: number }).discount_applied_cents &&
      (b as { discount_applied_cents?: number }).discount_applied_cents! > 0,
  );
  const totalDiscountsApplied = withDiscounts.reduce(
    (s, b) => s + ((b as { discount_applied_cents?: number }).discount_applied_cents ?? 0),
    0,
  );

  return (
    <div className="flex min-h-screen bg-[oklch(0.12_0.04_250)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-surface-navy">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white tracking-tight">Ops Portal</span>
            <span className="block text-xs font-mono text-white/40">EGPG Operations</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {[
            { icon: BarChart3, label: "Dashboard", active: true },
            { icon: CalendarDays, label: "Bookings Calendar", active: false },
            { icon: Clock, label: "Pending Queue", active: false },
            { icon: Users, label: "Students & Staff", active: false },
            { icon: Plane, label: "Fleet Status", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                item.active
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link
            to="/cms"
            className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <Crown className="h-4 w-4" />
            CMS Editor
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Operations Dashboard</h1>
              <p className="mt-1 text-sm text-white/40">
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-black text-amber-400">{pending.length}</p>
              <span className="text-[10px] text-white/30 font-medium">Awaiting action</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Today's Flights
                </span>
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-black font-mono tabular-nums text-white">
                {todayBookings.length}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Confirmed</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Revenue Today
                </span>
                <PoundSterling className="h-4 w-4 text-success" />
              </div>
              <p className="mt-3 text-3xl font-black font-mono tabular-nums text-success">
                {money(revenueToday)}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Confirmed bookings</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Monthly Revenue
                </span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-black font-mono tabular-nums text-white">
                {money(revenueMonth)}
              </p>
              <span className="text-[10px] text-white/40 font-medium">This month</span>
            </div>
          </div>

          {/* Secondary cards: discounts, flags */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Promo Discounts
                </span>
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-black font-mono tabular-nums text-primary">
                {withDiscounts.length}
              </p>
              <span className="text-[10px] text-white/40 font-mono">
                Total: {money(totalDiscountsApplied)}
              </span>
            </div>
            <div
              className={`rounded-xl border p-5 ${flagged.length > 0 ? "border-destructive/30 bg-destructive/5" : "border-white/10 bg-white/5"}`}
            >
              <div className="flex items-center justify-between text-white/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Safety Flags
                </span>
                <AlertTriangle
                  className={`h-4 w-4 ${flagged.length > 0 ? "text-destructive" : "text-white/30"}`}
                />
              </div>
              <p
                className={`mt-3 text-3xl font-black font-mono tabular-nums ${flagged.length > 0 ? "text-destructive" : "text-white/40"}`}
              >
                {flagged.length}
              </p>
              <span className="text-[10px] text-white/40 font-medium">Requiring review</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Pending Bookings Queue */}
            <div className="col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="font-semibold text-white">Pending Booking Requests</h2>
                {pending.length > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                    {pending.length} Need Action
                  </span>
                )}
              </div>
              {isLoading ? (
                <div className="p-8 text-white/40">Loading…</div>
              ) : pending.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500/40" />
                  <p className="text-sm text-white/40">All caught up — no pending bookings.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pending.slice(0, 8).map((b) => {
                    const prod = (b as { booking_products: { name: string } | null })
                      .booking_products;
                    const ac = (b as { aircraft: { registration: string } | null }).aircraft;
                    const safetyFlag = (b as { safety_flag?: boolean }).safety_flag;
                    const expiredDocs = (b as any).expired_documents ?? [];
                    const discountCents =
                      (b as { discount_applied_cents?: number }).discount_applied_cents ?? 0;
                    const promoCode = (b as { promo_code?: string }).promo_code;
                    return (
                      <div key={b.id} className="p-5 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-white">{b.customer_name}</p>
                            {safetyFlag && (
                              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                ⚠ Safety Review
                              </span>
                            )}
                            {promoCode && (
                              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                                {promoCode} (−{money(discountCents)})
                              </span>
                            )}
                          </div>
                          {expiredDocs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {expiredDocs.map((doc: string) => (
                                <span
                                  key={doc}
                                  className="inline-flex items-center rounded-md bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium text-destructive border border-destructive/20"
                                >
                                  ⚠️ Expired {formatDocType(doc)}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-1 text-xs text-white/50">
                            {prod?.name ?? "—"} · {ac?.registration ?? "—"} ·{" "}
                            {new Date(b.starts_at).toLocaleString("en-GB")}
                          </p>
                          <p className="mt-1 text-sm font-semibold font-mono tabular-nums text-white/80">
                            {money(b.price_total_cents)}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => mut.mutate({ data: { id: b.id, status: "confirmed" } })}
                            className="rounded-lg bg-success/15 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/25 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = window.prompt("Cancellation reason?");
                              if (reason === null) return;
                              mut.mutate({
                                data: {
                                  id: b.id,
                                  status: "cancelled",
                                  cancellation_reason: reason || null,
                                },
                              });
                            }}
                            className="rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/25 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="border-t border-white/10 px-6 py-3 text-center">
                <Link
                  to="/cms/bookings"
                  className="text-xs text-primary hover:text-white transition-colors font-semibold"
                >
                  View all bookings in CMS →
                </Link>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="border-b border-white/10 px-6 py-4">
                  <h2 className="font-semibold text-white">Today's Schedule</h2>
                </div>
                <div className="p-4">
                  {todayBookings.length === 0 ? (
                    <p className="py-4 text-center text-sm text-white/40">
                      No confirmed flights today.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {todayBookings.slice(0, 6).map((b) => {
                        const ac = (b as { aircraft: { registration: string } | null }).aircraft;
                        return (
                          <div key={b.id} className="flex gap-3 border-l-2 border-primary pl-4">
                            <div className="w-14 shrink-0 text-xs font-mono font-semibold text-white/60">
                              {new Date(b.starts_at).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{b.customer_name}</p>
                              <p className="text-[10px] text-white/40">{ac?.registration ?? "—"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Summary */}
              {withDiscounts.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
                  <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-wider font-mono">
                      Promo Codes Applied
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {withDiscounts.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-center justify-between px-5 py-2.5">
                        <div>
                          <span className="font-mono text-xs font-bold text-primary">
                            {(b as { promo_code?: string }).promo_code}
                          </span>
                          <p className="text-[10px] text-white/40">{b.customer_name}</p>
                        </div>
                        <span className="text-xs font-mono tabular-nums font-semibold text-success">
                          −
                          {money(
                            (b as { discount_applied_cents?: number }).discount_applied_cents ?? 0,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
