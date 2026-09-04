import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, Clock, BadgeCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import {
  listPilotVerifications,
  reviewPilotVerification,
  createSignedDocumentUrl,
} from "@/lib/customer-tier.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cms/pilot-verifications")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: PilotVerificationsAdmin,
});

type StatusFilter = "pending" | "approved" | "rejected" | "withdrawn" | "all";

function PilotVerificationsAdmin() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listPilotVerifications);
  const reviewFn = useServerFn(reviewPilotVerification);
  const signFn = useServerFn(createSignedDocumentUrl);

  const [status, setStatus] = useState<StatusFilter>("pending");
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  const { data: rows } = useQuery({
    queryKey: ["cms", "pilot-verifications", status],
    queryFn: () => fetchList({ data: { status } }),
  });

  const { data: profiles } = useQuery({
    queryKey: ["all-profiles-min"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name");
      return data ?? [];
    },
  });
  const nameFor = (id: string) =>
    profiles?.find((p) => p.user_id === id)?.display_name ?? id.slice(0, 8);

  const reviewMut = useMutation({
    mutationFn: reviewFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "pilot-verifications"] }),
  });

  async function openDoc(path: string) {
    const { url } = await signFn({ data: { path } });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "withdrawn", label: "Withdrawn" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Pilot Verifications</h1>
        <p className="mt-1 text-sm text-white/50">
          Review licence submissions. Approving promotes a customer to{" "}
          <span className="font-semibold">pilot</span> and grants self-hire.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatus(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === t.id
                ? "bg-primary text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(rows ?? []).map((r) => (
          <article key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">{nameFor(r.user_id)}</h3>
                <p className="text-xs text-white/40">
                  Submitted {new Date(r.submitted_at).toLocaleString("en-GB")}
                </p>
              </div>
              <StatusPill status={r.status} />
            </header>

            <dl className="mt-4 grid gap-3 text-sm text-white sm:grid-cols-2 lg:grid-cols-4">
              <Cell label="Licence number">
                <span className="font-mono">{r.licence_number}</span>
              </Cell>
              <Cell label="Issuing authority">{r.issuing_authority}</Cell>
              <Cell label="Licence expiry">
                {r.licence_expiry ? new Date(r.licence_expiry).toLocaleDateString("en-GB") : "—"}
              </Cell>
              <Cell label="Medical expiry">
                {r.medical_expiry ? new Date(r.medical_expiry).toLocaleDateString("en-GB") : "—"}
              </Cell>
              {r.ratings && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <Cell label="Ratings">{r.ratings}</Cell>
                </div>
              )}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {r.document_path && (
                <DocButton onClick={() => openDoc(r.document_path!)}>Licence document</DocButton>
              )}
              {r.medical_document_path && (
                <DocButton onClick={() => openDoc(r.medical_document_path!)}>
                  Medical document
                </DocButton>
              )}
            </div>

            {r.status === "pending" ? (
              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <input
                  placeholder="Review notes (optional, shown to applicant on rejection)"
                  value={notesById[r.id] ?? ""}
                  onChange={(e) => setNotesById((m) => ({ ...m, [r.id]: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
                  maxLength={1000}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      reviewMut.mutate({
                        data: { id: r.id, decision: "approved", notes: notesById[r.id] || null },
                      })
                    }
                    disabled={reviewMut.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & grant self-hire
                  </button>
                  <button
                    onClick={() => {
                      if (!notesById[r.id]?.trim() && !window.confirm("Reject without notes?"))
                        return;
                      reviewMut.mutate({
                        data: { id: r.id, decision: "rejected", notes: notesById[r.id] || null },
                      });
                    }}
                    disabled={reviewMut.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3.5 py-2 text-sm font-bold text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
                {r.reviewed_at && <>Reviewed {new Date(r.reviewed_at).toLocaleString("en-GB")} </>}
                {r.review_notes && <>· "{r.review_notes}"</>}
              </div>
            )}
          </article>
        ))}

        {(rows ?? []).length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
            No requests with status "{status}".
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function DocButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
    >
      <ExternalLink className="h-3 w-3" /> {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: typeof Clock; label: string }> = {
    pending: { cls: "bg-amber-500/15 text-amber-300", Icon: Clock, label: "Pending" },
    approved: { cls: "bg-emerald-500/15 text-emerald-300", Icon: BadgeCheck, label: "Approved" },
    rejected: { cls: "bg-red-500/15 text-red-300", Icon: XCircle, label: "Rejected" },
    withdrawn: { cls: "bg-white/10 text-white/60", Icon: XCircle, label: "Withdrawn" },
  };
  const m = map[status] ?? map.withdrawn;
  const Icon = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${m.cls}`}
    >
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}
