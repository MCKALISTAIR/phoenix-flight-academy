import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ORG_ID } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import { requireSuperAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/team")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: TeamEditor,
});

type InstructorRow = Database["public"]["Tables"]["instructors"]["Row"];

function TeamEditor() {
  const qc = useQueryClient();
  const { data: team = [], isLoading } = useQuery({
    queryKey: ["instructors", "cms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instructors").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const [drafts, setDrafts] = useState<Record<string, Partial<InstructorRow>>>({});
  useEffect(() => setDrafts({}), [team.length]);

  const merged = team.map((i) => ({ ...i, ...(drafts[i.id] ?? {}) }));

  function update(id: string, field: keyof InstructorRow, value: any) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  const saveMut = useMutation({
    mutationFn: async (row: InstructorRow) => {
      const { id, created_at, updated_at, ...patch } = row;
      const { error } = await supabase.from("instructors").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, row) => {
      toast.success(`${row.name} saved`);
      setDrafts((d) => {
        const c = { ...d };
        delete c[row.id];
        return c;
      });
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instructors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("instructors").insert({
        name: "New Instructor",
        role: "Flight Instructor",
        display_order: team.length,
        organization_id: DEFAULT_ORG_ID,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Instructor added");
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Insert failed"),
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Team & Instructors</h2>
          <p className="mt-1 text-xs text-white/40">Live data from Lovable Cloud.</p>
        </div>
        <button
          onClick={() => addMut.mutate()}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Add Instructor
        </button>
      </div>

      {isLoading && <p className="text-white/50 text-sm">Loading…</p>}

      <div className="space-y-6">
        {merged.map((ins) => {
          const isDirty = !!drafts[ins.id];
          return (
            <div
              key={ins.id}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-white/3 px-6 py-4">
                <div className="flex items-center gap-3">
                  {ins.image_url ? (
                    <img
                      src={ins.image_url}
                      alt={ins.name}
                      className="h-9 w-9 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold text-white">
                      {ins.name || "New Instructor"}
                    </span>
                    <span className="block text-xs text-white/40">{ins.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && <span className="text-[10px] text-amber-400 font-bold">Unsaved</span>}
                  <button
                    onClick={() => saveMut.mutate(ins)}
                    disabled={!isDirty || saveMut.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                  >
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${ins.name}?`)) delMut.mutate(ins.id);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 gap-5">
                {(
                  [
                    ["name", "Full Name"],
                    ["role", "Role / Title"],
                    ["hours", "Hours Badge"],
                    ["image_url", "Photo URL"],
                  ] as const
                ).map(([f, label]) => (
                  <div key={f} className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={(ins as any)[f] ?? ""}
                      onChange={(e) => update(ins.id, f, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={ins.bio ?? ""}
                    onChange={(e) => update(ins.id, "bio", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between pt-2 border-t border-white/5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Published
                  </label>
                  <button
                    onClick={() => update(ins.id, "published", !ins.published)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${ins.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}
                  >
                    {ins.published ? "Live on /about" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
