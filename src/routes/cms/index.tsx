import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Plane,
  Users,
  ClipboardList,
  BadgeCheck,
  PoundSterling,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { getDashboardSnapshot } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/cms/")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CmsDashboard,
});

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function CmsDashboard() {
  const fetchSnapshot = useServerFn(getDashboardSnapshot);
  const { data, isLoading } = useQuery({
    queryKey: ["cms-dashboard"],
    queryFn: () => fetchSnapshot(),
  });

  const stats = [
    {
      label: "Upcoming bookings",
      value: data ? String(data.upcomingCount) : "—",
      icon: ClipboardList,
      to: "/cms/bookings",
    },
    {
      label: "Awaiting approval",
      value: data ? String(data.awaitingApproval) : "—",
      icon: CalendarClock,
      to: "/cms/bookings",
    },
    {
      label: "Outstanding balances",
      value: data ? money(data.outstandingCents) : "—",
      icon: PoundSterling,
      to: "/cms/bookings",
    },
    {
      label: "Pilot verifications",
      value: data ? String(data.pendingVerifications) : "—",
      icon: BadgeCheck,
      to: "/cms/pilot-verifications",
    },
    {
      label: "Aircraft serviceable",
      value: data ? `${data.aircraftServiceable}/${data.aircraftTotal}` : "—",
      icon: Plane,
      to: "/cms/fleet",
    },
    {
      label: "Active students",
      value: data ? String(data.activeStudents) : "—",
      icon: Users,
      to: "/cms/students",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Today at Phoenix</h1>
        <p className="mt-1 text-sm text-white/50">
          Live figures from the booking system — flights today, money outstanding and anything
          waiting on you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-primary/40 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-black tabular-nums text-primary">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Flights today</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {isLoading && <p className="p-5 text-sm text-white/50">Loading…</p>}
          {!isLoading && (data?.flightsToday.length ?? 0) === 0 && (
            <p className="p-5 text-sm text-white/50">Nothing on the board for today.</p>
          )}
          {(data?.flightsToday ?? []).map((f) => (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-3 last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm tabular-nums text-primary">
                  {time(f.startsAt)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.customerName}</p>
                  <p className="text-xs text-white/40">{f.productName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
                  {f.status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    f.paymentStatus === "unpaid"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {f.paymentStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data && data.revenue30dCents === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">No payments taken yet</p>
            <p className="mt-1 text-xs text-yellow-400/70">
              Card payments are running in test mode, and booking emails stay switched off until a
              Phoenix sending address is connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
