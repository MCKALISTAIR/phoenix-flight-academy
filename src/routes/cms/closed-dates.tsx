import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarX, Loader2, Trash2, Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/closed-dates")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ClosedDatesPage,
  head: () => ({ meta: [{ title: "Closed Dates | CMS" }] }),
});

type Row = {
  id: string;
  starts_on: string;
  ends_on: string;
  reason: string | null;
};

function ClosedDatesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("booking_closed_dates")
      .select("id,starts_on,ends_on,reason")
      .order("starts_on", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!startsOn || !endsOn) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("booking_closed_dates").insert({
      starts_on: startsOn,
      ends_on: endsOn,
      reason: reason || null,
      created_by: userData.user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStartsOn("");
    setEndsOn("");
    setReason("");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("booking_closed_dates").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <CalendarX className="h-6 w-6 text-white/80" />
        <h1 className="text-2xl font-bold text-white">Closed Dates</h1>
      </div>
      <p className="text-sm text-white/60 mb-6">
        Block date ranges from booking (holidays, maintenance days, etc.).
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Add closed date range</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">From</label>
            <input
              type="date"
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[oklch(0.10_0.04_270)] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">To</label>
            <input
              type="date"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[oklch(0.10_0.04_270)] px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Christmas break"
              className="w-full rounded-lg border border-white/10 bg-[oklch(0.10_0.04_270)] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={saving || !startsOn || !endsOn}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[oklch(0.55_0.22_270)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-white/60">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/40">No closed dates configured.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{r.starts_on}</td>
                  <td className="px-4 py-3 text-white">{r.ends_on}</td>
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