import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Cloud, PlaneTakeoff, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/booking")({
  component: BookingPortal,
  head: () => ({
    meta: [{ title: "Booking Portal | Phoenix Flight Training" }],
  }),
});

function BookingPortal() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="bg-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PlaneTakeoff className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-background">
                  Booking Portal
                </h1>
                <p className="text-sm text-background/80">
                  Phoenix Flight Training Online System
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-background/25 bg-background/5 px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Column: Login & Status */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Flying Status */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                  Flying Status
                </h2>
              </div>
              <div className="px-6 py-8">
                <div className="flex items-center gap-4 rounded-xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">
                  <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="font-medium">Flights are operating normally today.</span>
                </div>
              </div>
            </div>

            {/* Login Panel */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Lock className="h-5 w-5 text-primary" />
                  Member Login
                </h2>
              </div>
              <div className="p-6">
                <form className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Forgotten Password?
                    </a>
                  </div>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Sidebar: Weather & News */}
          <div className="space-y-8">
            
            {/* Weather Widget */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Edinburgh Weather
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">METAR</h3>
                  <div className="mt-2 rounded-lg bg-foreground p-3 text-sm font-mono text-background">
                    EGPH 171120Z 24015KT 9999 FEW030 14/08 Q1012
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TAF</h3>
                  <div className="mt-2 rounded-lg bg-foreground p-3 text-sm font-mono text-background">
                    EGPH 171100Z 1712/1812 24015KT 9999 SCT030
                  </div>
                </div>
              </div>
            </div>

            {/* Latest News */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Latest News</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      MAY
                    </span>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      New Privacy Policy Update
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We are committed to protecting your privacy. We've updated our Privacy Policy to reflect recent changes.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
