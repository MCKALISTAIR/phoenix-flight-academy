import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import {
  getCalendarSettings,
  updateCalendarSettings,
  listClosedDates,
  addClosedDate,
  deleteClosedDate,
  listResourceBlocks,
  addResourceBlock,
  deleteResourceBlock,
} from "@/lib/booking-calendar.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cms/calendar-settings")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CalendarAdmin,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const inputCls = "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white";

function CalendarAdmin() {
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getCalendarSettings);
  const saveSettings = useServerFn(updateCalendarSettings);
  const fetchClosed = useServerFn(listClosedDates);
  const addClosed = useServerFn(addClosedDate);
  const delClosed = useServerFn(deleteClosedDate);
  const fetchBlocks = useServerFn(listResourceBlocks);
  const addBlock = useServerFn(addResourceBlock);
  const delBlock = useServerFn(deleteResourceBlock);

  const { data: settings } = useQuery({
    queryKey: ["calendar-settings"],
    queryFn: () => fetchSettings(),
  });
  const { data: closed } = useQuery({ queryKey: ["closed-dates"], queryFn: () => fetchClosed() });
  const { data: blocks } = useQuery({
    queryKey: ["resource-blocks"],
    queryFn: () => fetchBlocks(),
  });
  const { data: aircraft } = useQuery({
    queryKey: ["aircraft-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("aircraft")
        .select("id, registration")
        .order("display_order");
      return data ?? [];
    },
  });
  const { data: instructors } = useQuery({
    queryKey: ["instructors-all"],
    queryFn: async () => {
      const { data } = await supabase.from("instructors").select("id, name").order("display_order");
      return data ?? [];
    },
  });

  const [form, setForm] = useState<{
    open_time: string;
    close_time: string;
    slot_minutes: number;
    buffer_minutes: number;
    weekday_mask: string;
    timezone: string;
  } | null>(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        open_time: settings.open_time.slice(0, 5),
        close_time: settings.close_time.slice(0, 5),
        slot_minutes: settings.slot_minutes,
        buffer_minutes: settings.buffer_minutes,
        weekday_mask: settings.weekday_mask,
        timezone: settings.timezone,
      });
    }
  }, [settings, form]);

  const saveMut = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-settings"] }),
  });

  // Closed dates form
  const [closedForm, setClosedForm] = useState({ starts_on: "", ends_on: "", reason: "" });
  const addClosedMut = useMutation({
    mutationFn: addClosed,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["closed-dates"] });
      setClosedForm({ starts_on: "", ends_on: "", reason: "" });
    },
  });
  const delClosedMut = useMutation({
    mutationFn: delClosed,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["closed-dates"] }),
  });

  // Resource block form
  const [blockForm, setBlockForm] = useState({
    resource_kind: "aircraft" as "aircraft" | "instructor",
    resource_id: "",
    starts_at: "",
    ends_at: "",
    reason: "",
  });
  const addBlockMut = useMutation({
    mutationFn: addBlock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resource-blocks"] });
      setBlockForm({
        resource_kind: "aircraft",
        resource_id: "",
        starts_at: "",
        ends_at: "",
        reason: "",
      });
    },
  });
  const delBlockMut = useMutation({
    mutationFn: delBlock,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resource-blocks"] }),
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Calendar Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Opening hours, closed dates, and per-resource availability.
        </p>
      </div>

      {/* Settings */}
      {form && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-bold text-white">Operating hours</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Open time">
              <input
                type="time"
                value={form.open_time}
                onChange={(e) => setForm({ ...form, open_time: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Close time">
              <input
                type="time"
                value={form.close_time}
                onChange={(e) => setForm({ ...form, close_time: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Slot length (min)">
              <input
                type="number"
                value={form.slot_minutes}
                onChange={(e) => setForm({ ...form, slot_minutes: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Buffer between bookings (min)">
              <input
                type="number"
                value={form.buffer_minutes}
                onChange={(e) => setForm({ ...form, buffer_minutes: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Timezone">
              <input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs text-white/50">Operating days</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => {
                const on = form.weekday_mask[i] === "Y";
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const chars = form.weekday_mask.split("");
                      chars[i] = on ? "N" : "Y";
                      setForm({ ...form, weekday_mask: chars.join("") });
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      on
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-white/40"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5">
            <button
              onClick={() => settings && saveMut.mutate({ data: { id: settings.id, ...form } })}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              <Save className="h-4 w-4" /> Save settings
            </button>
          </div>
        </section>
      )}

      {/* Closed dates */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white">Closed dates</h2>
        <p className="mt-1 text-sm text-white/50">
          Block entire days (weather, holidays, airshows).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            type="date"
            value={closedForm.starts_on}
            onChange={(e) => setClosedForm({ ...closedForm, starts_on: e.target.value })}
            className={inputCls}
          />
          <input
            type="date"
            value={closedForm.ends_on}
            onChange={(e) => setClosedForm({ ...closedForm, ends_on: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="Reason (optional)"
            value={closedForm.reason}
            onChange={(e) => setClosedForm({ ...closedForm, reason: e.target.value })}
            className={`${inputCls} sm:col-span-1`}
          />
          <button
            onClick={() => {
              if (!closedForm.starts_on || !closedForm.ends_on) return;
              addClosedMut.mutate({
                data: {
                  starts_on: closedForm.starts_on,
                  ends_on: closedForm.ends_on,
                  reason: closedForm.reason || null,
                },
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {(closed ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <div>
                <span className="text-white">
                  {c.starts_on}
                  {c.starts_on !== c.ends_on && ` → ${c.ends_on}`}
                </span>
                {c.reason && <span className="ml-3 text-white/50">{c.reason}</span>}
              </div>
              <button
                onClick={() => delClosedMut.mutate({ data: { id: c.id } })}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {(closed ?? []).length === 0 && (
            <p className="text-sm text-white/40">No upcoming closed dates.</p>
          )}
        </div>
      </section>

      {/* Resource blocks */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white">Resource blocks</h2>
        <p className="mt-1 text-sm text-white/50">
          Mark an aircraft or instructor unavailable for a window (maintenance, leave).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <select
            value={blockForm.resource_kind}
            onChange={(e) =>
              setBlockForm({
                ...blockForm,
                resource_kind: e.target.value as "aircraft" | "instructor",
                resource_id: "",
              })
            }
            className={inputCls}
          >
            <option value="aircraft">Aircraft</option>
            <option value="instructor">Instructor</option>
          </select>
          <select
            value={blockForm.resource_id}
            onChange={(e) => setBlockForm({ ...blockForm, resource_id: e.target.value })}
            className={inputCls}
          >
            <option value="">Choose…</option>
            {blockForm.resource_kind === "aircraft"
              ? (aircraft ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.registration}
                  </option>
                ))
              : (instructors ?? []).map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
          </select>
          <input
            type="datetime-local"
            value={blockForm.starts_at}
            onChange={(e) => setBlockForm({ ...blockForm, starts_at: e.target.value })}
            className={inputCls}
          />
          <input
            type="datetime-local"
            value={blockForm.ends_at}
            onChange={(e) => setBlockForm({ ...blockForm, ends_at: e.target.value })}
            className={inputCls}
          />
          <input
            placeholder="Reason"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            className={inputCls}
          />
          <button
            onClick={() => {
              if (!blockForm.resource_id || !blockForm.starts_at || !blockForm.ends_at) return;
              addBlockMut.mutate({
                data: {
                  resource_kind: blockForm.resource_kind,
                  aircraft_id:
                    blockForm.resource_kind === "aircraft" ? blockForm.resource_id : null,
                  instructor_id:
                    blockForm.resource_kind === "instructor" ? blockForm.resource_id : null,
                  starts_at: new Date(blockForm.starts_at).toISOString(),
                  ends_at: new Date(blockForm.ends_at).toISOString(),
                  reason: blockForm.reason || null,
                },
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Block
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {(blocks ?? []).map((b) => {
            const label =
              b.resource_kind === "aircraft"
                ? (aircraft?.find((a) => a.id === b.aircraft_id)?.registration ?? "Aircraft")
                : (instructors?.find((i) => i.id === b.instructor_id)?.name ?? "Instructor");
            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                <div>
                  <span className="font-semibold text-white">{label}</span>
                  <span className="ml-3 text-white/60">
                    {new Date(b.starts_at).toLocaleString("en-GB")} →{" "}
                    {new Date(b.ends_at).toLocaleString("en-GB")}
                  </span>
                  {b.reason && <span className="ml-3 text-white/40">{b.reason}</span>}
                </div>
                <button
                  onClick={() => delBlockMut.mutate({ data: { id: b.id } })}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {(blocks ?? []).length === 0 && (
            <p className="text-sm text-white/40">No upcoming blocks.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-white/50">{label}</label>
      {children}
    </div>
  );
}
