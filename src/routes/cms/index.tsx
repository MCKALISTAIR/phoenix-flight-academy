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
  Inbox,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { getDashboardSnapshot } from "@/lib/dashboard.functions";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

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
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DEFAULT_TIMEZONE,
  });
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
      label: "New enquiries",
      value: data ? String(data.newEnquiriesCount) : "—",
      icon: Inbox,
      to: "/cms/enquiries",
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
      sublabel: "Enrolled PPL & LAPL",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Flight Operations Header & Ramp Beacon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Today at Phoenix</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              OPS ACTIVE
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Cumbernauld Airport (EGPG) · Master flight dispatch telemetry, daily aircraft turnaround,
            and desk reconciliation.
          </p>
        </div>

        {/* Ramp Telemetry Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 flex items-center gap-3">
            <Plane className="h-4 w-4 text-primary" />
            <div className="text-left">
              <span className="block text-[10px] font-mono uppercase text-white/40 tracking-wider">
                Fleet Airframe
              </span>
              <span className="block text-xs font-mono font-bold text-white">
                G-EGPG · PA-28 Archer III
              </span>
            </div>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase">
              Serviceable
            </span>
          </div>

          <Link
            to="/cms/bookings"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Open Dispatch Board
          </Link>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/40 hover:bg-white/[0.07] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between text-white/50 group-hover:text-white/70">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  {(stat as any).sublabel ?? "Tap to inspect"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Today's Flight Operations Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Flights today</h2>
            <span className="text-xs font-mono text-white/40">
              ({data?.flightsToday.length ?? 0} sorties scheduled)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/cms/day-sheet"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open day sheet →
            </Link>
            <Link
              to="/cms/bookings"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {isLoading && (
            <div className="p-8 text-center text-xs font-mono text-white/40">
              Loading today's flight board…
            </div>
          )}

          {!isLoading && (data?.flightsToday.length ?? 0) === 0 && (
            <div className="p-8 text-center space-y-2">
              <Plane className="h-6 w-6 text-white/20 mx-auto" />
              <p className="text-sm font-medium text-white/70">Nothing on the board for today.</p>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                No trial flights or PPL lessons scheduled today. Aircraft G-EGPG is on the ramp ready
                for dispatch.
              </p>
              <div className="pt-2">
                <Link
                  to="/cms/bookings"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                >
                  Inspect upcoming schedule
                </Link>
              </div>
            </div>
          )}

          {(data?.flightsToday ?? []).map((f) => (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-3.5 last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-4 min-w-48">
                <span className="font-mono text-sm font-bold tabular-nums text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">
                  {time(f.startsAt)}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{f.customerName}</p>
                  <p className="text-xs text-white/40 flex items-center gap-2">
                    <span>{f.productName}</span>
                    <span>·</span>
                    <span className="font-mono text-white/60">
                      {f.aircraftRegistration ?? "G-EGPG"}
                    </span>
                    {f.instructorName && (
                      <>
                        <span>·</span>
                        <span>{f.instructorName}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/70">
                    {f.status}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 ${
                      f.paymentStatus === "unpaid"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {f.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <Link
                  to="/cms/bookings"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white hover:border-primary/40 hover:bg-white/10 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast Ops Shortcuts */}
      <div className="rounded-xl border border-white/10 bg-surface-navy/60 p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">
          Fast Ops Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/cms/bookings"
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <PoundSterling className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Record Desk Payment</span>
          </Link>
          <Link
            to="/cms/students"
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>CAA Student Logbooks</span>
          </Link>
          <Link
            to="/cms/flying-status"
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Plane className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Airfield &amp; Weather</span>
          </Link>
          <Link
            to="/cms/enquiries"
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Inbox className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span>Customer Inquiries</span>
          </Link>
        </div>
      </div>

      {data && data.revenue30dCents === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Stripe Test Mode Active
            </p>
            <p className="mt-1 text-xs text-amber-300/80 leading-relaxed">
              Card payments are running in test mode. Desk payments (Card Terminal, Cash, BACS,
              Voucher) can be recorded manually in the Bookings console.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
