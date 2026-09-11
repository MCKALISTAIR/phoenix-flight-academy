import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface DashboardSnapshot {
  flightsToday: {
    id: string;
    startsAt: string;
    customerName: string;
    productName: string;
    status: string;
    paymentStatus: string;
  }[];
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

export const getDashboardSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardSnapshot> => {
    const supabase = context.supabase;
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400_000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);

    const [today, upcoming, pendingApproval, unpaid, verifications, aircraft, students, recentPaid, enquiries] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("id, starts_at, customer_name, status, payment_status, booking_products(name)")
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
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
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
      flightsToday: (today.data ?? []).map((b) => ({
        id: b.id,
        startsAt: b.starts_at,
        customerName: b.customer_name,
        productName:
          (b as { booking_products: { name: string } | null }).booking_products?.name ?? "Booking",
        status: b.status,
        paymentStatus: b.payment_status,
      })),
      upcomingCount: upcoming.count ?? 0,
      awaitingApproval: pendingApproval.count ?? 0,
      unpaidCount: unpaidRows.filter(
        (b) => (b.amount_paid_cents ?? 0) < (b.price_total_cents ?? 0),
      ).length,
      outstandingCents: outstanding,
      pendingVerifications: verifications.count ?? 0,
      aircraftTotal: aircraftRows.length,
      aircraftServiceable: aircraftRows.filter((a) => a.status === "serviceable").length,
      activeStudents: students.count ?? 0,
      revenue30dCents: (recentPaid.data ?? []).reduce((s, b) => s + (b.amount_paid_cents ?? 0), 0),
      newEnquiriesCount: enquiries.count ?? 0,
    };
  });
