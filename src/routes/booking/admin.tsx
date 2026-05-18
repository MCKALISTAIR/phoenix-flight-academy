import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle, Clock, Plane, Settings, Users, AlertTriangle, Crown } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";

export const Route = createFileRoute("/booking/admin")({
  beforeLoad: ({ location }) => requireRole(location.href, ["admin", "super_admin"]),
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Admin Portal | Phoenix Flight Training" }],
  }),
});

function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="text-lg font-bold text-foreground">Admin Portal</span>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <CalendarDays className="h-5 w-5" />
            Master Calendar
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Clock className="h-5 w-5" />
            Pending Requests
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Users className="h-5 w-5" />
            Students & Staff
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Plane className="h-5 w-5" />
            Fleet Status
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Settings className="h-5 w-5" />
            System Settings
          </a>
        </nav>
        {/* CMS Super Admin link */}
        <div className="border-t border-border p-4">
          <Link
            to="/cms"
            className="flex items-center gap-3 rounded-xl border border-[oklch(0.55_0.22_270)]/30 bg-[oklch(0.55_0.22_270)]/10 px-3 py-2.5 text-sm font-semibold text-[oklch(0.55_0.22_270)] transition-all hover:bg-[oklch(0.55_0.22_270)]/20"
          >
            <Crown className="h-4 w-4" />
            CMS Editor
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operations Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Manage bookings, fleet, and instructors.</p>
          </div>
          
          {/* Global Flying Status Toggle Mockup */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">Flying Status:</span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">GO</span>
            </div>
            <button className="ml-2 text-xs text-primary hover:underline">Change</button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Pending Bookings Queue */}
          <div className="col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4">
              <h2 className="font-semibold text-foreground">Pending Booking Requests</h2>
              <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                2 Needs Action
              </span>
            </div>
            <div className="divide-y divide-border">
              
              {/* Request 1 */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">John Doe</h3>
                    <p className="text-sm text-muted-foreground">PPL Lesson • Wed, May 26 • 10:00 - 11:30</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Historical Instructor: <strong>Captain Smith</strong> (80% of flights)
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                      <CheckCircle className="h-4 w-4" /> Assign & Approve
                    </button>
                  </div>
                </div>
              </div>

              {/* Request 2 */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Sarah Jenkins</h3>
                    <p className="text-sm text-muted-foreground">Self Hire (Cessna 172) • Thu, May 27 • 14:00 - 16:00</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs font-medium text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                      Check required: License expires in 5 days
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Today's Schedule Overview */}
          <div className="space-y-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="font-semibold text-foreground">Today's Schedule</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex border-l-2 border-primary pl-4">
                    <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">09:00</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Alex M. (C172)</p>
                      <p className="text-xs text-muted-foreground">Inst: Smith</p>
                    </div>
                  </div>
                  <div className="flex border-l-2 border-muted pl-4">
                    <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">11:00</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <div className="flex border-l-2 border-primary pl-4">
                    <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">13:30</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">David B. (PA28)</p>
                      <p className="text-xs text-muted-foreground">Self Hire</p>
                    </div>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                  View Full Calendar
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
