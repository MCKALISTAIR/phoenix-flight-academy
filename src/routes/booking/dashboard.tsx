import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CreditCard, History, Plane, User, Compass, Clock, Gauge, AlertTriangle, CalendarPlus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { requireAuth } from "@/lib/auth-guards";

export const Route = createFileRoute("/booking/dashboard")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: CustomerDashboard,
  head: () => ({
    meta: [{ title: "Student Dashboard | Phoenix Flight Training" }],
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
      { name: "Oban Airport EGEO", alt: 25 }
    ]
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
      { name: "Barra Beach EGPR", alt: 5 }
    ]
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
      { name: "Dundee EGDE", alt: 17 }
    ]
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
      { name: "Glenforsa Airfield EGED", alt: 12 }
    ]
  }
};

const planes = {
  c172: {
    model: "Cessna 172 Skyhawk (G-PHNX)",
    cruiseSpeed: 105, // kts
    fuelBurnRate: 30 // Litres/hour
  },
  pa28: {
    model: "Piper PA28 Cherokee (G-BCDF)",
    cruiseSpeed: 115, // kts
    fuelBurnRate: 34 // Litres/hour
  }
};

function CustomerDashboard() {
  const [selectedDest, setSelectedDest] = useState("oban");
  const [selectedPlane, setSelectedPlane] = useState("c172");
  const [nextFlight, setNextFlight] = useState<any>({
    month: "May",
    day: "24",
    title: "PPL Lesson 4 - Circuit Training",
    time: "14:00 - 15:30",
    aircraft: "Cessna 172 (G-PHNX)"
  });
  const [confirmCancel, setConfirmCancel] = useState(false);

  const dest = destinations[selectedDest as keyof typeof destinations];
  const plane = planes[selectedPlane as keyof typeof planes];

  // Cruise flight time = (distance / speed) hours
  const flightTimeHours = dest.distance / plane.cruiseSpeed;
  const flightTimeMins = Math.round(flightTimeHours * 60);

  // Fuel consumption = flight time * burn rate + 45-min mandatory reserve
  const fuelBurnLitres = Math.round(flightTimeHours * plane.fuelBurnRate);
  const reserveFuelLitres = Math.round((45 / 60) * plane.fuelBurnRate);
  const totalRequiredFuel = fuelBurnLitres + reserveFuelLitres;

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, Alex</h1>
            <p className="mt-2 text-muted-foreground">Here is an overview of your training progress and flight planning tools.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Next Flight Card */}
          <div className="col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Next Scheduled Flight</h2>
              {!nextFlight && (
                <button
                  onClick={() => setNextFlight({
                    month: "May",
                    day: "24",
                    title: "PPL Lesson 4 - Circuit Training",
                    time: "14:00 - 15:30",
                    aircraft: "Cessna 172 (G-PHNX)"
                  })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Restore Simulated Flight
                </button>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center">
              {nextFlight ? (
                <div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <span className="text-[10px] font-bold uppercase">{nextFlight.month}</span>
                        <span className="text-lg font-bold leading-none">{nextFlight.day}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{nextFlight.title}</h3>
                        <p className="text-sm text-muted-foreground">{nextFlight.time} • {nextFlight.aircraft}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                        Confirmed
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <p className="text-xs text-muted-foreground">Need to make changes? Reschedule or cancel up to 24h prior.</p>
                    {confirmCancel ? (
                      <div className="flex items-center gap-2 animate-in fade-in duration-200">
                        <span className="text-xs font-medium text-red-500">Confirm cancellation?</span>
                        <button
                          onClick={() => {
                            setNextFlight(null);
                            setConfirmCancel(false);
                          }}
                          className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setConfirmCancel(false)}
                          className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmCancel(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-500 hover:underline transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Cancel Lesson
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty State Card layout */
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in duration-300">
                  <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3 shrink-0">
                    <XCircle className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No Upcoming Lessons Scheduled</h3>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Keep your pilot training active and complete your syllabus hours! Schedule your next instruction lesson or self-hire checkride.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      to="/booking"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/95 transition-transform hover:scale-[1.01]"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" /> Book Flight Lesson
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Balance */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4">
              <h2 className="font-semibold text-foreground">Account Balance</h2>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">£0.00</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">All flights are paid up to date.</p>
              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/95 shadow">
                <CreditCard className="h-4 w-4" />
                Add Funds
              </button>
            </div>
          </div>

          {/* Flight Plan & Trip Calculator */}
          <div className="col-span-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Cross-Country Navigation & Trip Planner
              </h2>
              <span className="text-xs text-muted-foreground font-mono">Flight Logs (VFR)</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Inputs side */}
                <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dispatch Settings</h3>
                  <div>
                    <label htmlFor="destination" className="block text-xs font-semibold text-muted-foreground mb-1.5">Destination Airport</label>
                    <select
                      id="destination"
                      value={selectedDest}
                      onChange={(e) => setSelectedDest(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="oban">Oban (EGEO) — 56 NM</option>
                      <option value="barra">Barra Beach (EGPR) — 112 NM</option>
                      <option value="dundee">Dundee (EGDE) — 36 NM</option>
                      <option value="glenforsa">Glenforsa (EGED) — 75 NM</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="aircraft" className="block text-xs font-semibold text-muted-foreground mb-1.5">Hangar Aircraft</label>
                    <select
                      id="aircraft"
                      value={selectedPlane}
                      onChange={(e) => setSelectedPlane(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="c172">Cessna 172 Skyhawk (G-PHNX)</option>
                      <option value="pa28">Piper PA28 Cherokee (G-BCDF)</option>
                    </select>
                  </div>
                </div>

                {/* Outputs Panel */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  {/* Distance Card */}
                  <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Flight Distance</span>
                    <div className="mt-2 flex items-baseline gap-1 text-primary">
                      <span className="text-2xl font-black">{dest.distance}</span>
                      <span className="text-xs font-bold uppercase font-mono">NM</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-2 block font-mono">True Hdg: {dest.heading.toString().padStart(3, '0')}°</span>
                  </div>

                  {/* ETE Card */}
                  <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Est. Time Enroute</span>
                    <div className="mt-2 flex items-baseline gap-1 text-emerald-500">
                      <span className="text-2xl font-black">{flightTimeMins}</span>
                      <span className="text-xs font-bold uppercase font-mono">MINS</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-2 block font-mono">Speed: {plane.cruiseSpeed} kts</span>
                  </div>

                  {/* Fuel Card */}
                  <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Required Fuel</span>
                    <div className="mt-2 flex items-baseline gap-1 text-amber-500">
                      <span className="text-2xl font-black">{totalRequiredFuel}</span>
                      <span className="text-xs font-bold uppercase font-mono">LTRS</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-2 block font-mono">Inc 45m Reserve</span>
                  </div>
                </div>
              </div>

              {/* Waypoint Nav Log Table */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-primary" />
                  Flight Navigation Log & MEA Checkpoints
                </h3>

                <div className="overflow-hidden rounded-xl border border-slate-800 shadow-inner">
                  <table className="w-full text-left font-mono text-xs bg-slate-950 text-slate-200">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900/60 text-slate-400 text-[10px] tracking-wider uppercase font-bold">
                        <th className="px-4 py-3">Waypoint / Fix</th>
                        <th className="px-4 py-3">Magnetic Course</th>
                        <th className="px-4 py-3">Safety Alt (MEA)</th>
                        <th className="px-4 py-3">Arrival Fix Alt</th>
                        <th className="px-4 py-3 text-right">Fuel Consumption</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {dest.waypoints.map((wp, wIdx) => {
                        const courseVal = wIdx === 0 ? "-" : `${dest.heading.toString().padStart(3, '0')}°`;
                        const fuelProgress = wIdx === 0 ? 0 : Math.round((wIdx / (dest.waypoints.length - 1)) * fuelBurnLitres);
                        return (
                          <tr key={wIdx} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {wp.name}
                            </td>
                            <td className="px-4 py-3 text-slate-300">{courseVal}</td>
                            <td className="px-4 py-3 text-slate-400">{dest.safetyAltitude} ft</td>
                            <td className="px-4 py-3 text-amber-400 font-bold">{wp.alt} ft</td>
                            <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                              {wIdx === 0 ? "Full Tank" : `-${fuelProgress} L`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3 text-xs leading-relaxed text-primary">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">VFR Navigation Warning:</strong>
                    Flight plans generated are for simulation and planning training. Always cross-check METAR weather, regional pressure settings, and airspace restrictions at the Cumbernauld Flight Operations desk before engine start.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
