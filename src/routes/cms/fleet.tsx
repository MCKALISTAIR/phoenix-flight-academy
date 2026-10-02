import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plane,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Plus,
  Save,
  Trash2,
  Gauge,
  Clock,
  Coins,
  Fuel,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Sliders,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import { requireSuperAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/fleet")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CmsFleetManager,
  head: () => ({
    meta: [{ title: "Aircraft Tech Log & Maintenance | Phoenix Flight Training" }],
  }),
});

type AircraftRow = Database["public"]["Tables"]["aircraft"]["Row"];
type AircraftStatus = Database["public"]["Enums"]["aircraft_status"];

const STATUSES: { value: AircraftStatus; label: string }[] = [
  { value: "serviceable", label: "Active & Serviceable" },
  { value: "maintenance", label: "AOG (Aircraft on Ground)" },
  { value: "inspection", label: "50hr / 100hr Inspection" },
  { value: "retired", label: "Retired / Inactive" },
];

interface SnagItem {
  id: string;
  item: string;
  date: string;
  reportedBy: string;
  melStatus: "open" | "deferred_mel" | "rectified";
  clearedBy?: string;
}

const INITIAL_SNAGS: SnagItem[] = [
  {
    id: "snag-1",
    item: "Navigation light left wingtip bulb replaced and operational check satisfactory.",
    date: "2026-09-18",
    reportedBy: "Capt. A. McKay",
    melStatus: "rectified",
    clearedBy: "Chief Engineer (AME)",
  },
  {
    id: "snag-2",
    item: "Pitot heat advisory switch checked for positive detent on pre-flight.",
    date: "2026-09-22",
    reportedBy: "Flight Desk Ops",
    melStatus: "deferred_mel",
    clearedBy: "Operational under VMC day only",
  },
];

function CmsFleetManager() {
  const qc = useQueryClient();
  const { data: fleet = [], isLoading } = useQuery({
    queryKey: ["aircraft", "cms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("aircraft").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const [drafts, setDrafts] = useState<Record<string, Partial<AircraftRow>>>({});
  useEffect(() => setDrafts({}), [fleet.length]);

  const merged = fleet.map((ac) => ({ ...ac, ...(drafts[ac.id] ?? {}) }));

  function update<K extends keyof AircraftRow>(id: string, field: K, value: AircraftRow[K]) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  const [snags, setSnags] = useState<SnagItem[]>(INITIAL_SNAGS);
  const [showSnagModal, setShowSnagModal] = useState(false);
  const [newSnagText, setNewSnagText] = useState("");
  const [newSnagReportedBy, setNewSnagReportedBy] = useState("Capt. Alistair McKay");
  const [newSnagMel, setNewSnagMel] = useState<"open" | "deferred_mel">("open");

  const saveMut = useMutation({
    mutationFn: async (row: AircraftRow) => {
      const { id, created_at, updated_at, ...patch } = row;
      const { error } = await supabase.from("aircraft").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      toast.success(`${row.registration} technical record updated`);
      setDrafts((d) => {
        const c = { ...d };
        delete c[row.id];
        return c;
      });
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("aircraft").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aircraft record removed");
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Delete failed"),
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("aircraft").insert({
        registration: "G-EGPG",
        model: "Piper PA-28-181 Archer III",
        status: "serviceable",
        hours: 3125.8,
        next_50hr: 3150.0,
        next_annual: "2026-10-15",
        rate_wet: 185,
        engine: "Lycoming O-360-A4M (180 HP)",
        cruise_speed: "115 kts",
        fuel_burn: "34L / hour",
        max_seats: "4 Seats (1 Pilot + 3 Pax)",
        avionics: [
          "Traditional Steam Gauges",
          "Trig TT31 Mode S Transponder",
          "8.33 kHz Radio",
          "Dual Altimeters (IFR)",
        ],
        display_order: fleet.length,
        organization_id: DEFAULT_ORG_ID,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aircraft airframe registered");
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Insert failed"),
  });

  function handleAddSnag(e: React.FormEvent) {
    e.preventDefault();
    if (!newSnagText.trim()) return;
    const newEntry: SnagItem = {
      id: `snag-${Date.now()}`,
      item: newSnagText.trim(),
      date: new Date().toISOString().slice(0, 10),
      reportedBy: newSnagReportedBy,
      melStatus: newSnagMel,
    };
    setSnags([newEntry, ...snags]);
    setNewSnagText("");
    setShowSnagModal(false);
    toast.success("Snag recorded in aircraft technical log");
  }

  function handleClearSnag(id: string) {
    setSnags((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              melStatus: "rectified",
              clearedBy: "Chief Flying Instructor / AME Sign-off",
            }
          : s,
      ),
    );
    toast.success("Defect cleared and signed off");
  }

  const primaryAircraft = merged[0];
  const currentHours = Number(primaryAircraft?.hours ?? 3125.8);
  const next50 = Number(primaryAircraft?.next_50hr ?? 3150.0);
  const hoursRemaining50 = Math.max(0, next50 - currentHours);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Plane className="h-6 w-6 text-primary" />
              Aircraft Technical Log &amp; Airworthiness
            </h1>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Cumbernauld Airport (EGPG) · Part-ML maintenance logs, engine telemetry, and daily
            defect sheet.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSnagModal(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all active:scale-[0.98]"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Report Snag / Defect
          </button>
          <button
            onClick={() => addMut.mutate()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            Register Airframe
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-xs font-mono text-white/40">
          Loading aircraft maintenance logs…
        </div>
      )}

      {/* Primary Airframe Dossier Card */}
      {primaryAircraft && (
        <div className="rounded-2xl border border-white/10 bg-surface-navy/70 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black font-mono tracking-tight text-white">
                    {primaryAircraft.registration}
                  </h2>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-bold uppercase">
                    {primaryAircraft.status}
                  </span>
                </div>
                <p className="text-xs text-white/50">{primaryAircraft.model}</p>
              </div>
            </div>

            {/* Airworthiness Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-mono uppercase text-white/40">
                  Total Tach Time
                </span>
                <span className="text-base font-black font-mono text-white tabular-nums">
                  {currentHours.toFixed(1)} hrs
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-mono uppercase text-white/40">
                  Next 50h Check
                </span>
                <span className="text-base font-black font-mono text-amber-300 tabular-nums">
                  {hoursRemaining50.toFixed(1)}h left
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-mono uppercase text-white/40">
                  Annual / ARC Due
                </span>
                <span className="text-base font-black font-mono text-white tabular-nums">
                  {primaryAircraft.next_annual || "2026-10-15"}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="block text-[10px] font-mono uppercase text-white/40">
                  Wet Rate (£/hr)
                </span>
                <span className="text-base font-black font-mono text-emerald-400 tabular-nums">
                  £{primaryAircraft.rate_wet ?? 185}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Airframe Systems Telemetry Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-white/40">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] uppercase font-bold">Powerplant</span>
              </div>
              <p className="font-bold text-white text-xs">Lycoming O-360-A4M</p>
              <p className="text-[11px] text-white/50">180 HP @ 2,700 RPM · 4-Cylinder Direct Drive</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-white/40">
                <Fuel className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono text-[10px] uppercase font-bold">Fuel Capacity</span>
              </div>
              <p className="font-bold text-white text-xs">182L Total · 128L Tabs</p>
              <p className="text-[11px] text-white/50">AVGAS 100LL · Burn: ~34 Litres/hr</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-white/40">
                <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-[10px] uppercase font-bold">Oil Capacity</span>
              </div>
              <p className="font-bold text-white text-xs">6 – 8 US Quarts</p>
              <p className="text-[11px] text-white/50">AeroShell W100 / 15W-50 Semi-Synthetic</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-white/40">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-mono text-[10px] uppercase font-bold">Mass &amp; Balance</span>
              </div>
              <p className="font-bold text-white text-xs">MTOW: 2,550 lbs (1,157 kg)</p>
              <p className="text-[11px] text-white/50">Useful Load: 930 lbs · Datum: Firewall</p>
            </div>
          </div>
        </div>
      )}

      {/* Defect & Snag Sheet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              Airframe Snag &amp; Defect Log
            </h2>
            <p className="text-xs text-white/40">
              Live defect reporting with MEL (Minimum Equipment List) tracking.
            </p>
          </div>
          <button
            onClick={() => setShowSnagModal(true)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            + New Snag
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 text-left uppercase font-mono text-[10px] text-white/40 bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Defect Description</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Sign-Off / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {snags.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] text-white/80">
                    <td className="px-4 py-3 font-mono text-white/50 whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-md">{s.item}</td>
                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">{s.reportedBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.melStatus === "rectified" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Rectified
                        </span>
                      ) : s.melStatus === "deferred_mel" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                          <AlertTriangle className="h-3 w-3" /> Deferred (MEL)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                          <AlertOctagon className="h-3 w-3" /> Open Snag
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {s.melStatus !== "rectified" ? (
                        <button
                          onClick={() => handleClearSnag(s.id)}
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                          Sign-Off Cleared
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/40">{s.clearedBy}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fleet Database Editor (Full CRUD for registered aircraft) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Registered Aircraft Records</h2>
          <p className="text-xs text-white/40">
            Edit technical hours, wet rates, and maintenance due dates in database.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {merged.map((ac) => {
            const isDirty = !!drafts[ac.id];
            return (
              <div
                key={ac.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={ac.registration}
                          onChange={(e) =>
                            update(ac.id, "registration", e.target.value.toUpperCase())
                          }
                          className="block w-24 bg-transparent text-sm font-black text-white outline-none border-b border-transparent focus:border-primary px-0 py-0.5 font-mono"
                        />
                        <input
                          type="text"
                          value={ac.model}
                          onChange={(e) => update(ac.id, "model", e.target.value)}
                          className="block w-40 bg-transparent text-xs text-white/40 outline-none border-b border-transparent focus:border-primary px-0 py-0.5"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isDirty && (
                        <span className="text-[10px] text-amber-400 font-bold mr-1">Unsaved</span>
                      )}
                      <button
                        onClick={() => saveMut.mutate(ac)}
                        disabled={!isDirty || saveMut.isPending}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                        title="Save Changes"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${ac.registration}?`)) delMut.mutate(ac.id);
                        }}
                        className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/60 hover:bg-red-500/20 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Airworthiness Status
                    </label>
                    <select
                      value={ac.status}
                      onChange={(e) => update(ac.id, "status", e.target.value as AircraftStatus)}
                      className="w-full mt-1 rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-xs text-white outline-none focus:border-primary"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-surface-navy">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Gauge className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Hours</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={ac.hours ?? 0}
                        onChange={(e) => update(ac.id, "hours", parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full bg-transparent text-sm font-mono font-bold text-white outline-none border-b border-transparent focus:border-primary"
                      />
                    </div>
                    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1.5 text-white/40">
                        <Coins className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Wet £/hr
                        </span>
                      </div>
                      <input
                        type="number"
                        value={ac.rate_wet ?? 0}
                        onChange={(e) => update(ac.id, "rate_wet", parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full bg-transparent text-sm font-mono font-bold text-white outline-none border-b border-transparent focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Annual ARC due</span>
                      </div>
                      <input
                        type="date"
                        value={ac.next_annual ?? ""}
                        onChange={(e) => update(ac.id, "next_annual", e.target.value)}
                        className="bg-transparent text-white outline-none w-32 text-right text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Next 50hr Tach</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={ac.next_50hr ?? 0}
                        onChange={(e) =>
                          update(ac.id, "next_50hr", parseFloat(e.target.value) || 0)
                        }
                        className="bg-transparent text-white outline-none w-20 text-right text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Public Visibility
                    </label>
                    <button
                      onClick={() => update(ac.id, "published", !ac.published)}
                      className={`mt-1 w-full rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        ac.published
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {ac.published ? "Live on /fleet" : "Hidden from Public"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  {ac.status === "maintenance" ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      AOG — BOOKINGS BLOCKED
                    </div>
                  ) : ac.next_50hr && Number(ac.next_50hr) - Number(ac.hours ?? 0) <= 15 ? (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      MAINTENANCE IN {(Number(ac.next_50hr) - Number(ac.hours ?? 0)).toFixed(1)} HRS
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      AIRWORTHINESS CURRENT
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Report Snag */}
      {showSnagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-navy p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Report Aircraft Snag / Defect
              </h3>
              <button
                onClick={() => setShowSnagModal(false)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSnag} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Airframe
                </label>
                <input
                  type="text"
                  value="G-EGPG (Piper PA-28 Archer III)"
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-mono font-bold text-white/70"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Defect Description
                </label>
                <textarea
                  rows={3}
                  value={newSnagText}
                  onChange={(e) => setNewSnagText(e.target.value)}
                  placeholder="e.g. Left strobe lamp inoperative during walkaround."
                  className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Reported By
                </label>
                <input
                  type="text"
                  value={newSnagReportedBy}
                  onChange={(e) => setNewSnagReportedBy(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Airworthiness Status
                </label>
                <select
                  value={newSnagMel}
                  onChange={(e) => setNewSnagMel(e.target.value as any)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                >
                  <option value="open">Open Defect (Requires Rectification)</option>
                  <option value="deferred_mel">Deferred under Part-ML MEL (Permitted to fly)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSnagModal(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-bold transition-colors"
                >
                  Save to Tech Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
