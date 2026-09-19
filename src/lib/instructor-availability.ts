/**
 * Shared helpers for instructor weekly availability.
 * Instructors are only bookable inside the windows they publish — an
 * instructor with no windows for a weekday is treated as unavailable.
 */

export type AvailabilityWindow = {
  instructor_id: string;
  weekday: number; // Mon=0 .. Sun=6
  start_time: string; // "HH:MM" or "HH:MM:SS"
  end_time: string;
};

export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** True when the instructor has published a window covering the whole slot. */
export function instructorWindowCovers(
  windows: AvailabilityWindow[],
  instructorId: string,
  weekdayIdx: number,
  startMinutes: number,
  endMinutes: number,
): boolean {
  return windows.some(
    (w) =>
      w.instructor_id === instructorId &&
      w.weekday === weekdayIdx &&
      timeToMinutes(w.start_time) <= startMinutes &&
      timeToMinutes(w.end_time) >= endMinutes,
  );
}
