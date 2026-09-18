/**
 * Small timezone helpers so airfield opening hours are treated as wall-clock
 * times in the school's timezone (e.g. Europe/London) rather than as UTC.
 * Uses Intl only — safe in the Worker runtime.
 */

export const DEFAULT_TIMEZONE = "Europe/London";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** Mon=0 .. Sun=6 */
  weekdayIdx: number;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getZonedParts(date: Date, timeZone = DEFAULT_TIMEZONE): ZonedParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const hour = Number(map.hour) % 24; // some locales render midnight as 24
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    weekdayIdx: Math.max(0, WEEKDAYS.indexOf(map.weekday ?? "Mon")),
  };
}

function offsetMs(utcDate: Date, timeZone: string): number {
  const p = getZonedParts(utcDate, timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0, 0);
  // Zero out seconds/ms on both sides so the diff is a clean offset.
  const base = Math.floor(utcDate.getTime() / 60_000) * 60_000;
  return asIfUtc - base;
}

/**
 * Converts a wall-clock date/time in `timeZone` into the correct UTC instant.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = DEFAULT_TIMEZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let ts = guess - offsetMs(new Date(guess), timeZone);
  // Re-check once to settle DST boundary cases.
  ts = guess - offsetMs(new Date(ts), timeZone);
  return new Date(ts);
}

/** Minutes since local midnight, and Mon=0 weekday index, for an instant. */
export function localMinutesAndWeekday(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const p = getZonedParts(date, timeZone);
  return { minutes: p.hour * 60 + p.minute, weekdayIdx: p.weekdayIdx, parts: p };
}

/**
 * Adds whole days to an instant while keeping the same wall-clock time in
 * `timeZone`, so repeating bookings don't drift across a clock change.
 */
export function addDaysKeepingLocalTime(
  date: Date,
  days: number,
  timeZone = DEFAULT_TIMEZONE,
): Date {
  const p = getZonedParts(date, timeZone);
  // Shift the calendar date in plain UTC arithmetic, then rebuild the instant
  // from the (unchanged) local wall-clock time.
  const shifted = new Date(Date.UTC(p.year, p.month - 1, p.day, 12, 0, 0, 0));
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return zonedTimeToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    p.hour,
    p.minute,
    timeZone,
  );
}

/** Enumerate calendar dates (YYYY-MM-DD) inclusively between two date strings. */
export function eachDate(from: string, to: string): { y: number; m: number; d: number }[] {
  const out: { y: number; m: number; d: number }[] = [];
  const start = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  const cursor = new Date(start);
  while (cursor <= end) {
    out.push({
      y: cursor.getUTCFullYear(),
      m: cursor.getUTCMonth() + 1,
      d: cursor.getUTCDate(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}
