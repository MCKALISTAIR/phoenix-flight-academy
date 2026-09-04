import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ban, Loader2, Trash2, Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/resource-blocks")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ResourceBlocksPage,
  head: () => ({ meta: [{ title: "Resource Blocks | CMS" }] }),
});

type Kind = "aircraft" | "instructor";

type Row = {
  id: string;
  resource_kind: Kind;
  aircraft_id: string | null;
  instructor_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

type Aircraft = { id: string; registration: string; model: string };
type Instructor = { id: string; name: string };

function ResourceBlocksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [kind, setKind] = useState<Kind>("aircraft");
  const [aircraftId, setAircraftId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reason, setReason] = useState("");

  async function load() {
    setLoading(true);
    const [{ data: blocks }, { data: ac }, { data: inst }] = await Promise.all([
      supabase
        .from("booking_resource_blocks")
        .select("id,resource_kind,aircraft_id,instructor_id,starts_at,ends_at,reason")
        .order("starts_at", { ascending: false }),
      supabase.from("aircraft").select("id,registration,model").order("registration"),
      supabase.from("instructors").select("id,name").order("name"),
    ]);
    setRows((blocks ?? []) as Row[]);
    setAircraft((ac ?? []) as Aircraft[]);
    setInstructors((inst ?? []) as Instructor[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!startsAt || !endsAt) return;
    if (kind === "aircraft" && !aircraftId) return;
    if (kind === "instructor" && !instructorId) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("booking_resource_blocks").insert({
      resource_kind: kind,
      aircraft_id: kind === "aircraft" ? aircraftId : null,
      instructor_id: kind === "instructor" ? instructorId : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      reason: reason || null,
      created_by: userData.user?.id ?? null,
      organization_id: DEFAULT_ORG_ID,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setAircraftId("");
    setInstructorId("");
    setStartsAt("");
    setEndsAt("");
    setReason("");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("booking_resource_blocks").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  function labelFor(r: Row): string {
    if (r.resource_kind === "aircraft") {
      const a = aircraft.find((x) => x.id === r.aircraft_id);
      return a ? `${a.registration} (${a.model})` : "Aircraft";
    }
    const i = instructors.find((x) => x.id === r.instructor_id);
    return i ? i.name : "Instructor";
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Ban className="h-6 w-6 text-white/80" />
        <h1 className="text-2xl font-bold text-white">Resource Blocks</h1>
      </div>
      <p className="text-sm text-white/60 mb-6">
        Mark aircraft or instructors as unavailable for a time window (maintenance, leave, etc.).
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Add block</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Resource
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="aircraft">Aircraft</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              {kind === "aircraft" ? "Aircraft" : "Instructor"}
            </label>
            {kind === "aircraft" ? (
              <select
                value={aircraftId}
                onChange={(e) => setAircraftId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                <option value="">Select aircraft…</option>
                {aircraft.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.registration} — {a.model}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
              >
                <option value="">Select instructor…</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Starts
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Ends
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. 50hr inspection"
              className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add block
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/40">No resource blocks set.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Kind</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="px-4 py-3 text-left">Starts</th>
                <th className="px-4 py-3 text-left">Ends</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white/70 capitalize">{r.resource_kind}</td>
                  <td className="px-4 py-3 text-white">{labelFor(r)}</td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(r.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(r.ends_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="text-red-400 hover:text-red-300"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
