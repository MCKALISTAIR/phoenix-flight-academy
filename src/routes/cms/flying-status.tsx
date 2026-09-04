import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CloudSun, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/flying-status")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: FlyingStatusPage,
  head: () => ({ meta: [{ title: "Airfield Status | CMS" }] }),
});

function FlyingStatusPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("flying_status")
        .select("id,is_open,message")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setRowId(data.id);
        setIsOpen(data.is_open);
        setMessage(data.message ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      if (rowId) {
        const { error } = await supabase
          .from("flying_status")
          .update({ is_open: isOpen, message: message || null })
          .eq("id", rowId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("flying_status")
          .insert({ is_open: isOpen, message: message || null, organization_id: DEFAULT_ORG_ID })
          .select("id")
          .single();
        if (error) throw error;
        setRowId(data.id);
      }
      setFeedback({ kind: "ok", text: "Airfield status saved." });
    } catch (e) {
      setFeedback({ kind: "err", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12 text-white/60">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <CloudSun className="h-6 w-6 text-white/80" />
        <h1 className="text-2xl font-bold text-white">Airfield Status</h1>
      </div>
      <p className="text-sm text-white/60 mb-6">
        Controls the operational banner shown on the public site and login portal.
      </p>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-white">Airfield is open for flying</span>
        </label>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="e.g. Closed today due to low cloud base."
            className="w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>

        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
              feedback.kind === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save status
        </button>
      </div>
    </div>
  );
}
