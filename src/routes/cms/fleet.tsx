import { createFileRoute } from "@tanstack/react-router";
import {
  Plane,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Plus,
  Save,
  Trash2,
  Settings,
  Shield,
  Gauge,
  Clock,
  Coins,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cms/fleet")({
  component: CmsFleetManager,
});

type AircraftStatus = "serviceable" | "maintenance" | "inspection" | "retired";

type Aircraft = {
  id: number;
  reg: string;
  model: string;
  status: AircraftStatus;
  hours: number;
  rateWet: number;
  nextAnnual: string;
  next50hr: number;
  avionicsCount: number;
};

const INITIAL_FLEET: Aircraft[] = [
  {
    id: 1,
    reg: "G-PHNX",
    model: "Cessna 172 Skyhawk",
    status: "serviceable",
    hours: 4820.5,
    rateWet: 165,
    nextAnnual: "2026-10-15",
    next50hr: 4850.0,
    avionicsCount: 6,
  },
  {
    id: 2,
    reg: "G-BCDF",
    model: "Piper PA28 Cherokee",
    status: "serviceable",
    hours: 3125.8,
    rateWet: 180,
    nextAnnual: "2026-08-20",
    next50hr: 3150.0,
    avionicsCount: 5,
  },
  {
    id: 3,
    reg: "G-ZZAA",
    model: "Cessna 152 Trainer",
    status: "maintenance",
    hours: 5910.2,
    rateWet: 140,
    nextAnnual: "2026-06-05",
    next50hr: 5950.0,
    avionicsCount: 4,
  },
];

const STATUSES: { value: AircraftStatus; label: string; color: string }[] = [
  {
    value: "serviceable",
    label: "Active & Serviceable",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "maintenance",
    label: "AOG (Aircraft on Ground)",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    value: "inspection",
    label: "50hr / 100hr Inspection",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    value: "retired",
    label: "Retired / Inactive",
    color: "text-white/30 bg-white/5 border-white/10",
  },
];

function CmsFleetManager() {
  const [fleet, setFleet] = useState<Aircraft[]>(INITIAL_FLEET);
  const [nextId, setNextId] = useState(4);
  const [savedLogs, setSavedLogs] = useState<Record<number, boolean>>({});

  function updateAircraft(id: number, field: keyof Aircraft, value: any) {
    setFleet((prev) =>
      prev.map((ac) => (ac.id === id ? { ...ac, [field]: value } : ac))
    );
  }

  function handleSave(id: number) {
    setSavedLogs((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSavedLogs((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  }

  function deleteAircraft(id: number) {
    setFleet((prev) => prev.filter((ac) => ac.id !== id));
  }

  function addAircraft() {
    setFleet((prev) => [
      ...prev,
      {
        id: nextId,
        reg: "G-NEWY",
        model: "Cessna 172 Skyhawk",
        status: "serviceable",
        hours: 0.0,
        rateWet: 165,
        nextAnnual: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        next50hr: 50.0,
        avionicsCount: 4,
      },
    ]);
    setNextId((n) => n + 1);
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Fleet & Maintenance Logs</h2>
          <p className="mt-1 text-xs text-white/40">
            Track airframe hours, serviceability status, wet rental rates, and scheduled mandatory maintenance cycles.
          </p>
        </div>
        <button
          onClick={addAircraft}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/20 transition-all hover:scale-[1.02] hover:bg-[oklch(0.60_0.22_270)]"
        >
          <Plus className="h-4 w-4" />
          Register Aircraft
        </button>
      </div>

      {/* Grid of Aircraft Inventory Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fleet.map((ac) => (
          <div
            key={ac.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[oklch(0.55_0.22_270)]/30"
          >
            {/* Top row: Registration & quick status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.70_0.18_270)]">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={ac.reg}
                      onChange={(e) => updateAircraft(ac.id, "reg", e.target.value.toUpperCase())}
                      className="block w-24 bg-transparent text-sm font-black text-white outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 px-0 py-0.5"
                    />
                    <input
                      type="text"
                      value={ac.model}
                      onChange={(e) => updateAircraft(ac.id, "model", e.target.value)}
                      className="block w-40 bg-transparent text-xs text-white/40 outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 px-0 py-0.5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {savedLogs[ac.id] && (
                    <span className="text-[10px] text-green-400 font-bold mr-1">Saved</span>
                  )}
                  <button
                    onClick={() => handleSave(ac.id)}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                    title="Save Changes"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAircraft(ac.id)}
                    className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    title="Deregister Aircraft"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Select dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Operational Status</label>
                <select
                  value={ac.status}
                  onChange={(e) => updateAircraft(ac.id, "status", e.target.value as AircraftStatus)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
                >
                  {STATUSES.map((st) => (
                    <option key={st.value} value={st.value} className="bg-[oklch(0.12_0.04_270)] text-white">
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Airframe specs input blocks */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="flex items-center gap-1.5 text-white/30">
                    <Gauge className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tacho/Hobbs Hours</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={ac.hours}
                    onChange={(e) => updateAircraft(ac.id, "hours", parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full bg-transparent text-sm font-bold text-white outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 p-0"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="flex items-center gap-1.5 text-white/30">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Wet Hire Rate (/hr)</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-bold text-white/50 mr-0.5">£</span>
                    <input
                      type="number"
                      value={ac.rateWet}
                      onChange={(e) => updateAircraft(ac.id, "rateWet", parseInt(e.target.value) || 0)}
                      className="block w-full bg-transparent text-sm font-bold text-white outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 p-0"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Limits */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-white/30" />
                    <span>Annual Certificate due:</span>
                  </div>
                  <input
                    type="date"
                    value={ac.nextAnnual}
                    onChange={(e) => updateAircraft(ac.id, "nextAnnual", e.target.value)}
                    className="bg-transparent font-semibold text-white outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 p-0 text-right w-28 text-xs font-mono"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-white/30" />
                    <span>Next 50-hr check due:</span>
                  </div>
                  <div className="flex items-center font-semibold text-white">
                    <input
                      type="number"
                      step="0.1"
                      value={ac.next50hr}
                      onChange={(e) => updateAircraft(ac.id, "next50hr", parseFloat(e.target.value) || 0)}
                      className="bg-transparent text-right w-16 outline-none focus:border-[oklch(0.65_0.22_270)] border-b border-transparent focus:ring-0 p-0 text-xs font-mono mr-1"
                    />
                    <span className="text-[10px] text-white/35 font-normal">hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom visual alert if maintenance or check is close */}
            <div className="mt-5">
              {ac.status === "maintenance" ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  AIRCRAFT IS AOG. GROUND BOOKINGS BLOCKED.
                </div>
              ) : ac.next50hr - ac.hours <= 15 ? (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  MAINTENANCE MANDATORY IN {(ac.next50hr - ac.hours).toFixed(1)} HOURS
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-[10px] font-bold text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  STATUS OK — ALL CHECKS CURRENT
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
