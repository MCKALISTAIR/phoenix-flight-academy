import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Plus, Clock, Plane, ChevronRight, UserPlus2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { listStudents, listEligibleStudentUsers, createStudent } from "@/lib/students.functions";

export const Route = createFileRoute("/cms/students")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: StudentsList,
});

function fmtHours(min: number) {
  if (!min) return "0:00";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function StudentsList() {
  const list = useServerFn(listStudents);
  const eligible = useServerFn(listEligibleStudentUsers);
  const create = useServerFn(createStudent);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => list(),
  });

  const [showAdd, setShowAdd] = useState(false);
  const { data: elig } = useQuery({
    queryKey: ["eligible-students"],
    queryFn: () => eligible(),
    enabled: showAdd,
  });

  const [userId, setUserId] = useState("");
  const [license, setLicense] = useState<"PPL" | "LAPL" | "NPPL" | "CPL" | "IR" | "Other">("PPL");
  const [startDate, setStartDate] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          user_id: userId,
          license_sought: license,
          start_date: startDate || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["eligible-students"] });
      setShowAdd(false);
      setUserId("");
      setStartDate("");
    },
  });

  const students = data?.students ?? [];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Students &amp; Logbook
          </h2>
          <p className="mt-1 text-xs text-white/40">
            UK CAA-aligned digital logbook and syllabus tracking for every student under training.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:scale-[1.02] hover:bg-primary"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-white/40 text-sm">Loading students…</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">
            No students yet. Click <span className="text-white">Add Student</span> to enrol the
            first one.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {students.map((s) => (
              <Link
                key={s.id}
                to="/cms/students/$studentId"
                params={{ studentId: s.id }}
                className="flex items-center gap-5 px-6 py-4 transition-colors hover:bg-white/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/20">
                  {(s.display_name ?? "?")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {s.display_name ?? "Unnamed student"}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5 flex items-center gap-3">
                    <span>{s.license_sought}</span>
                    {s.start_date && <span>· Started {s.start_date}</span>}
                    <span className="capitalize">· {s.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-right">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-white/40" />
                      {fmtHours(s.total_minutes)}
                    </div>
                    <div className="text-white/40 mt-0.5">total time</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Plane className="h-3 w-3 text-white/40" />
                      {s.flights_count}
                    </div>
                    <div className="text-white/40 mt-0.5">flights</div>
                  </div>
                  <div className="text-right w-24">
                    <div className="text-white/70 font-semibold">{s.last_flight_date ?? "—"}</div>
                    <div className="text-white/40 mt-0.5">last flight</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface-navy shadow-2xl">
            <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus2 className="h-4 w-4" />
                  Enrol Student
                </h3>
                <p className="mt-0.5 text-xs text-white/40">
                  Pick a registered user and set up their training record.
                </p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-white/30 hover:text-white/60 text-xl"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!userId) return;
                createMut.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  User
                </label>
                <select
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary"
                >
                  <option value="">Choose a user…</option>
                  {(elig?.users ?? []).map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.display_name ?? u.user_id}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/30">
                  Don't see them? They must register an account first.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                    License
                  </label>
                  <select
                    value={license}
                    onChange={(e) => setLicense(e.target.value as typeof license)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  >
                    {["PPL", "LAPL", "NPPL", "CPL", "IR", "Other"].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>
              {createMut.error && (
                <div className="text-xs text-red-400">{(createMut.error as Error).message}</div>
              )}
              <button
                type="submit"
                disabled={createMut.isPending || !userId}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary disabled:opacity-50"
              >
                {createMut.isPending ? "Enrolling…" : "Enrol Student"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
