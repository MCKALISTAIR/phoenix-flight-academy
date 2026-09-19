import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link2, Link2Off, Loader2, User } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { InstructorScheduleEditor } from "@/components/InstructorScheduleEditor";
import {
  listInstructorAccounts,
  linkInstructorAccount,
} from "@/lib/instructor-schedule.functions";

export const Route = createFileRoute("/cms/instructor-hours")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: InstructorHoursPage,
  head: () => ({
    meta: [
      { title: "Instructor Hours | Phoenix Flight Training" },
      {
        name: "description",
        content: "Set each instructor's weekly availability, time off and portal access.",
      },
    ],
  }),
});

function InstructorHoursPage() {
  const qc = useQueryClient();
  const fetchAccounts = useServerFn(listInstructorAccounts);
  const linkAccount = useServerFn(linkInstructorAccount);

  const accountsQ = useQuery({
    queryKey: ["instructor-accounts"],
    queryFn: () => fetchAccounts(),
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState("");

  const instructors = accountsQ.data ?? [];
  const active = instructors.find((i) => i.id === (selected ?? instructors[0]?.id));

  const linkMut = useMutation({
    mutationFn: (vars: { instructorId: string; email: string | null }) =>
      linkAccount({ data: vars }),
    onSuccess: (_r, vars) => {
      toast.success(vars.email ? `Linked to ${vars.email}` : "Account unlinked");
      setEmailDraft("");
      qc.invalidateQueries({ queryKey: ["instructor-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not link that account"),
  });

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-xl font-extrabold text-white">Instructor Hours</h2>
        <p className="mt-1 text-xs text-white/40">
          Full visibility of when every instructor is available. Instructors can edit their own
          hours once their profile is linked to a login.
        </p>
      </div>

      {accountsQ.isLoading && (
        <p className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading instructors…
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {instructors.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setSelected(i.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
              active?.id === i.id
                ? "border-primary bg-primary/10 text-white ring-1 ring-primary/30"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
            }`}
          >
            <User className="h-4 w-4" />
            <span className="font-semibold">{i.name}</span>
            {i.user_id ? (
              <Link2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Link2Off className="h-3.5 w-3.5 text-white/30" />
            )}
          </button>
        ))}
      </div>

      {active && (
        <>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-bold text-white">Portal access</h3>
            {active.email ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm text-white/70">
                  Linked to <span className="font-semibold text-white">{active.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => linkMut.mutate({ instructorId: active.id, email: null })}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:border-destructive/40 hover:text-destructive"
                >
                  Unlink
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-white/50">
                  Account email
                  <input
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="instructor@example.com"
                    className="w-72 rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder:text-white/30"
                  />
                </label>
                <button
                  type="button"
                  disabled={!emailDraft || linkMut.isPending}
                  onClick={() =>
                    linkMut.mutate({ instructorId: active.id, email: emailDraft.trim() })
                  }
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Link account
                </button>
                <p className="text-xs text-white/40">
                  They need to have signed up already — linking also gives them instructor access.
                </p>
              </div>
            )}
          </section>

          <InstructorScheduleEditor instructorId={active.id} instructorName={active.name} />
        </>
      )}
    </div>
  );
}
