import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plane, AlertTriangle, CheckCircle, Wrench, Plus, Save, Trash2, Gauge, Clock, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
});

type AircraftRow = Database["public"]["Tables"]["aircraft"]["Row"];
type AircraftStatus = Database["public"]["Enums"]["aircraft_status"];

const STATUSES: { value: AircraftStatus; label: string }[] = [
  { value: "serviceable", label: "Active & Serviceable" },
  { value: "maintenance", label: "AOG (Aircraft on Ground)" },
  { value: "inspection", label: "50hr / 100hr Inspection" },
  { value: "retired", label: "Retired / Inactive" },
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

  function update(id: string, field: keyof AircraftRow, value: any) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  const saveMut = useMutation({
    mutationFn: async (row: AircraftRow) => {
      const { id, created_at, updated_at, ...patch } = row;
      const { error } = await supabase.from("aircraft").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      toast.success(`${row.registration} saved`);
      setDrafts((d) => { const c = { ...d }; delete c[row.id]; return c; });
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("aircraft").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aircraft removed");
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("aircraft").insert({
        registration: "G-NEW",
        model: "New Aircraft",
        status: "serviceable",
        hours: 0,
        avionics: [],
        display_order: fleet.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Aircraft added");
      qc.invalidateQueries({ queryKey: ["aircraft"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Insert failed"),
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Fleet & Maintenance Logs</h2>
          <p className="mt-1 text-xs text-white/40">Live data from Lovable Cloud.</p>
        </div>
        <button onClick={() => addMut.mutate()} className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02]">
          <Plus className="h-4 w-4" />
          Register Aircraft
        </button>
      </div>

      {isLoading && <p className="text-white/50 text-sm">Loading…</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {merged.map((ac) => {
          const isDirty = !!drafts[ac.id];
          return (
            <div key={ac.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.70_0.18_270)]">
                      <Plane className="h-5 w-5" />
                    </div>
                    <div>
                      <input type="text" value={ac.registration} onChange={(e) => update(ac.id, "registration", e.target.value.toUpperCase())}
                        className="block w-24 bg-transparent text-sm font-black text-white outline-none border-b border-transparent focus:border-[oklch(0.65_0.22_270)] px-0 py-0.5" />
                      <input type="text" value={ac.model} onChange={(e) => update(ac.id, "model", e.target.value)}
                        className="block w-40 bg-transparent text-xs text-white/40 outline-none border-b border-transparent focus:border-[oklch(0.65_0.22_270)] px-0 py-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isDirty && <span className="text-[10px] text-amber-400 font-bold mr-1">Unsaved</span>}
                    <button onClick={() => saveMut.mutate(ac)} disabled={!isDirty || saveMut.isPending}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40" title="Save">
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete ${ac.registration}?`)) delMut.mutate(ac.id); }}
                      className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/60 hover:bg-red-500/20 transition-all" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Status</label>
                  <select value={ac.status} onChange={(e) => update(ac.id, "status", e.target.value as AircraftStatus)}
                    className="w-full mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[oklch(0.65_0.22_270)]">
                    {STATUSES.map((s) => <option key={s.value} value={s.value} className="bg-[oklch(0.12_0.04_270)]">{s.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                    <div className="flex items-center gap-1.5 text-white/30">
                      <Gauge className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hours</span>
                    </div>
                    <input type="number" step="0.1" value={ac.hours ?? 0} onChange={(e) => update(ac.id, "hours", parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-[oklch(0.65_0.22_270)]" />
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/3 p-3">
                    <div className="flex items-center gap-1.5 text-white/30">
                      <Coins className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Wet £/hr</span>
                    </div>
                    <input type="number" value={ac.rate_wet ?? 0} onChange={(e) => update(ac.id, "rate_wet", parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full bg-transparent text-sm font-bold text-white outline-none border-b border-transparent focus:border-[oklch(0.65_0.22_270)]" />
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /><span>Annual due</span></div>
                    <input type="date" value={ac.next_annual ?? ""} onChange={(e) => update(ac.id, "next_annual", e.target.value)}
                      className="bg-transparent text-white outline-none w-32 text-right text-xs font-mono" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /><span>Next 50hr</span></div>
                    <input type="number" step="0.1" value={ac.next_50hr ?? 0} onChange={(e) => update(ac.id, "next_50hr", parseFloat(e.target.value) || 0)}
                      className="bg-transparent text-white outline-none w-20 text-right text-xs font-mono" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Published</label>
                  <button onClick={() => update(ac.id, "published", !ac.published)}
                    className={`mt-1 w-full rounded-xl px-3 py-2 text-xs font-bold transition-all ${ac.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>
                    {ac.published ? "Live on /fleet" : "Hidden"}
                  </button>
                </div>
              </div>

              <div className="mt-5">
                {ac.status === "maintenance" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-bold text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" />AOG — BOOKINGS BLOCKED
                  </div>
                ) : ac.next_50hr && Number(ac.next_50hr) - Number(ac.hours ?? 0) <= 15 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-bold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />MAINTENANCE IN {(Number(ac.next_50hr) - Number(ac.hours ?? 0)).toFixed(1)} HRS
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 text-[10px] font-bold text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />STATUS OK
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}