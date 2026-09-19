import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_TIMEZONE, getZonedParts, zonedTimeToUtc } from "@/lib/timezone";

export interface DaySheetFlight {
  id: string;
  startsAt: string;
  endsAt: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  productName: string;
  aircraftRegistration: string | null;
  aircraftModel: string | null;
  instructorName: string | null;
  status: string;
  paymentStatus: string;
  balanceDueCents: number;
  notes: string | null;
}

export interface DashboardSnapshot {
  flightsToday: DaySheetFlight[];
  upcomingCount: number;
  awaitingApproval: number;
  unpaidCount: number;
  outstandingCents: number;
  pendingVerifications: number;
  aircraftTotal: number;
  aircraftServiceable: number;
  activeStudents: number;
  revenue30dCents: number;
  newEnquiriesCount: number;
}

const FLIGHT_SELECT =
  "id, starts_at, ends_at, customer_name, customer_email, customer_phone, status, payment_status, price_total_cents, amount_paid_cents, notes, booking_products(name), aircraft(registration, model), instructors(name)";

type FlightRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  payment_status: string;
  price_total_cents: number | null;
  amount_paid_cents: number | null;
  notes: string | null;
  booking_products: { name: string } | null;
  aircraft: { registration: string; model: string } | null;
  instructors: { name: string } | null;
};

function mapFlight(row: FlightRow): DaySheetFlight {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    productName: row.booking_products?.name ?? "Booking",
    aircraftRegistration: row.aircraft?.registration ?? null,
    aircraftModel: row.aircraft?.model ?? null,
    instructorName: row.instructors?.name ?? null,
    status: row.status,
    paymentStatus: row.payment_status,
    balanceDueCents: Math.max(0, (row.price_total_cents ?? 0) - (row.amount_paid_cents ?? 0)),
    notes: row.notes,
  };
}

/** Local-midnight-to-midnight window for a calendar date in the school's timezone. */
function localDayWindow(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  const start = zonedTimeToUtc(p.year, p.month, p.day, 0, 0, timeZone);
  const end = zonedTimeToUtc(p.year, p.month, p.day + 1, 0, 0, timeZone);
  return { start, end };
}

export const getDashboardSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardSnapshot> => {
    const supabase = context.supabase;
    const now = new Date();
    const tzRow = await supabase.from("booking_calendar_settings").select("timezone").maybeSingle();
    const timeZone = tzRow.data?.timezone || DEFAULT_TIMEZONE;
    const { start: dayStart, end: dayEnd } = localDayWindow(now, timeZone);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);

    const [
      today,
      upcoming,
      pendingApproval,
      unpaid,
      verifications,
      aircraft,
      students,
      recentPaid,
      enquiries,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select(FLIGHT_SELECT)
        .gte("starts_at", dayStart.toISOString())
        .lt("starts_at", dayEnd.toISOString())
        .in("status", ["pending", "confirmed"])
        .order("starts_at", { ascending: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("starts_at", now.toISOString())
        .in("status", ["pending", "confirmed"]),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("starts_at", now.toISOString()),
      supabase
        .from("bookings")
        .select("price_total_cents, amount_paid_cents")
        .in("status", ["pending", "confirmed"])
        .gte("starts_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("pilot_verification_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("aircraft").select("status"),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("bookings")
        .select("amount_paid_cents")
        .neq("status", "cancelled")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .or("status.eq.new,status.is.null"),
    ]);

    const unpaidRows = unpaid.data ?? [];
    const outstanding = unpaidRows.reduce(
      (sum, b) => sum + Math.max(0, (b.price_total_cents ?? 0) - (b.amount_paid_cents ?? 0)),
      0,
    );
    const aircraftRows = aircraft.data ?? [];

    return {
      flightsToday: ((today.data ?? []) as unknown as FlightRow[]).map(mapFlight),
      upcomingCount: upcoming.count ?? 0,
      awaitingApproval: pendingApproval.count ?? 0,
      unpaidCount: unpaidRows.filter((b) => (b.amount_paid_cents ?? 0) < (b.price_total_cents ?? 0))
        .length,
      outstandingCents: outstanding,
      pendingVerifications: verifications.count ?? 0,
      aircraftTotal: aircraftRows.length,
      aircraftServiceable: aircraftRows.filter((a) => a.status === "serviceable").length,
      activeStudents: students.count ?? 0,
      revenue30dCents: (recentPaid.data ?? []).reduce((s, b) => s + (b.amount_paid_cents ?? 0), 0),
      newEnquiriesCount: enquiries.count ?? 0,
    };
  });
