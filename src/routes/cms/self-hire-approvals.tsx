import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, XCircle, CheckCircle2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { listSelfHireApprovals, approveSelfHire, revokeSelfHire } from "@/lib/self-hire.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cms/self-hire-approvals")({
  beforeLoad: async ({ location }) => {
    try { await requireSuperAdmin(location.href); } catch (e) { if (isRedirect(e)) throw e; throw redirect({ to: "/login", search: { redirect: location.href } }); }
  },
  component: SelfHireAdmin,
});

function SelfHireAdmin() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listSelfHireApprovals);
  const approve = useServerFn(approveSelfHire);
  const revoke = useServerFn(revokeSelfHire);

  const { data: approvals } = useQuery({ queryKey: ["self-hire-approvals"], queryFn: () => fetchList() });
  const { data: profiles } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name").order("display_name");
      return data ?? [];
    },
  });

  const approveMut = useMutation({ mutationFn: approve, onSuccess: () => qc.invalidateQueries({ queryKey: ["self-hire-approvals"] }) });
  const revokeMut = useMutation({ mutationFn: revoke, onSuccess: () => qc.invalidateQueries({ queryKey: ["self-hire-approvals"] }) });

  const [pickUser, setPickUser] = useState("");
  const [expires, setExpires] = useState("");
  const [notes, setNotes] = useState("");

  const nameFor = (id: string) => profiles?.find((p) => p.user_id === id)?.display_name ?? id.slice(0, 8);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Self-Hire Approvals</h1>
        <p className="mt-1 text-sm text-white/50">Approve pilots who can book aircraft for self-hire.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white">Approve a pilot</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <select value={pickUser} onChange={(e) => setPickUser(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
            <option value="">Select user…</option>
            {(profiles ?? []).map((p) => (
              <option key={p.user_id} value={p.user_id}>{p.display_name ?? p.user_id}</option>
            ))}
          </select>
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} placeholder="Expires (optional)" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
          <button
            onClick={() => {
              if (!pickUser) return;
              approveMut.mutate({
                data: {
                  user_id: pickUser,
                  expires_at: expires ? new Date(`${expires}T23:59:59Z`).toISOString() : null,
                  notes: notes || null,
                },
              });
              setPickUser(""); setExpires(""); setNotes("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Approve
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Pilot</th>
              <th className="px-4 py-3">Approved</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(approvals ?? []).map((a) => {
              const active = !a.revoked_at && (!a.expires_at || new Date(a.expires_at) > new Date());
              return (
                <tr key={a.id} className="border-b border-white/5 text-white">
                  <td className="px-4 py-3 font-semibold">{nameFor(a.user_id)}</td>
                  <td className="px-4 py-3 text-white/70">{new Date(a.approved_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-white/70">{a.expires_at ? new Date(a.expires_at).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="px-4 py-3">
                    {active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                        <XCircle className="h-3 w-3" /> Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {active && (
                      <button
                        onClick={() => { if (window.confirm("Revoke self-hire approval?")) revokeMut.mutate({ data: { user_id: a.user_id } }); }}
                        className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {(approvals ?? []).length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-white/40">No self-hire approvals yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}