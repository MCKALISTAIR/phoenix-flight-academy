import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Printer, Plane, User, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { getDaySheet } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/cms/day-sheet")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: DaySheetPage,
});

function todayKey() {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return p;
}

function shiftDay(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 12));
  cursor.setUTCDate(cursor.getUTCDate() + days);
  return `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(
    cursor.getUTCDate(),
  ).padStart(2, "0")}`;
}

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function DaySheetPage() {
  const [date, setDate] = useState(todayKey());
  const fetchSheet = useServerFn(getDaySheet);
  const { data, isLoading } = useQuery({
    queryKey: ["day-sheet", date],
    queryFn: () => fetchSheet({ data: { date } }),
  });

  const tz = data?.timezone ?? "Europe/London";
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
    });
  const longDate = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 print:space-y-4 print:text-black">
      <style>{`@media print {
        body { background: #fff !important; }
        aside, nav, header, .no-print { display: none !important; }
        .print-sheet, .print-sheet * { color: #000 !important; }
        .print-sheet { border-color: #ccc !important; background: #fff !important; }
      }`}</style>

      <div className="flex flex-wrap items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-white">Day Sheet</h1>
          <p className="mt-1 text-sm text-white/50">
            Front-desk schedule for one day — aircraft, instructor and contact details.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDate(shiftDay(date, -1))}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          />
          <button
            onClick={() => setDate(shiftDay(date, 1))}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDate(todayKey())}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            Today
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div className="print-sheet overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Phoenix Flight Training
            </p>
            <p className="text-lg font-bold text-white">{longDate}</p>
          </div>
          <div className="text-right text-xs text-white/50">
            <p>{data ? `${data.flights.length} flight(s)` : "—"}</p>
            {data && !data.airfieldOpen && (
              <p className="font-semibold text-destructive">
                Airfield closed{data.airfieldMessage ? ` — ${data.airfieldMessage}` : ""}
              </p>
            )}
          </div>
        </div>

        {isLoading && <p className="p-5 text-sm text-white/50">Loading…</p>}
        {!isLoading && (data?.flights.length ?? 0) === 0 && (
          <p className="p-5 text-sm text-white/50">No flights scheduled for this day.</p>
        )}

        {(data?.flights ?? []).map((f) => (
          <div key={f.id} className="border-b border-white/5 px-5 py-4 last:border-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <span className="font-mono text-sm font-bold tabular-nums text-primary">
                  {time(f.startsAt)}–{time(f.endsAt)}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{f.customerName}</p>
                  <p className="text-xs text-white/50">{f.productName}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      {f.aircraftRegistration
                        ? `${f.aircraftRegistration}${f.aircraftModel ? ` · ${f.aircraftModel}` : ""}`
                        : "Aircraft TBC"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {f.instructorName ?? "No instructor"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {f.customerPhone ?? f.customerEmail}
                    </span>
                  </div>
                  {f.notes && <p className="text-xs italic text-white/40">Note: {f.notes}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-[11px] font-mono uppercase">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
                  {f.status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    f.balanceDueCents > 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {f.balanceDueCents > 0 ? `${money(f.balanceDueCents)} due` : "paid"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
