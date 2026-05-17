import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  Activity,
  AlertOctagon,
  Users,
  Eye,
  MousePointer,
  RefreshCw,
  Search,
  Bug,
  Terminal,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cms/analytics")({
  component: AnalyticsDashboard,
});

type ErrorLog = {
  id: string;
  timestamp: string;
  level: "critical" | "warning" | "info";
  message: string;
  route: string;
  code: string;
  stack: string;
  resolved: boolean;
};

const INITIAL_ERRORS: ErrorLog[] = [
  {
    id: "ERR-9421",
    timestamp: "2 mins ago",
    level: "critical",
    message: "PostgreSQL Connection pool exhausted. Timeout occurred waiting for connection.",
    route: "/booking/admin",
    code: "500 Internal Server Error (Supabase)",
    stack: "at pg.Pool.connect (node_modules/pg/lib/pool.js:142:19)\nat supabase.from.select (src/hooks/useSupabase.ts:32:8)\nat async loadBookings (src/routes/booking/admin.tsx:48:12)",
    resolved: false,
  },
  {
    id: "ERR-8812",
    timestamp: "15 mins ago",
    level: "warning",
    message: "Failed to preload background image resource. Hangar hero asset response timed out.",
    route: "/fleet",
    code: "404 Resource Not Found",
    stack: "at HTMLImageElement.onerror (src/routes/fleet.tsx:82:14)\nat renderAircraftCard (src/routes/fleet.tsx:120:5)",
    resolved: false,
  },
  {
    id: "ERR-4031",
    timestamp: "1 hour ago",
    level: "info",
    message: "Unauthorized routing attempt blocked. Redirected guest user to booking login.",
    route: "/cms/content",
    code: "403 Forbidden Access",
    stack: "at checkAuthSession (src/routes/cms.tsx:32:9)\nat beforeLoad (src/routes/cms/content.tsx:12:4)",
    resolved: true,
  },
  {
    id: "ERR-1205",
    timestamp: "3 hours ago",
    level: "warning",
    message: "Input validation error. Renter checklist submitted without valid Medical Class 2 declaration.",
    route: "/booking",
    code: "422 Unprocessable Entity",
    stack: "at validateRenterForm (src/components/enrollment.tsx:94:12)\nat onSubmit (src/routes/booking.tsx:142:8)",
    resolved: true,
  },
];

const PAGES_VISITS = [
  { path: "/", label: "Home marketing Page", views: 2420, bounce: "32%", duration: "1m 45s" },
  { path: "/flying/learn-to-fly", label: "PPL Training Guide", views: 1840, bounce: "24%", duration: "2m 50s" },
  { path: "/fleet", label: "Fleet & Specs Gallery", views: 1250, bounce: "18%", duration: "3m 15s" },
  { path: "/flying/self-hire", label: "Self-Hire & Pricing Details", views: 980, bounce: "40%", duration: "1m 20s" },
  { path: "/booking", label: "Enrollment & Booking Portal", views: 640, bounce: "12%", duration: "4m 10s" },
  { path: "/about", label: "About Flight School & CFI", views: 420, bounce: "28%", duration: "2m 02s" },
];

function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<"traffic" | "exceptions">("traffic");
  const [errors, setErrors] = useState<ErrorLog[]>(INITIAL_ERRORS);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [errorFilter, setErrorFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  function simulateError() {
    const errorCodes = [
      {
        id: `ERR-${Math.floor(1000 + Math.random() * 9000)}`,
        level: "critical" as const,
        message: "Supabase authentication handshake failure. JWT signature verification failed.",
        route: "/cms/users",
        code: "401 Unauthorized API Call",
        stack: "at supabase.auth.getSession (node_modules/@supabase/supabase-js:45:21)\nat checkSuperAdminSession (src/routes/cms.tsx:28:11)",
      },
      {
        id: `ERR-${Math.floor(1000 + Math.random() * 9000)}`,
        level: "warning" as const,
        message: "Stripe Payment webhook signature verification failed. Payload checksum mismatch.",
        route: "/booking",
        code: "400 Bad Request Webhook",
        stack: "at stripe.webhooks.constructEvent (node_modules/stripe/lib/webhooks.js:52:12)\nat handler (src/api/stripe-hook.ts:18:9)",
      },
      {
        id: `ERR-${Math.floor(1000 + Math.random() * 9000)}`,
        level: "info" as const,
        message: "Client environment bundle check. ServiceWorker cached 24 resource bundles successfully.",
        route: "/",
        code: "ServiceWorker Cache Init",
        stack: "at ServiceWorker.register (src/main.tsx:14:4)",
      },
    ];

    const randomErr = errorCodes[Math.floor(Math.random() * errorCodes.length)];
    const newLog: ErrorLog = {
      ...randomErr,
      timestamp: "Just now",
      resolved: false,
    };

    setErrors((prev) => [newLog, ...prev]);
  }

  function resolveError(id: string) {
    setErrors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, resolved: !e.resolved } : e))
    );
  }

  function clearErrors() {
    setErrors([]);
  }

  const filteredErrors = errors
    .filter((e) => (errorFilter === "all" ? true : e.level === errorFilter))
    .filter(
      (e) =>
        e.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.route.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const activeErrorsCount = errors.filter((e) => !e.resolved).length;
  const criticalCount = errors.filter((e) => e.level === "critical" && !e.resolved).length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">System Analytics & Health</h2>
          <p className="mt-1 text-xs text-white/40">
            Real-time server query tracking, page views conversion monitoring, and client exception logging.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "exceptions" && (
            <>
              <button
                onClick={simulateError}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
              >
                <Bug className="h-4 w-4" />
                Simulate Exception
              </button>
              <button
                onClick={clearErrors}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/50 transition-all hover:bg-white/10 hover:text-white"
              >
                Clear Log List
              </button>
            </>
          )}
          <button
            onClick={() => {
              setSuccessAnimation(true);
              setTimeout(() => setSuccessAnimation(false), 1500);
            }}
            className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${successAnimation ? "animate-spin" : ""}`} />
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("traffic")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "traffic"
              ? "border-[oklch(0.55_0.22_270)] text-[oklch(0.70_0.18_270)]"
              : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Site Traffic & Conversions
        </button>
        <button
          onClick={() => setActiveTab("exceptions")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "exceptions"
              ? "border-[oklch(0.55_0.22_270)] text-[oklch(0.70_0.18_270)]"
              : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          <AlertOctagon className="h-4 w-4" />
          Error Tracking & Logs
          {activeErrorsCount > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white ml-1">
              {activeErrorsCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "traffic" ? (
        <div className="space-y-8 animate-fade-in">
          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Sessions</span>
                <Users className="h-4 w-4 text-[oklch(0.70_0.18_270)]" />
              </div>
              <p className="mt-3 text-3xl font-black text-white">42</p>
              <span className="text-[10px] text-green-400 font-bold flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12% vs last hour
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pageviews</span>
                <Eye className="h-4 w-4 text-[oklch(0.70_0.18_270)]" />
              </div>
              <p className="mt-3 text-3xl font-black text-white">7,550</p>
              <span className="text-[10px] text-green-400 font-bold flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.4% this week
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-xs font-semibold uppercase tracking-wider">Form Submissions</span>
                <MousePointer className="h-4 w-4 text-[oklch(0.70_0.18_270)]" />
              </div>
              <p className="mt-3 text-3xl font-black text-white">24</p>
              <span className="text-[10px] text-green-400 font-bold flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +18.2% conversion rate
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-white/40">
                <span className="text-xs font-semibold uppercase tracking-wider">API Server Latency</span>
                <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
              <p className="mt-3 text-3xl font-black text-emerald-400">48ms</p>
              <span className="text-[10px] text-emerald-400/60 font-semibold flex items-center mt-1">
                🟢 Supabase Status: Optimal
              </span>
            </div>
          </div>

          {/* Graphical Traffic Breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2/3: Pages breakdown */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <span className="text-sm font-bold text-white">Route Traffic Breakdown</span>
              </div>
              <div className="divide-y divide-white/5">
                {PAGES_VISITS.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/3">
                    <div>
                      <span className="block text-sm font-semibold text-white">{p.path}</span>
                      <span className="text-xs text-white/30">{p.label}</span>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <span className="block text-sm font-bold text-white">{p.views}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Views</span>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">{p.bounce}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Bounce</span>
                      </div>
                      <div className="w-16">
                        <span className="block text-sm font-bold text-white">{p.duration}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Avg. Stay</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1/3: Daily Traffic Visualizer Bars */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Traffic Flow</h3>
                <p className="text-xs text-white/30 mt-0.5">Pageviews comparison by day of week</p>
              </div>

              {/* Simple HSL colored graph bars using vanilla CSS */}
              <div className="space-y-4 pt-2">
                {[
                  { day: "Mon", count: 1240, pct: "85%" },
                  { day: "Tue", count: 1450, pct: "95%" },
                  { day: "Wed", count: 980, pct: "60%" },
                  { day: "Thu", count: 1100, pct: "75%" },
                  { day: "Fri", count: 1540, pct: "100%" },
                  { day: "Sat", count: 850, pct: "50%" },
                  { day: "Sun", count: 620, pct: "38%" },
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white/60">{d.day}</span>
                      <span className="text-white/40">{d.count} views</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[oklch(0.55_0.22_270)] transition-all duration-1000"
                        style={{ width: d.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Metric cards for exception logger */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-xs font-semibold text-white/40 uppercase">Unresolved Errors</span>
              <p className="mt-2 text-3xl font-black text-red-400">{activeErrorsCount}</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <span className="text-xs font-semibold text-red-400/60 uppercase">Critical Exceptions</span>
              <p className="mt-2 text-3xl font-black text-red-500">{criticalCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-xs font-semibold text-white/40 uppercase">Error-Free Sessions Rate</span>
              <p className="mt-2 text-3xl font-black text-emerald-400">99.86%</p>
            </div>
          </div>

          {/* Log Filters Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter by Level:
              </span>
              {[
                { value: "all", label: "All Logs" },
                { value: "critical", label: "Critical Exception" },
                { value: "warning", label: "Warnings" },
                { value: "info", label: "System Info" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setErrorFilter(f.value as any)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    errorFilter === f.value
                      ? "bg-[oklch(0.55_0.22_270)] text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search log trace details..."
                className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            </div>
          </div>

          {/* Exceptions Table / List */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-white/5">
              {filteredErrors.map((err) => {
                const isExpanded = expandedError === err.id;
                return (
                  <div
                    key={err.id}
                    className={`transition-colors duration-200 ${
                      err.resolved
                        ? "opacity-60 bg-white/0"
                        : isExpanded
                        ? "bg-white/5"
                        : "hover:bg-white/2"
                    }`}
                  >
                    {/* Log main row */}
                    <div className="flex items-center gap-5 px-6 py-4 cursor-pointer" onClick={() => setExpandedError(isExpanded ? null : err.id)}>
                      {/* Priority Tag */}
                      <span
                        className={`inline-flex shrink-0 w-24 items-center justify-center rounded-lg border py-1 text-[10px] font-black uppercase tracking-wider ${
                          err.level === "critical"
                            ? "border-red-500/30 bg-red-500/15 text-red-400"
                            : err.level === "warning"
                            ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                            : "border-sky-500/30 bg-sky-500/15 text-sky-400"
                        }`}
                      >
                        {err.level}
                      </span>

                      {/* Code status & timestamp */}
                      <div className="w-48 shrink-0">
                        <span className="block text-xs font-bold text-white font-mono">{err.code}</span>
                        <span className="mt-0.5 block text-[10px] text-white/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {err.timestamp}
                        </span>
                      </div>

                      {/* Error Msg & Route */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80 truncate leading-relaxed">{err.message}</p>
                        <span className="inline-block mt-1 font-mono text-[9px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded border border-white/5">
                          Route: {err.route}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => resolveError(err.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                            err.resolved
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {err.resolved ? "Resolved" : "Mark Resolved"}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Trace Info */}
                    {isExpanded && (
                      <div className="border-t border-white/5 bg-white/3 px-6 py-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          <Terminal className="h-3.5 w-3.5 text-[oklch(0.70_0.18_270)]" />
                          Stack Trace Exception Log Details
                        </div>
                        <pre className="rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-red-300 overflow-x-auto leading-relaxed shadow-inner">
                          {err.stack}
                        </pre>
                        <div className="flex gap-8 text-[10px] text-white/40">
                          <div>
                            Exception ID: <span className="font-mono text-white/60 font-bold">{err.id}</span>
                          </div>
                          <div>
                            Environment: <span className="text-white/60 font-semibold">Production (client bundle-es)</span>
                          </div>
                          <div>
                            User Agent: <span className="text-white/60 font-semibold">Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredErrors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle className="h-10 w-10 text-emerald-500/40 mb-3" />
                  <p className="text-sm font-semibold text-white/40">No matching log exceptions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
