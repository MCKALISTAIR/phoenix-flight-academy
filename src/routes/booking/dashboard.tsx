import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import {
  Calendar,
  CreditCard,
  History,
  Plane,
  User,
  Compass,
  Clock,
  Gauge,
  CalendarPlus,
  Trash2,
  XCircle,
  Cloud,
  Wind,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth-guards";
import { listMyBookings } from "@/lib/bookings.functions";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/booking/dashboard")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAuth(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CustomerDashboard,
  head: () => ({
    meta: [{ title: "Flight Operations & Student Dashboard | Phoenix Flight Training" }],
  }),
});

const destinations = {
  oban: {
    name: "Oban (EGEO)",
    distance: 56, // NM
    safetyAltitude: 3500, // MEA (feet)
    heading: 285, // degrees
    waypoints: [
      { name: "Cumbernauld EGPG", alt: 350 },
      { name: "Loch Lomond VRP", alt: 2500 },
      { name: "Crianlarich Pass", alt: 3500 },
      { name: "Oban Airport EGEO", alt: 25 },
    ],
  },
  barra: {
    name: "Barra Beach (EGPR)",
    distance: 112, // NM
    safetyAltitude: 4500, // MEA (feet)
    heading: 295, // degrees
    waypoints: [
      { name: "Cumbernauld EGPG", alt: 350 },
      { name: "Tyndrum VRP", alt: 3000 },
      { name: "Mull Sound Pass", alt: 4000 },
      { name: "Barra Beach EGPR", alt: 5 },
    ],
  },
  dundee: {
    name: "Dundee (EGDE)",
    distance: 36, // NM
    safetyAltitude: 2500, // MEA (feet)
    heading: 45, // degrees
    waypoints: [
      { name: "Cumbernauld EGPG", alt: 350 },
      { name: "Stirling Castle VRP", alt: 1500 },
      { name: "Perth West Pass", alt: 2500 },
      { name: "Dundee EGDE", alt: 17 },
    ],
  },
  glenforsa: {
    name: "Glenforsa (EGED)",
    distance: 75, // NM
    safetyAltitude: 4000, // MEA (feet)
    heading: 280, // degrees
    waypoints: [
      { name: "Cumbernauld EGPG", alt: 350 },
      { name: "Loch Lomond VRP", alt: 2500 },
      { name: "Sound of Mull Pass", alt: 4000 },
      { name: "Glenforsa Airfield EGED", alt: 12 },
    ],
  },
};

const planes = {
  c172: {
    model: "Cessna 172 Skyhawk (G-PHNX)",
    cruiseSpeed: 105, // kts
    fuelBurnRate: 30, // Litres/hour
  },
  pa28: {
    model: "Piper PA28 Cherokee (G-BCDF)",
    cruiseSpeed: 115, // kts
    fuelBurnRate: 34, // Litres/hour
  },
};

function CustomerDashboard() {
  const { user } = useAuth();
  const pilotName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Aviator";

  const [selectedDest, setSelectedDest] = useState("oban");
  const [selectedPlane, setSelectedPlane] = useState("c172");
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Weather & Runway Crosswind state
  const [showDecoded, setShowDecoded] = useState(false);
  const [windDir, setWindDir] = useState(240);
  const [windSpeed, setWindSpeed] = useState(15);

  const fetchMyBookings = useServerFn(listMyBookings);
  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => fetchMyBookings(),
  });

  const now = new Date().toISOString();
  const upcoming = bookings.filter((b) => b.starts_at > now && b.status !== "cancelled");

  const dbNextFlight = upcoming
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  const dbNextFlightFormatted = dbNextFlight
    ? {
        month: new Date(dbNextFlight.starts_at).toLocaleString("en-GB", { month: "short" }),
        day: new Date(dbNextFlight.starts_at).toLocaleString("en-GB", { day: "numeric" }),
        title: dbNextFlight.booking_products?.name || "Flight Lesson",
        time: `${new Date(dbNextFlight.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} - ${new Date(dbNextFlight.ends_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
        aircraft: dbNextFlight.aircraft
          ? `${dbNextFlight.aircraft.registration} (${dbNextFlight.aircraft.model})`
          : "Phoenix Fleet",
      }
    : null;

  const unpaidBookings = upcoming.filter((b) => b.payment_status === "unpaid");

  // Flight Planning calculations
  const dest = destinations[selectedDest as keyof typeof destinations];
  const plane = planes[selectedPlane as keyof typeof planes];
  const flightTimeHours = dest.distance / plane.cruiseSpeed;
  const flightTimeMins = Math.round(flightTimeHours * 60);
  const fuelBurnLitres = Math.round(flightTimeHours * plane.fuelBurnRate);
  const reserveFuelLitres = Math.round((45 / 60) * plane.fuelBurnRate);
  const totalRequiredFuel = fuelBurnLitres + reserveFuelLitres;

  // Active Runway calculations for Cumbernauld (EGPG - Runway 26/08)
  const diffTo26 = Math.min(Math.abs(windDir - 260), 360 - Math.abs(windDir - 260));
  const diffTo08 = Math.min(Math.abs(windDir - 80), 360 - Math.abs(windDir - 80));
  const activeRunway = diffTo26 < diffTo08 ? "26" : "08";
  const activeHeading = activeRunway === "26" ? 260 : 80;
  const angleDiffRad = ((windDir - activeHeading) * Math.PI) / 180;
  const headwind = Math.max(0, Math.round(windSpeed * Math.cos(angleDiffRad)));
  const crosswind = Math.round(Math.abs(windSpeed * Math.sin(angleDiffRad)));
  const isWithinCrosswindLimit = crosswind <= 15;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card hidden md:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Plane className="h-4 w-4 text-primary" />
            Flight Portal
          </span>
        </div>
        <nav className="space-y-1 p-4">
          <Link
            to="/booking/dashboard"
            className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
          >
            <Gauge className="h-4 w-4" />
            Operations Overview
          </Link>
          <Link
            to="/booking"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Schedule Flight
          </Link>
          <Link
            to="/fleet"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Plane className="h-4 w-4" />
            Aircraft Fleet
          </Link>
          <Link
            to="/flying/learn-to-fly"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Training Syllabus
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            Account & Records
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-primary border border-border mb-2">
              EGPG Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {pilotName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Here is your active flight status, live Cumbernauld runway telemetry, and navigation
              planning tools.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/booking"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90"
            >
              <CalendarPlus className="h-4 w-4" />
              Book Flight Lesson
            </Link>
          </div>
        </div>

        {/* Top Grid: Next Flight + Account Balance */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Next Flight Card (2 cols) */}
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="border-b border-border bg-muted/40 px-6 py-3.5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Next Scheduled Flight
              </h2>
              {dbNextFlightFormatted && <Badge variant="operational">CONFIRMED</Badge>}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
              {dbNextFlightFormatted ? (
                <div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 font-mono">
                        <span className="text-[10px] font-bold uppercase">
                          {dbNextFlightFormatted.month}
                        </span>
                        <span className="text-lg font-bold leading-none tabular-nums">
                          {dbNextFlightFormatted.day}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">
                          {dbNextFlightFormatted.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dbNextFlightFormatted.time} • {dbNextFlightFormatted.aircraft}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <p className="text-xs text-muted-foreground">
                      Need to adjust your booking? Reschedule or cancel up to 24h prior.
                    </p>
                    <Link to="/account" className="text-xs font-bold text-primary hover:underline">
                      Manage Booking &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3 shrink-0">
                    <Plane className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    No Upcoming Lessons Scheduled
                  </h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Keep your training momentum going. Reserve your next instructor slot or
                    self-hire checkride.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] hover:bg-primary/90"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" /> Book Next Flight Slot
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Balance Card (1 col) */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="border-b border-border bg-muted/40 px-6 py-3.5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Flight Account Balance
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold tabular-nums text-foreground">
                  £
                  {unpaidBookings.length > 0
                    ? (
                        unpaidBookings.reduce((sum, b) => sum + (b.price_total_cents || 0), 0) / 100
                      ).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {unpaidBookings.length > 0
                  ? "Pending balance for scheduled flights."
                  : "All flight records are up to date."}
              </p>

              {unpaidBookings.length > 0 ? (
                <div className="mt-4 space-y-2 pt-4 border-t border-border">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                    Unpaid Invoices
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {unpaidBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-2 text-xs bg-muted/30 p-2 rounded-lg border border-border"
                      >
                        <span className="font-semibold truncate text-foreground">
                          {b.booking_products?.name || "Flight"}
                        </span>
                        <Link
                          to="/booking/checkout/$id"
                          params={{ id: b.id }}
                          className="shrink-0 rounded bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground"
                        >
                          Pay
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <Link
                    to="/account"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-bold text-foreground transition-all hover:bg-muted"
                  >
                    View Billing History
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Runway & Weather Operations Console */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/40 px-6 py-3.5 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-500" />
              Live Runway & Weather Operations Console (EGPG)
            </h2>
            <button
              type="button"
              onClick={() => setShowDecoded(!showDecoded)}
              className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-mono font-bold text-foreground border border-border hover:bg-accent transition-colors"
            >
              {showDecoded ? "View Raw METAR" : "Decode Weather"}
            </button>
          </div>

          <div className="p-6 grid gap-6 lg:grid-cols-12">
            {/* METAR & Airfield Status (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-foreground">
                    CUMBERNAULD AIRPORT
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">Elev: 356 ft</span>
                </div>
                <Badge variant={isWithinCrosswindLimit ? "operational" : "caution"}>
                  {isWithinCrosswindLimit ? "CIRCUITS CLEARED" : "CROSSWIND ADVISORY"}
                </Badge>
              </div>

              {!showDecoded ? (
                <div className="rounded-lg bg-slate-950 p-3.5 text-xs font-mono text-slate-100 border border-slate-800 leading-relaxed tracking-wide">
                  EGPG 171120Z {windDir.toString().padStart(3, "0")}
                  {windSpeed.toString().padStart(2, "0")}KT 9999 FEW025 SCT040 12/07 Q1018
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wind:</span>
                    <span className="font-mono font-bold text-foreground">
                      {windDir}° at {windSpeed} kts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visibility:</span>
                    <span className="font-mono font-bold text-foreground">&gt; 10 km (Cavok)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clouds:</span>
                    <span className="font-mono font-bold text-foreground">
                      Few at 2,500 ft, Scattered at 4,000 ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Altimeter (QNH):</span>
                    <span className="font-mono font-bold text-foreground">1018 hPa</span>
                  </div>
                </div>
              )}

              {/* Interactive Wind Adjuster for Practice */}
              <div className="rounded-lg border border-border bg-muted/10 p-3.5 space-y-3">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Crosswind Calculator Adjuster
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wind Direction:</span>
                    <span className="font-mono font-bold text-foreground">{windDir}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="10"
                    value={windDir}
                    onChange={(e) => setWindDir(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Wind Speed:</span>
                    <span className="font-mono font-bold text-foreground">{windSpeed} kts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Runway 26/08 Telemetry & Graphic (7 cols) */}
            <div className="lg:col-span-7 rounded-xl border border-border bg-muted/20 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Favoured Active Runway: Runway {activeRunway}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  Heading: {activeHeading}°
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-muted-foreground">
                    Headwind Component
                  </span>
                  <span className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {headwind} <span className="text-xs font-normal">kts</span>
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-muted-foreground">
                    Crosswind Component
                  </span>
                  <span
                    className={`font-mono text-2xl font-black tabular-nums ${
                      isWithinCrosswindLimit ? "text-foreground" : "text-destructive"
                    }`}
                  >
                    {crosswind} <span className="text-xs font-normal">kts</span>
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground leading-relaxed flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Demonstrated crosswind limits: <strong>15 kts</strong> (C172) and{" "}
                  <strong>17 kts</strong> (PA28). Student solo circuit limits at EGPG are typically
                  10 kts crosswind.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Plan & Trip Calculator */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/40 px-6 py-3.5 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Cross-Country Navigation & Fuel Calculator
            </h2>
            <span className="text-[11px] text-muted-foreground font-mono">
              VFR Navigation Simulator
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Inputs side */}
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Dispatch Route
                </span>
                <div>
                  <label
                    htmlFor="destination"
                    className="block text-xs font-semibold text-muted-foreground mb-1"
                  >
                    Destination Airfield
                  </label>
                  <select
                    id="destination"
                    value={selectedDest}
                    onChange={(e) => setSelectedDest(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="oban">Oban (EGEO) — 56 NM</option>
                    <option value="barra">Barra Beach (EGPR) — 112 NM</option>
                    <option value="dundee">Dundee (EGDE) — 36 NM</option>
                    <option value="glenforsa">Glenforsa (EGED) — 75 NM</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="aircraft"
                    className="block text-xs font-semibold text-muted-foreground mb-1"
                  >
                    Airframe Type
                  </label>
                  <select
                    id="aircraft"
                    value={selectedPlane}
                    onChange={(e) => setSelectedPlane(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="c172">Cessna 172 Skyhawk (G-PHNX)</option>
                    <option value="pa28">Piper PA28 Cherokee (G-BCDF)</option>
                  </select>
                </div>
              </div>

              {/* Outputs Panel */}
              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Flight Distance
                  </span>
                  <div className="mt-2 flex items-baseline gap-1 text-primary">
                    <span className="font-mono text-2xl font-black tabular-nums">
                      {dest.distance}
                    </span>
                    <span className="text-xs font-bold uppercase font-mono">NM</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2 block font-mono tabular-nums">
                    True Hdg: {dest.heading.toString().padStart(3, "0")}°
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Est. Time Enroute
                  </span>
                  <div className="mt-2 flex items-baseline gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="font-mono text-2xl font-black tabular-nums">
                      {flightTimeMins}
                    </span>
                    <span className="text-xs font-bold uppercase font-mono">MINS</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2 block font-mono tabular-nums">
                    Speed: {plane.cruiseSpeed} kts
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Required Fuel
                  </span>
                  <div className="mt-2 flex items-baseline gap-1 text-foreground">
                    <span className="font-mono text-2xl font-black tabular-nums">
                      {totalRequiredFuel}
                    </span>
                    <span className="text-xs font-bold uppercase font-mono">LTRS</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                    Inc 45m Reserve
                  </span>
                </div>
              </div>
            </div>

            {/* Waypoint Nav Log Table */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Waypoint En-Route Altitudes & Checkpoints
              </span>

              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[10px] tracking-wider uppercase font-bold">
                      <th className="px-4 py-3">Waypoint / Fix</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Safety Altitude (MEA)</th>
                      <th className="px-4 py-3">Fix Alt</th>
                      <th className="px-4 py-3 text-right">Fuel Consumption</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dest.waypoints.map((wp, wIdx) => {
                      const courseVal =
                        wIdx === 0 ? "—" : `${dest.heading.toString().padStart(3, "0")}°`;
                      const fuelProgress =
                        wIdx === 0
                          ? 0
                          : Math.round((wIdx / (dest.waypoints.length - 1)) * fuelBurnLitres);
                      return (
                        <tr key={wIdx} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {wp.name}
                          </td>
                          <td className="px-4 py-2.5 text-foreground/80 tabular-nums">
                            {courseVal}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                            {dest.safetyAltitude} ft
                          </td>
                          <td className="px-4 py-2.5 text-foreground font-bold tabular-nums">
                            {wp.alt} ft
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold tabular-nums text-muted-foreground">
                            {wIdx === 0 ? "Full Tank" : `-${fuelProgress} L`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
