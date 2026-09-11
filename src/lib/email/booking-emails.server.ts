import { getEmailSettings, sendAppEmail } from "@/lib/email/send.server";

function gbp(cents: number | null | undefined) {
  if (cents == null) return undefined;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);
}

function whenLondon(iso: string | null | undefined) {
  if (!iso) return undefined;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(iso));
}

/**
 * Sends the customer receipt and the team notification for a paid booking.
 * Never throws — email problems must not roll back a successful payment.
 */
export async function notifyBookingPaid(bookingId: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, customer_phone, starts_at, amount_paid_cents, price_total_cents, status, aircraft_id, booking_products(name, requires_approval)",
      )
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) return;

    const product = (booking as { booking_products: { name: string; requires_approval: boolean } | null })
      .booking_products;
    const settings = await getEmailSettings();

    let aircraft: string | undefined;
    if (booking.aircraft_id) {
      const { data: ac } = await supabaseAdmin
        .from("aircraft")
        .select("registration")
        .eq("id", booking.aircraft_id)
        .maybeSingle();
      aircraft = (ac as { registration?: string } | null)?.registration;
    }

    const balance = (booking.price_total_cents ?? 0) - (booking.amount_paid_cents ?? 0);
    const shared = {
      productName: product?.name ?? "Booking",
      startsAt: whenLondon(booking.starts_at),
      aircraft,
      amountPaid: gbp(booking.amount_paid_cents),
      reference: booking.id.slice(0, 8).toUpperCase(),
    };

    if (settings.customer_receipt_enabled && booking.customer_email) {
      await sendAppEmail({
        templateName: "booking-receipt",
        to: booking.customer_email,
        idempotencyKey: `booking-receipt-${booking.id}`,
        templateData: {
          ...shared,
          customerName: booking.customer_name ?? undefined,
          balanceDue: balance > 0 ? gbp(balance) : undefined,
        },
      });
    }

    if (settings.team_notification_enabled && settings.team_notification_email) {
      await sendAppEmail({
        templateName: "team-booking-notification",
        to: settings.team_notification_email,
        idempotencyKey: `booking-team-${booking.id}`,
        templateData: {
          ...shared,
          customerName: booking.customer_name ?? undefined,
          customerEmail: booking.customer_email ?? undefined,
          customerPhone: booking.customer_phone ?? undefined,
          needsApproval: booking.status === "pending",
        },
      });
    }
  } catch (e) {
    console.error("[email] booking notification failed:", e);
  }
}

/**
 * Sends a pre-flight reminder and briefing to the customer.
 */
export async function sendBookingReminderEmail(bookingId: string): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, customer_name, customer_email, starts_at, aircraft_id, instructor_id, booking_products(name), instructors(name)",
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { sent: false, reason: "Booking not found" };
    }

    if (!booking.customer_email) {
      return { sent: false, reason: "Customer has no email address" };
    }

    const product = (booking as { booking_products: { name: string } | null }).booking_products;
    const instructor = (booking as { instructors: { name: string } | null }).instructors;

    let aircraft = "Piper PA-28 Archer III (G-EGPG)";
    if (booking.aircraft_id) {
      const { data: ac } = await supabaseAdmin
        .from("aircraft")
        .select("registration, model")
        .eq("id", booking.aircraft_id)
        .maybeSingle();
      if (ac) {
        aircraft = `${ac.model} (${ac.registration})`;
      }
    }

    return await sendAppEmail({
      templateName: "booking-reminder",
      to: booking.customer_email,
      idempotencyKey: `booking-reminder-${booking.id}`,
      templateData: {
        customerName: booking.customer_name ?? "Aviator",
        productName: product?.name ?? "Flight Session",
        startsAt: whenLondon(booking.starts_at),
        aircraft,
        instructorName: instructor?.name ?? "Flight Instructor",
        reference: booking.id.slice(0, 8).toUpperCase(),
      },
      label: "booking-reminder",
    });
  } catch (err) {
    console.error("[email] Failed to send booking reminder:", err);
    return { sent: false, reason: err instanceof Error ? err.message : "Internal error" };
  }
}

