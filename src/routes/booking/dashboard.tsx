import { createFileRoute } from "@tanstack/react-router";
import { Calendar, CreditCard, History, Plane, User } from "lucide-react";

export const Route = createFileRoute("/booking/dashboard")({
  component: CustomerDashboard,
  head: () => ({
    meta: [{ title: "Student Dashboard | Phoenix Flight Training" }],
  }),
});

function CustomerDashboard() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-bold text-foreground">Student Portal</span>
        </div>
        <nav className="space-y-1 p-4">
          <a href="#" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <Plane className="h-5 w-5" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <Calendar className="h-5 w-5" />
            Book a Flight
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <History className="h-5 w-5" />
            Flight Log
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
            <User className="h-5 w-5" />
            Profile
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Alex</h1>
          <p className="mt-2 text-muted-foreground">Here is an overview of your training progress.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Next Flight Card */}
          <div className="col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <h2 className="font-semibold text-foreground">Next Scheduled Flight</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-bold uppercase">May</span>
                    <span className="text-lg font-bold leading-none">24</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">PPL Lesson 4 - Circuit Training</h3>
                    <p className="text-sm text-muted-foreground">14:00 - 15:30 • Cessna 172 (G-PHNX)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Balance / Payment Mockup */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <h2 className="font-semibold text-foreground">Account Balance</h2>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">£0.00</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">All flights are paid up to date.</p>
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
                <CreditCard className="h-4 w-4" />
                Add Funds
              </button>
            </div>
          </div>

          {/* Book New Flight Mockup */}
          <div className="col-span-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <h2 className="font-semibold text-foreground">Quick Book</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Select an aircraft and date to see available slots. You will be asked for payment details to secure the booking.</p>
              <div className="flex gap-4">
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <option>Cessna 172</option>
                  <option>Piper PA28</option>
                </select>
                <input type="date" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
                <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  Find Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
