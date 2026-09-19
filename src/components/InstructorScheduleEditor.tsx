import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Clock, CalendarOff, Loader2 } from "lucide-react";
import { WEEKDAY_LABELS } from "@/lib/instructor-availability";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import {
  listAvailabilityWindows,
  saveAvailabilityWindow,
  deleteAvailabilityWindow,
  listInstructorTimeOff,
  addInstructorTimeOff,
  deleteInstructorTimeOff,
} from "@/lib/instructor-schedule.functions";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: DEFAULT_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hhmm(value: string) {
  return value.slice(0, 5);
}

export function InstructorScheduleEditor({
  instructorId,
  instructorName,
}: {
  instructorId: string;
  instructorName: string;
}) {
  const qc = useQueryClient();
  const fetchWindows = useServerFn(listAvailabilityWindows);
  const fetchTimeOff = useServerFn(listInstructorTimeOff);
  const saveWindow = useServerFn(saveAvailabilityWindow);
  const removeWindow = useServerFn(deleteAvailabilityWindow);
  const addTimeOff = useServerFn(addInstructorTimeOff);
  const removeTimeOff = useServerFn(deleteInstructorTimeOff);

  const windowsQ = useQuery({
    queryKey: ["instructor-availability", instructorId],
    queryFn: () => fetchWindows({ data: { instructorId } }),
  });
  const timeOffQ = useQuery({
    queryKey: ["instructor-time-off", instructorId],
    queryFn: () => fetchTimeOff({ data: { instructorId } }),
  });

  const [weekday, setWeekday] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [offReason, setOffReason] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["instructor-availability", instructorId] });
    qc.invalidateQueries({ queryKey: ["instructor-time-off", instructorId] });
  };

  const addWindowMut = useMutation({
    mutationFn: () => saveWindow({ data: { instructorId, weekday, startTime, endTime } }),
    onSuccess: () => {
      toast.success("Hours added");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save those hours"),
  });

  const delWindowMut = useMutation({
    mutationFn: (id: string) => removeWindow({ data: { id } }),
    onSuccess: () => {
      toast.success("Hours removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not remove those hours"),
  });

  const addOffMut = useMutation({
    mutationFn: () => {
      if (!offStart || !offEnd) throw new Error("Pick a start and end for the time off");
      return addTimeOff({
        data: {
          instructorId,
          startsAt: new Date(offStart).toISOString(),
          endsAt: new Date(offEnd).toISOString(),
          reason: offReason || null,
        },
      });
    },
    onSuccess: () => {
      toast.success("Time off saved");
      setOffStart("");
      setOffEnd("");
      setOffReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save that time off"),
  });

  const delOffMut = useMutation({
    mutationFn: (id: string) => removeTimeOff({ data: { id } }),
    onSuccess: () => {
      toast.success("Time off removed");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not remove that time off"),
  });

  const windows = windowsQ.data ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Clock className="h-4 w-4 text-primary" /> Weekly hours — {instructorName}
        </h3>
        <p className="mt-1 text-xs text-white/40">
          {instructorName} can only be booked inside these hours. No hours for a day means not
          available that day. Times are {DEFAULT_TIMEZONE.replace("_", " ")} local.
        </p>

        <div className="mt-5 space-y-2">
          {windowsQ.isLoading && (
            <p className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          )}
          {!windowsQ.isLoading && windows.length === 0 && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              No hours published yet — {instructorName} cannot be booked until some are added.
            </p>
          )}
          {WEEKDAY_LABELS.map((label, idx) => {
            const rows = windows.filter((w) => w.weekday === idx);
            if (!rows.length) return null;
            return (
              <div
                key={label}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="w-24 text-xs font-bold uppercase tracking-wider text-white/60">
                  {label}
                </span>
                {rows.map((w) => (
                  <span
                    key={w.id}
                    className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs tabular-nums text-white"
                  >
                    {hhmm(w.start_time)}–{hhmm(w.end_time)}
                    <button
                      type="button"
                      onClick={() => delWindowMut.mutate(w.id)}
                      className="text-white/50 transition-colors hover:text-destructive"
                      aria-label="Remove hours"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-white/10 pt-5">
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Day
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white"
            >
              {WEEKDAY_LABELS.map((l, i) => (
                <option key={l} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/50">
            From
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/50">
            To
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => addWindowMut.mutate()}
            disabled={addWindowMut.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add hours
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <CalendarOff className="h-4 w-4 text-primary" /> One-off time off
        </h3>
        <p className="mt-1 text-xs text-white/40">
          Holidays, exams, anything that overrides the weekly hours for a specific date.
        </p>

        <div className="mt-5 space-y-2">
          {(timeOffQ.data ?? []).length === 0 && !timeOffQ.isLoading && (
            <p className="text-sm text-white/40">No upcoming time off.</p>
          )}
          {(timeOffQ.data ?? []).map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {fmt(b.starts_at)} → {fmt(b.ends_at)}
                </p>
                {b.reason && <p className="text-xs text-white/40">{b.reason}</p>}
              </div>
              <button
                type="button"
                onClick={() => delOffMut.mutate(b.id)}
                className="text-white/40 transition-colors hover:text-destructive"
                aria-label="Remove time off"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-white/10 pt-5">
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Starts
            <input
              type="datetime-local"
              value={offStart}
              onChange={(e) => setOffStart(e.target.value)}
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Ends
            <input
              type="datetime-local"
              value={offEnd}
              onChange={(e) => setOffEnd(e.target.value)}
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Reason (optional)
            <input
              value={offReason}
              onChange={(e) => setOffReason(e.target.value)}
              placeholder="Annual leave"
              className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
          </label>
          <button
            type="button"
            onClick={() => addOffMut.mutate()}
            disabled={addOffMut.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add time off
          </button>
        </div>
      </section>
    </div>
  );
}
