import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cms/content")({
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

  const byKey = useMemo(() => {
    const m: Record<string, Record<string, any>> = {};
    rows.forEach((r) => { m[r.section_key] = (r.data as any) ?? {}; });
    return m;
  }, [rows]);

  const sectionKeys = Object.keys(SECTION_LABELS).filter((k) => byKey[k]);
  const [activeSection, setActiveSection] = useState<string>("home");
  useEffect(() => { if (!byKey[activeSection] && sectionKeys.length) setActiveSection(sectionKeys[0]); }, [byKey, activeSection, sectionKeys]);

  const [drafts, setDrafts] = useState<Record<string, Record<string, any>>>({});
  useEffect(() => setDrafts({}), [rows.length]);

  const current = { ...(byKey[activeSection] ?? {}), ...(drafts[activeSection] ?? {}) };
  const isDirty = !!drafts[activeSection];

  function setField(field: string, value: any) {
    setDrafts((d) => ({ ...d, [activeSection]: { ...(d[activeSection] ?? byKey[activeSection] ?? {}), [field]: value } }));
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { ...(byKey[activeSection] ?? {}), ...(drafts[activeSection] ?? {}) };
      const { error } = await supabase.from("site_content").update({ data: payload }).eq("section_key", activeSection);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${SECTION_LABELS[activeSection]} saved`);
      setDrafts((d) => { const c = { ...d }; delete c[activeSection]; return c; });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-52 shrink-0 border-r border-white/10 bg-black/20 p-4 space-y-1">
        <p className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-white/30">Sections</p>
        {sectionKeys.map((key) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
              activeSection === key ? "bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.75_0.18_270)]" : "text-white/40 hover:bg-white/5"
            }`}>
            <span>{SECTION_LABELS[key]}</span>
            {drafts[key] && <span className="h-2 w-2 rounded-full bg-amber-400" />}
          </button>
        ))}
      </aside>

      <div className="flex-1 p-8 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">{SECTION_LABELS[activeSection] ?? activeSection}</h2>
            <p className="mt-0.5 text-xs text-white/40">{Object.keys(current).length} fields</p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" /> Unsaved
              </div>
            )}
            <button onClick={() => saveMut.mutate()} disabled={!isDirty || saveMut.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-40">
              <Save className="h-4 w-4" /> Save Section
            </button>
          </div>
        </div>

        {isLoading && <p className="text-white/50 text-sm">Loading…</p>}

        <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 backdrop-blur-sm overflow-hidden">
          {Object.entries(current).map(([field, value]) => {
            const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const isUrl = field.includes("url") || field.includes("image");
            const isMultiline = typeof value === "string" && (field.includes("desc") || field.includes("text") || field.includes("headline") || field.includes("address") || field.includes("bio") || value.length > 80);
            const str = typeof value === "string" ? value : JSON.stringify(value);
            return (
              <div key={field} className="px-6 grid grid-cols-[200px_1fr] gap-4 py-4">
                <div className="pt-2.5"><span className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span></div>
                <div className="space-y-2">
                  {isMultiline ? (
                    <textarea value={str} onChange={(e) => setField(field, e.target.value)} rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] resize-none" />
                  ) : (
                    <input type="text" value={str} onChange={(e) => setField(field, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)]" />
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
    </div>
  );
}