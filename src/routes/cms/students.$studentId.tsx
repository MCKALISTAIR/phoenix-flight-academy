import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Plus,
  Clock,
  Plane,
  FileBadge,
  ShieldCheck,
  BookOpen,
  ListChecks,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { getStudent, updateStudent } from "@/lib/students.functions";
import {
  listSyllabus,
  listAircraftLite,
  createFlightLogEntry,
  deleteFlightLogEntry,
  upsertStudentDocument,
  deleteStudentDocument,
  createEndorsement,
  deleteEndorsement,
  upsertTheoryResult,
  deleteTheoryResult,
  PPL_THEORY_SUBJECTS,
} from "@/lib/flight-log.functions";

export const Route = createFileRoute("/cms/students/$studentId")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: StudentDetail,
});

type TabKey = "overview" | "flights" | "syllabus" | "documents" | "endorsements" | "theory";

function fmtHours(min: number) {
  if (!min) return "0:00";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function daysUntil(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

function ExpiryPill({ days }: { days: number | null }) {
  if (days === null) return <span className="text-white/30 text-xs">—</span>;
  if (days < 0)
    return (
      <span className="rounded-md bg-red-500/15 text-red-400 px-2 py-0.5 text-xs font-bold">
        Expired
      </span>
    );
  if (days <= 30)
    return (
      <span className="rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5 text-xs font-bold">
        {days}d left
      </span>
    );
  if (days <= 90)
    return (
      <span className="rounded-md bg-yellow-500/10 text-yellow-300 px-2 py-0.5 text-xs font-medium">
        {days}d
      </span>
    );
  return (
    <span className="rounded-md bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-xs font-medium">
      {days}d
    </span>
  );
}

function StudentDetail() {
  const { studentId } = Route.useParams();
  const get = useServerFn(getStudent);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => get({ data: { id: studentId } }),
  });

  const [tab, setTab] = useState<TabKey>("overview");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["student", studentId] });

  if (isLoading || !data) {
    return <div className="p-10 text-white/40 text-sm">Loading…</div>;
  }

  const { student, profile, flights, flightExercises, documents, endorsements, theory } = data;
  const totalMin = flights.reduce((acc, f) => acc + (f.total_minutes ?? 0), 0);
  const dualMin = flights.reduce((acc, f) => acc + (f.dual_received_minutes ?? 0), 0);
  const picMin = flights.reduce(
    (acc, f) => acc + (f.capacity === "pic" ? f.total_minutes ?? 0 : 0),
    0,
  );
  const nightMin = flights.reduce((acc, f) => acc + (f.night_minutes ?? 0), 0);
  const xcMin = 0; // placeholder; not tracked separately yet
  const landings = flights.reduce(
    (acc, f) => acc + (f.landings_day ?? 0) + (f.landings_night ?? 0),
    0,
  );

  const tabs: { key: TabKey; label: string; icon: typeof Clock }[] = [
    { key: "overview", label: "Overview", icon: ListChecks },
    { key: "flights", label: "Flight Log", icon: Plane },
    { key: "syllabus", label: "Syllabus", icon: BookOpen },
    { key: "documents", label: "Documents", icon: FileBadge },
    { key: "endorsements", label: "Endorsements", icon: ShieldCheck },
    { key: "theory", label: "Theory", icon: BookOpen },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/cms/students"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {profile?.display_name ?? "Unnamed student"}
            </h2>
            <div className="text-xs text-white/40 mt-0.5 flex items-center gap-3">
              <span>{student.license_sought}</span>
              <span>· {student.status}</span>
              {student.start_date && <span>· Started {student.start_date}</span>}
              {profile?.phone && <span>· {profile.phone}</span>}
            </div>
          </div>
        </div>
        <StatusEditor
          studentId={student.id}
          status={student.status}
          onSaved={invalidate}
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-3">
        <SummaryCard label="Total time" value={fmtHours(totalMin)} hint={`${flights.length} flights`} />
        <SummaryCard label="Dual received" value={fmtHours(dualMin)} />
        <SummaryCard label="PIC time" value={fmtHours(picMin)} />
        <SummaryCard label="Night" value={fmtHours(nightMin)} />
        <SummaryCard label="Landings" value={landings.toString()} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                active
                  ? "border-[oklch(0.70_0.18_270)] text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && (
        <OverviewTab
          flights={flights}
          flightExercises={flightExercises}
          documents={documents}
          endorsements={endorsements}
        />
      )}
      {tab === "flights" && (
        <FlightsTab
          studentId={student.id}
          flights={flights}
          flightExercises={flightExercises}
          onChange={invalidate}
        />
      )}
      {tab === "syllabus" && (
        <SyllabusTab flights={flights} flightExercises={flightExercises} />
      )}
      {tab === "documents" && (
        <DocumentsTab
          studentId={student.id}
          documents={documents}
          onChange={invalidate}
        />
      )}
      {tab === "endorsements" && (
        <EndorsementsTab
          studentId={student.id}
          endorsements={endorsements}
          onChange={invalidate}
        />
      )}
      {tab === "theory" && (
        <TheoryTab
          studentId={student.id}
          theory={theory}
          onChange={invalidate}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
      {hint && <div className="text-[10px] text-white/30 mt-0.5">{hint}</div>}
    </div>
  );
}

function StatusEditor({
  studentId,
  status,
  onSaved,
}: {
  studentId: string;
  status: string;
  onSaved: () => void;
}) {
  const update = useServerFn(updateStudent);
  const mut = useMutation({
    mutationFn: (s: "active" | "paused" | "completed" | "withdrawn") =>
      update({ data: { id: studentId, status: s } }),
    onSuccess: onSaved,
  });
  return (
    <select
      value={status}
      onChange={(e) => mut.mutate(e.target.value as "active" | "paused" | "completed" | "withdrawn")}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
    >
      <option value="active">Active</option>
      <option value="paused">Paused</option>
      <option value="completed">Completed</option>
      <option value="withdrawn">Withdrawn</option>
    </select>
  );
}

/* ============ OVERVIEW ============ */
function OverviewTab({
  flights,
  flightExercises,
  documents,
  endorsements,
}: {
  flights: any[];
  flightExercises: any[];
  documents: any[];
  endorsements: any[];
}) {
  const lastFlight = flights[0];
  const alerts = documents
    .map((d) => ({ d, days: daysUntil(d.expires_on) }))
    .filter((x) => x.days !== null && x.days <= 60)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  const lastFlightExercises = lastFlight
    ? flightExercises.filter((e) => e.flight_log_entry_id === lastFlight.id)
    : [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-bold text-white mb-3">Last flight</h3>
        {!lastFlight ? (
          <p className="text-xs text-white/40">No flights logged yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Date</span>
              <span className="text-white font-semibold">{lastFlight.flight_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Aircraft</span>
              <span className="text-white">
                {lastFlight.aircraft_registration} ({lastFlight.aircraft_model})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Route</span>
              <span className="text-white">
                {lastFlight.departure_aerodrome} → {lastFlight.arrival_aerodrome}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Capacity</span>
              <span className="text-white uppercase">{lastFlight.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Total time</span>
              <span className="text-white font-bold">{fmtHours(lastFlight.total_minutes)}</span>
            </div>
            {lastFlight.remarks && (
              <div className="mt-3 rounded-lg bg-black/30 p-3 text-xs text-white/70 whitespace-pre-wrap">
                {lastFlight.remarks}
              </div>
            )}
            {lastFlightExercises.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lastFlightExercises.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-md bg-[oklch(0.55_0.22_270)]/15 text-[oklch(0.75_0.18_270)] px-2 py-0.5 text-xs"
                  >
                    Ex covered · {e.grade}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Expiry alerts
        </h3>
        {alerts.length === 0 ? (
          <p className="text-xs text-white/40">No documents expiring in the next 60 days.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map(({ d, days }) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-white/70 capitalize">
                  {d.document_type.replace(/_/g, " ")}
                </span>
                <ExpiryPill days={days} />
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-sm font-bold text-white mt-6 mb-3">Recent endorsements</h3>
        {endorsements.length === 0 ? (
          <p className="text-xs text-white/40">No endorsements yet.</p>
        ) : (
          <ul className="space-y-2">
            {endorsements.slice(0, 3).map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{e.title}</span>
                <span className="text-xs text-white/40">
                  {new Date(e.signed_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============ FLIGHTS ============ */
function FlightsTab({
  studentId,
  flights,
  flightExercises,
  onChange,
}: {
  studentId: string;
  flights: any[];
  flightExercises: any[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const del = useServerFn(deleteFlightLogEntry);
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: onChange,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-4 py-2 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)]"
        >
          <Plus className="h-4 w-4" /> Add Flight
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {flights.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">No flights logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">A/C</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Cap.</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Dual</th>
                  <th className="px-3 py-2 text-right">Night</th>
                  <th className="px-3 py-2 text-right">IFR</th>
                  <th className="px-3 py-2 text-right">Ldgs D/N</th>
                  <th className="px-3 py-2 text-left">PIC</th>
                  <th className="px-3 py-2 text-left">Remarks</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {flights.map((f) => {
                  const exs = flightExercises.filter((e) => e.flight_log_entry_id === f.id);
                  return (
                    <tr key={f.id} className="hover:bg-white/3">
                      <td className="px-3 py-2 font-mono">{f.flight_date}</td>
                      <td className="px-3 py-2">
                        <div className="font-semibold">{f.aircraft_registration}</div>
                        <div className="text-white/40">{f.aircraft_model}</div>
                      </td>
                      <td className="px-3 py-2">
                        {f.departure_aerodrome} → {f.arrival_aerodrome}
                      </td>
                      <td className="px-3 py-2 uppercase">{f.capacity}</td>
                      <td className="px-3 py-2 text-right font-bold">{fmtHours(f.total_minutes)}</td>
                      <td className="px-3 py-2 text-right">{fmtHours(f.dual_received_minutes)}</td>
                      <td className="px-3 py-2 text-right">{fmtHours(f.night_minutes)}</td>
                      <td className="px-3 py-2 text-right">{fmtHours(f.ifr_minutes)}</td>
                      <td className="px-3 py-2 text-right">
                        {f.landings_day}/{f.landings_night}
                      </td>
                      <td className="px-3 py-2">{f.pic_name}</td>
                      <td className="px-3 py-2 max-w-xs">
                        <div className="text-white/70 truncate" title={f.remarks ?? ""}>
                          {f.remarks ?? "—"}
                        </div>
                        {exs.length > 0 && (
                          <div className="mt-1 text-[10px] text-[oklch(0.75_0.18_270)]">
                            {exs.length} exercise{exs.length === 1 ? "" : "s"} covered
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => {
                            if (confirm("Delete this flight entry?")) delMut.mutate(f.id);
                          }}
                          className="text-white/30 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <AddFlightModal
          studentId={studentId}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function AddFlightModal({
  studentId,
  onClose,
  onSaved,
}: {
  studentId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const aircraftFn = useServerFn(listAircraftLite);
  const syllabusFn = useServerFn(listSyllabus);
  const createFn = useServerFn(createFlightLogEntry);

  const { data: acData } = useQuery({ queryKey: ["aircraft-lite"], queryFn: () => aircraftFn() });
  const { data: sylData } = useQuery({ queryKey: ["syllabus"], queryFn: () => syllabusFn() });

  const [aircraftId, setAircraftId] = useState("");
  const [flightDate, setFlightDate] = useState(new Date().toISOString().slice(0, 10));
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [off, setOff] = useState("");
  const [on, setOn] = useState("");
  const [picName, setPicName] = useState("");
  const [capacity, setCapacity] = useState<"dual" | "pic" | "put" | "picus" | "instructor" | "examiner">("dual");
  const [landingsDay, setLandingsDay] = useState(1);
  const [landingsNight, setLandingsNight] = useState(0);
  const [nightMin, setNightMin] = useState(0);
  const [ifrMin, setIfrMin] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    Record<string, "intro" | "practiced" | "competent" | "review">
  >({});

  const totalMin = useMemo(() => {
    if (!off || !on) return 0;
    const o = new Date(off).getTime();
    const n = new Date(on).getTime();
    if (!Number.isFinite(o) || !Number.isFinite(n) || n <= o) return 0;
    return Math.round((n - o) / 60000);
  }, [off, on]);

  const selectedAircraft = (acData?.aircraft ?? []).find((a) => a.id === aircraftId);

  const createMut = useMutation({
    mutationFn: () => {
      if (!selectedAircraft) throw new Error("Pick an aircraft");
      // Auto-derive function times from capacity (single-engine assumption; editable later)
      const dual_received_minutes = capacity === "dual" ? totalMin : 0;
      const instructor_given_minutes = capacity === "instructor" ? totalMin : 0;
      const single_pilot_se_minutes = capacity !== "examiner" ? totalMin : 0;
      return createFn({
        data: {
          student_id: studentId,
          aircraft_id: aircraftId,
          aircraft_registration: selectedAircraft.registration,
          aircraft_model: selectedAircraft.model,
          flight_date: flightDate,
          departure_aerodrome: dep.toUpperCase(),
          arrival_aerodrome: arr.toUpperCase(),
          off_blocks_at: new Date(off).toISOString(),
          on_blocks_at: new Date(on).toISOString(),
          pic_name: picName,
          capacity,
          landings_day: landingsDay,
          landings_night: landingsNight,
          night_minutes: nightMin,
          ifr_minutes: ifrMin,
          single_pilot_se_minutes,
          single_pilot_me_minutes: 0,
          multi_pilot_minutes: 0,
          dual_received_minutes,
          instructor_given_minutes,
          fstd_type: null,
          fstd_minutes: 0,
          remarks: remarks || null,
          exercises: Object.entries(selectedExercises).map(([exercise_id, grade]) => ({
            exercise_id,
            grade,
            notes: null,
          })),
        },
      });
    },
    onSuccess: onSaved,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[oklch(0.10_0.04_270)] shadow-2xl">
        <div className="sticky top-0 z-10 bg-[oklch(0.10_0.04_270)] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Log Flight (UK CAA)</h3>
            <p className="text-xs text-white/40">
              All fields below match the CAA pilot logbook record columns.
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xl">×</button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="p-6 space-y-5"
        >
          {/* Aircraft + date */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Aircraft">
              <select
                required
                value={aircraftId}
                onChange={(e) => setAircraftId(e.target.value)}
                className={inputCls}
              >
                <option value="">Choose…</option>
                {(acData?.aircraft ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.registration} — {a.model}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                required
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Aerodromes + times */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="From (ICAO)">
              <input
                required
                value={dep}
                onChange={(e) => setDep(e.target.value)}
                placeholder="EGBJ"
                className={inputCls + " uppercase"}
                maxLength={5}
              />
            </Field>
            <Field label="To (ICAO)">
              <input
                required
                value={arr}
                onChange={(e) => setArr(e.target.value)}
                placeholder="EGBJ"
                className={inputCls + " uppercase"}
                maxLength={5}
              />
            </Field>
            <Field label="Off blocks (UTC)">
              <input
                type="datetime-local"
                required
                value={off}
                onChange={(e) => setOff(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="On blocks (UTC)">
              <input
                type="datetime-local"
                required
                value={on}
                onChange={(e) => setOn(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          {totalMin > 0 && (
            <div className="text-xs text-white/60">
              Total flight time: <span className="font-bold text-white">{fmtHours(totalMin)}</span>
            </div>
          )}

          {/* Crew & capacity */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pilot-in-Command name">
              <input
                required
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder="e.g. Captain Andrew McKay"
                className={inputCls}
              />
            </Field>
            <Field label="Capacity (operating in)">
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value as typeof capacity)}
                className={inputCls}
              >
                <option value="dual">Dual (P u/t with instructor)</option>
                <option value="pic">PIC</option>
                <option value="put">P u/t solo</option>
                <option value="picus">PICUS</option>
                <option value="instructor">Instructor (giving instruction)</option>
                <option value="examiner">Examiner</option>
              </select>
            </Field>
          </div>

          {/* Landings + conditions */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="Landings day">
              <input
                type="number"
                min={0}
                value={landingsDay}
                onChange={(e) => setLandingsDay(parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="Landings night">
              <input
                type="number"
                min={0}
                value={landingsNight}
                onChange={(e) => setLandingsNight(parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="Night (min)">
              <input
                type="number"
                min={0}
                value={nightMin}
                onChange={(e) => setNightMin(parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="IFR (min)">
              <input
                type="number"
                min={0}
                value={ifrMin}
                onChange={(e) => setIfrMin(parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Exercises */}
          <Field label="Syllabus exercises covered">
            <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 space-y-1.5">
              {(sylData?.exercises ?? []).map((ex) => {
                const grade = selectedExercises[ex.id];
                return (
                  <div key={ex.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!grade}
                      onChange={(e) => {
                        setSelectedExercises((prev) => {
                          const next = { ...prev };
                          if (e.target.checked) next[ex.id] = "intro";
                          else delete next[ex.id];
                          return next;
                        });
                      }}
                    />
                    <span className="text-white/70 flex-1">
                      Ex {ex.exercise_number} — {ex.title}
                    </span>
                    {grade && (
                      <select
                        value={grade}
                        onChange={(e) =>
                          setSelectedExercises((prev) => ({
                            ...prev,
                            [ex.id]: e.target.value as typeof grade,
                          }))
                        }
                        className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-white"
                      >
                        <option value="intro">Intro</option>
                        <option value="practiced">Practiced</option>
                        <option value="competent">Competent</option>
                        <option value="review">Review</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </Field>

          <Field label="Remarks">
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              maxLength={2000}
              className={inputCls}
              placeholder="Conditions, weak points, items to revisit next flight…"
            />
          </Field>

          {createMut.error && (
            <div className="text-xs text-red-400">{(createMut.error as Error).message}</div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-xs text-white/40">
              You'll be recorded as the signing instructor on submit.
            </p>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="rounded-xl bg-[oklch(0.55_0.22_270)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)] disabled:opacity-50"
            >
              {createMut.isPending ? "Saving…" : "Sign & Save Flight"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[oklch(0.65_0.22_270)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ============ SYLLABUS ============ */
function SyllabusTab({
  flights,
  flightExercises,
}: {
  flights: any[];
  flightExercises: any[];
}) {
  const syllabusFn = useServerFn(listSyllabus);
  const { data } = useQuery({ queryKey: ["syllabus"], queryFn: () => syllabusFn() });
  const exercises = data?.exercises ?? [];

  const flightById = new Map(flights.map((f) => [f.id, f]));

  const progressByExercise = useMemo(() => {
    const map = new Map<
      string,
      { lastDate: string | null; bestGrade: string; count: number }
    >();
    const gradeRank: Record<string, number> = {
      intro: 1,
      practiced: 2,
      review: 2,
      competent: 3,
    };
    flightExercises.forEach((fe) => {
      const f = flightById.get(fe.flight_log_entry_id);
      if (!f) return;
      const cur = map.get(fe.exercise_id) ?? { lastDate: null, bestGrade: "intro", count: 0 };
      cur.count += 1;
      if (!cur.lastDate || f.flight_date > cur.lastDate) cur.lastDate = f.flight_date;
      if ((gradeRank[fe.grade] ?? 0) > (gradeRank[cur.bestGrade] ?? 0)) cur.bestGrade = fe.grade;
      map.set(fe.exercise_id, cur);
    });
    return map;
  }, [flightExercises, flightById]);

  const competentCount = Array.from(progressByExercise.values()).filter(
    (p) => p.bestGrade === "competent",
  ).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Syllabus progress</span>
          <span className="text-sm font-bold text-white">
            {competentCount} / {exercises.length} competent
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[oklch(0.55_0.22_270)]"
            style={{ width: `${exercises.length ? (competentCount / exercises.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Exercise</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Times flown</th>
              <th className="px-3 py-2 text-right">Last flown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {exercises.map((ex) => {
              const prog = progressByExercise.get(ex.id);
              return (
                <tr key={ex.id}>
                  <td className="px-3 py-2 font-mono text-white/40">Ex {ex.exercise_number}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-white">{ex.title}</div>
                    {ex.description && (
                      <div className="text-white/40 text-[11px] mt-0.5">{ex.description}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!prog ? (
                      <span className="text-white/30">Not started</span>
                    ) : (
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold capitalize ${
                          prog.bestGrade === "competent"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : prog.bestGrade === "practiced"
                              ? "bg-sky-500/15 text-sky-400"
                              : prog.bestGrade === "review"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-white/10 text-white/60"
                        }`}
                      >
                        {prog.bestGrade}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{prog?.count ?? 0}</td>
                  <td className="px-3 py-2 text-right">{prog?.lastDate ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ DOCUMENTS ============ */
function DocumentsTab({
  studentId,
  documents,
  onChange,
}: {
  studentId: string;
  documents: any[];
  onChange: () => void;
}) {
  const upsert = useServerFn(upsertStudentDocument);
  const del = useServerFn(deleteStudentDocument);
  const upMut = useMutation({ mutationFn: (d: any) => upsert({ data: d }), onSuccess: onChange });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: onChange,
  });

  const [show, setShow] = useState(false);
  const [docType, setDocType] = useState<
    "medical_class1" | "medical_class2" | "medical_lapl" | "student_pilot_license" | "ppl" | "lapl" | "rt_license" | "passport" | "photo_id" | "language_proficiency" | "other"
  >("medical_class2");
  const [docNumber, setDocNumber] = useState("");
  const [issued, setIssued] = useState("");
  const [expires, setExpires] = useState("");
  const [authority, setAuthority] = useState("UK CAA");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-4 py-2 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)]"
        >
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">No documents recorded.</div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Number</th>
                <th className="px-3 py-2 text-left">Issued</th>
                <th className="px-3 py-2 text-left">Expires</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {documents.map((d) => {
                const days = daysUntil(d.expires_on);
                return (
                  <tr key={d.id}>
                    <td className="px-3 py-2 capitalize">{d.document_type.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2 font-mono">{d.document_number ?? "—"}</td>
                    <td className="px-3 py-2">{d.issued_on ?? "—"}</td>
                    <td className="px-3 py-2">{d.expires_on ?? "—"}</td>
                    <td className="px-3 py-2"><ExpiryPill days={days} /></td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => {
                          if (confirm("Delete this document?")) delMut.mutate(d.id);
                        }}
                        className="text-white/30 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              upMut.mutate({
                student_id: studentId,
                document_type: docType,
                document_number: docNumber || null,
                issued_on: issued || null,
                expires_on: expires || null,
                issuing_authority: authority || null,
              });
              setShow(false);
              setDocNumber(""); setIssued(""); setExpires("");
            }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[oklch(0.10_0.04_270)] p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-white">Add Document</h3>
            <Field label="Type">
              <select value={docType} onChange={(e) => setDocType(e.target.value as typeof docType)} className={inputCls}>
                <option value="medical_class1">Medical Class 1</option>
                <option value="medical_class2">Medical Class 2</option>
                <option value="medical_lapl">Medical LAPL</option>
                <option value="student_pilot_license">Student Pilot License</option>
                <option value="ppl">PPL</option>
                <option value="lapl">LAPL</option>
                <option value="rt_license">R/T License</option>
                <option value="passport">Passport</option>
                <option value="photo_id">Photo ID</option>
                <option value="language_proficiency">Language Proficiency</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Number"><input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className={inputCls} /></Field>
              <Field label="Authority"><input value={authority} onChange={(e) => setAuthority(e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issued on"><input type="date" value={issued} onChange={(e) => setIssued(e.target.value)} className={inputCls} /></Field>
              <Field label="Expires on"><input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
              <button type="submit" className="rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)]">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============ ENDORSEMENTS ============ */
function EndorsementsTab({
  studentId,
  endorsements,
  onChange,
}: {
  studentId: string;
  endorsements: any[];
  onChange: () => void;
}) {
  const create = useServerFn(createEndorsement);
  const del = useServerFn(deleteEndorsement);
  const createMut = useMutation({ mutationFn: (d: any) => create({ data: d }), onSuccess: onChange });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: onChange });

  const [show, setShow] = useState(false);
  const [type, setType] = useState<"first_solo" | "solo_circuits" | "solo_local" | "solo_nav" | "solo_cross_country" | "type_endorsement" | "night_rating" | "differences_training" | "other">("first_solo");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [validUntil, setValidUntil] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-4 py-2 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)]"
        >
          <Plus className="h-4 w-4" /> Add Endorsement
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {endorsements.length === 0 ? (
          <div className="p-10 text-center text-white/40 text-sm">No endorsements yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {endorsements.map((e) => (
              <div key={e.id} className="p-4 flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    {e.title}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5 capitalize">
                    {e.endorsement_type.replace(/_/g, " ")}
                    {" · signed "}
                    {new Date(e.signed_at).toLocaleDateString()}
                    {e.valid_until && ` · valid until ${e.valid_until}`}
                  </div>
                  {e.details && (
                    <div className="text-xs text-white/60 mt-1 whitespace-pre-wrap">{e.details}</div>
                  )}
                </div>
                <button
                  onClick={() => { if (confirm("Delete?")) delMut.mutate(e.id); }}
                  className="text-white/30 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate({
                student_id: studentId,
                endorsement_type: type,
                title,
                details: details || null,
                valid_until: validUntil || null,
              });
              setShow(false);
              setTitle(""); setDetails(""); setValidUntil("");
            }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[oklch(0.10_0.04_270)] p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-white">Sign Endorsement</h3>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={inputCls}>
                <option value="first_solo">First Solo</option>
                <option value="solo_circuits">Solo Circuits</option>
                <option value="solo_local">Solo Local</option>
                <option value="solo_nav">Solo Navigation</option>
                <option value="solo_cross_country">Solo Cross-Country</option>
                <option value="type_endorsement">Type Endorsement</option>
                <option value="night_rating">Night Rating</option>
                <option value="differences_training">Differences Training</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Title">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. First solo — circuits at EGBJ" />
            </Field>
            <Field label="Details">
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className={inputCls} />
            </Field>
            <Field label="Valid until (optional)">
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
              <button type="submit" className="rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2 text-sm font-bold text-white hover:bg-[oklch(0.60_0.22_270)]">Sign &amp; Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ============ THEORY ============ */
function TheoryTab({
  studentId,
  theory,
  onChange,
}: {
  studentId: string;
  theory: any[];
  onChange: () => void;
}) {
  const upsert = useServerFn(upsertTheoryResult);
  const del = useServerFn(deleteTheoryResult);
  const upMut = useMutation({ mutationFn: (d: any) => upsert({ data: d }), onSuccess: onChange });
  const delMut = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: onChange });

  const bySubject = new Map(theory.map((t) => [t.subject, t]));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
          <tr>
            <th className="px-3 py-2 text-left">Subject</th>
            <th className="px-3 py-2 text-left">Result</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2 text-left">Taken</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {PPL_THEORY_SUBJECTS.map((subj) => {
            const t = bySubject.get(subj);
            return (
              <tr key={subj}>
                <td className="px-3 py-2 text-white font-semibold">{subj}</td>
                <td className="px-3 py-2">
                  <select
                    value={t?.result ?? "pending"}
                    onChange={(e) =>
                      upMut.mutate({
                        id: t?.id,
                        student_id: studentId,
                        subject: subj,
                        result: e.target.value,
                        score: t?.score ?? null,
                        taken_on: t?.taken_on ?? null,
                      })
                    }
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                  {t?.result === "pass" && (
                    <CheckCircle2 className="inline ml-2 h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {t?.result === "fail" && (
                    <XCircle className="inline ml-2 h-3.5 w-3.5 text-red-400" />
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={t?.score ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value ? parseFloat(e.target.value) : null;
                      upMut.mutate({
                        id: t?.id,
                        student_id: studentId,
                        subject: subj,
                        result: t?.result ?? "pending",
                        score: v,
                        taken_on: t?.taken_on ?? null,
                      });
                    }}
                    className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    defaultValue={t?.taken_on ?? ""}
                    onBlur={(e) =>
                      upMut.mutate({
                        id: t?.id,
                        student_id: studentId,
                        subject: subj,
                        result: t?.result ?? "pending",
                        score: t?.score ?? null,
                        taken_on: e.target.value || null,
                      })
                    }
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                  />
                </td>
                <td className="px-3 py-2">
                  {t && (
                    <button
                      onClick={() => { if (confirm("Reset this exam?")) delMut.mutate(t.id); }}
                      className="text-white/30 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}