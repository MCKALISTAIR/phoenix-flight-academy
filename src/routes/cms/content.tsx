import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, AlertCircle, History, RotateCcw, X, Send, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requireSuperAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/content")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ContentEditor,
});

const SECTION_LABELS: Record<string, string> = {
  home: "Home Page",
  about: "About / Values",
  pricing: "Pricing & Rates",
  experience: "Experience Packages",
  contact: "Contact Details",
};

function ContentEditor() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["site_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      return data;
    },
  });

  const published = useMemo(() => {
    const m: Record<string, Record<string, any>> = {};
    rows.forEach((r: any) => { m[r.section_key] = (r.data as any) ?? {}; });
    return m;
  }, [rows]);
  const storedDrafts = useMemo(() => {
    const m: Record<string, Record<string, any> | null> = {};
    rows.forEach((r: any) => { m[r.section_key] = (r.draft_data as any) ?? null; });
    return m;
  }, [rows]);

  const sectionKeys = Object.keys(SECTION_LABELS).filter((k) => published[k]);
  const [activeSection, setActiveSection] = useState<string>("home");
  useEffect(() => {
    if (!published[activeSection] && sectionKeys.length) setActiveSection(sectionKeys[0]);
  }, [published, activeSection, sectionKeys]);

  const [localEdits, setLocalEdits] = useState<Record<string, Record<string, any>>>({});
  useEffect(() => setLocalEdits({}), [rows.length]);

  const pub = published[activeSection] ?? {};
  const storedDraft = storedDrafts[activeSection] ?? null;
  const draftBase = storedDraft ?? pub;
  const working = { ...draftBase, ...(localEdits[activeSection] ?? {}) };

  const hasLocalEdits = !!localEdits[activeSection];
  const hasStoredDraft = !!storedDraft && JSON.stringify(storedDraft) !== JSON.stringify(pub);
  const draftDiffersFromPublished = JSON.stringify(working) !== JSON.stringify(pub);

  const [viewMode, setViewMode] = useState<"draft" | "published">("draft");
  const display = viewMode === "published" ? pub : working;
  const readOnly = viewMode === "published";

  function setField(field: string, value: any) {
    setLocalEdits((d) => ({
      ...d,
      [activeSection]: { ...(d[activeSection] ?? draftBase ?? {}), [field]: value },
    }));
  }
  function clearLocal() {
    setLocalEdits((d) => { const c = { ...d }; delete c[activeSection]; return c; });
  }

  const saveDraftMut = useMutation({
    mutationFn: async () => {
      const payload = { ...draftBase, ...(localEdits[activeSection] ?? {}) };
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("site_content")
        .update({
          draft_data: payload,
          draft_updated_at: new Date().toISOString(),
          draft_updated_by: userData.user?.id ?? null,
        })
        .eq("section_key", activeSection);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft saved");
      clearLocal();
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const publishMut = useMutation({
    mutationFn: async () => {
      const payload = { ...draftBase, ...(localEdits[activeSection] ?? {}) };
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("site_content")
        .update({
          data: payload,
          draft_data: null,
          draft_updated_at: null,
          draft_updated_by: null,
          updated_by: userData.user?.id ?? null,
        })
        .eq("section_key", activeSection);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${SECTION_LABELS[activeSection]} published`);
      clearLocal();
      qc.invalidateQueries({ queryKey: ["site_content"] });
      qc.invalidateQueries({ queryKey: ["site_content_revisions"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Publish failed"),
  });

  const discardDraftMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_content")
        .update({ draft_data: null, draft_updated_at: null, draft_updated_by: null })
        .eq("section_key", activeSection);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft discarded");
      clearLocal();
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Discard failed"),
  });

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-52 shrink-0 border-r border-white/10 bg-black/20 p-4 space-y-1">
        <p className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-white/30">Sections</p>
        {sectionKeys.map((key) => {
          const hasDraft = !!storedDrafts[key] && JSON.stringify(storedDrafts[key]) !== JSON.stringify(published[key] ?? {});
          const hasLocal = !!localEdits[key];
          return (
            <button key={key} onClick={() => setActiveSection(key)}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                activeSection === key ? "bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.75_0.18_270)]" : "text-white/40 hover:bg-white/5"
              }`}>
              <span>{SECTION_LABELS[key]}</span>
              <span className="flex items-center gap-1">
                {hasDraft && <span title="Has draft" className="h-2 w-2 rounded-full bg-sky-400" />}
                {hasLocal && <span title="Unsaved edits" className="h-2 w-2 rounded-full bg-amber-400" />}
              </span>
            </button>
          );
        })}
      </aside>

      <div className="flex-1 p-8 space-y-6 overflow-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white">{SECTION_LABELS[activeSection] ?? activeSection}</h2>
            <p className="mt-0.5 text-xs text-white/40">
              {Object.keys(display).length} fields · {viewMode === "published"
                ? "Showing live version"
                : (hasStoredDraft || hasLocalEdits ? "Editing draft" : "In sync with live")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasLocalEdits ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" /> Unsaved
              </div>
            ) : hasStoredDraft ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300">
                <AlertCircle className="h-3.5 w-3.5" /> Draft pending
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Live
              </div>
            )}

            <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs font-semibold">
              <button onClick={() => setViewMode("draft")}
                className={`rounded-lg px-3 py-1.5 ${viewMode === "draft" ? "bg-white/10 text-white" : "text-white/50"}`}>
                Draft
              </button>
              <button onClick={() => setViewMode("published")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${viewMode === "published" ? "bg-white/10 text-white" : "text-white/50"}`}>
                <Eye className="h-3.5 w-3.5" /> Live
              </button>
            </div>

            <button onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">
              <History className="h-4 w-4" /> History
            </button>

            {hasStoredDraft && !hasLocalEdits && (
              <button onClick={() => { if (confirm("Discard the pending draft? Staged edits will be lost.")) discardDraftMut.mutate(); }}
                disabled={discardDraftMut.isPending}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40">
                <Trash2 className="h-4 w-4" /> Discard
              </button>
            )}

            <button onClick={() => saveDraftMut.mutate()} disabled={!hasLocalEdits || saveDraftMut.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-40">
              <Save className="h-4 w-4" /> Save Draft
            </button>

            <button onClick={() => { if (confirm("Publish this draft to the live site?")) publishMut.mutate(); }}
              disabled={!draftDiffersFromPublished || publishMut.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-40">
              <Send className="h-4 w-4" /> Publish
            </button>
          </div>
        </div>

        {isLoading && <p className="text-white/50 text-sm">Loading…</p>}

        <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 backdrop-blur-sm overflow-hidden">
          {Object.entries(display).map(([field, value]) => {
            const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const isUrl = field.includes("url") || field.includes("image");
            const isMultiline =
              typeof value === "string" &&
              (field.includes("desc") || field.includes("text") || field.includes("headline") ||
                field.includes("address") || field.includes("bio") || value.length > 80);
            const str = typeof value === "string" ? value : JSON.stringify(value);
            const pubStr = typeof pub[field] === "string" ? pub[field] : JSON.stringify(pub[field]);
            const changed = viewMode === "draft" && pubStr !== str;
            return (
              <div key={field} className={`px-6 grid grid-cols-[200px_1fr] gap-4 py-4 ${changed ? "bg-amber-500/5" : ""}`}>
                <div className="pt-2.5 flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
                  {changed && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Changed</span>}
                </div>
                <div className="space-y-2">
                  {isMultiline ? (
                    <textarea value={str} onChange={(e) => setField(field, e.target.value)} rows={3} readOnly={readOnly}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] resize-none" />
                  ) : (
                    <input type="text" value={str} onChange={(e) => setField(field, e.target.value)} readOnly={readOnly}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)]" />
                  )}
                  {changed && (
                    <div className="text-[10px] text-white/40">
                      Live: <span className="text-white/60 font-mono break-all">{pubStr}</span>
                    </div>
                  )}
                  {isUrl && str && (
                    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                      <img src={str} alt="" className="h-16 w-24 rounded-lg object-cover border border-white/10" />
                      <span className="text-xs text-white/30 break-all font-mono">{str}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {historyOpen && (
        <HistoryDrawer
          sectionKey={activeSection}
          sectionLabel={SECTION_LABELS[activeSection] ?? activeSection}
          currentData={pub}
          onClose={() => setHistoryOpen(false)}
          onRestored={() => {
            clearLocal();
            qc.invalidateQueries({ queryKey: ["site_content"] });
            qc.invalidateQueries({ queryKey: ["site_content_revisions"] });
          }}
        />
      )}
    </div>
  );
}

function HistoryDrawer({
  sectionKey,
  sectionLabel,
  currentData,
  onClose,
  onRestored,
}: {
  sectionKey: string;
  sectionLabel: string;
  currentData: Record<string, any>;
  onClose: () => void;
  onRestored: () => void;
}) {
  const { data: revisions = [], isLoading } = useQuery({
    queryKey: ["site_content_revisions", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content_revisions")
        .select("*")
        .eq("section_key", sectionKey)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = revisions.find((r: any) => r.id === selectedId) ?? revisions[0];

  const restoreMut = useMutation({
    mutationFn: async (data: any) => {
      // Restore into the draft buffer rather than publishing directly,
      // so the admin can review before going live.
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("site_content")
        .update({
          draft_data: data,
          draft_updated_at: new Date().toISOString(),
          draft_updated_by: userData.user?.id ?? null,
        })
        .eq("section_key", sectionKey);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Revision restored into draft. Review and publish when ready.");
      onRestored();
      onClose();
    },
    onError: (e: any) => toast.error(e.message ?? "Restore failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl h-full bg-[oklch(0.18_0.02_270)] border-l border-white/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-white">Version History</h3>
            <p className="text-xs text-white/40">{sectionLabel}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-white/60 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 shrink-0 overflow-auto border-r border-white/10">
            {isLoading && <p className="p-4 text-xs text-white/40">Loading…</p>}
            {!isLoading && revisions.length === 0 && (
              <p className="p-4 text-xs text-white/40">No previous versions yet. Publishes from now on will appear here.</p>
            )}
            {revisions.map((r: any) => {
              const active = (selected?.id ?? null) === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full border-b border-white/5 px-4 py-3 text-left text-xs transition-colors ${
                    active ? "bg-[oklch(0.55_0.22_270)]/20 text-white" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  <div className="font-semibold text-white/90">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/40 font-mono truncate">
                    {r.updated_by ? r.updated_by.slice(0, 8) : "system"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <div className="text-xs text-white/50">
                    Snapshot from {new Date(selected.created_at).toLocaleString()}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Restore this version into the draft buffer?")) {
                        restoreMut.mutate(selected.data);
                      }
                    }}
                    disabled={restoreMut.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-[oklch(0.55_0.22_270)] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore to draft
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-5 space-y-2">
                  {Object.entries(selected.data as Record<string, any>).map(([field, value]) => {
                    const currStr = typeof currentData[field] === "string" ? currentData[field] : JSON.stringify(currentData[field]);
                    const valStr = typeof value === "string" ? value : JSON.stringify(value);
                    const changed = currStr !== valStr;
                    return (
                      <div key={field} className={`rounded-lg border p-3 ${changed ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/5"}`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{field}</div>
                        <div className="mt-1 text-sm text-white whitespace-pre-wrap break-words">{valStr}</div>
                        {changed && (
                          <div className="mt-1 text-[10px] text-amber-300/70">Live: {currStr}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-white/40">
                Select a revision to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
