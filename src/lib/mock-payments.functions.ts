import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/**
 * MOCK PAYMENT LAYER
 * ------------------
 * Stand-in for a real provider (Stripe / Paddle) so the booking flow is wired
 * end-to-end. Swap `completeMockPayment` for a real webhook handler when a
 * provider is chosen — the booking-side contract (payment_status + status
 * transitions) stays identical.
 */

export const getCheckoutSession = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabase
      .from("bookings")
      .select(
        "id, price_total_cents, deposit_due_cents, amount_paid_cents, payment_status, status, customer_email, customer_name, starts_at, booking_products(name, payment_mode, requires_approval)",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Booking not found");
    const product = (row as { booking_products: { name: string; payment_mode: "full" | "deposit" | "invoice"; requires_approval: boolean } | null }).booking_products;
    const amountDueCents =
      product?.payment_mode === "deposit" ? row.deposit_due_cents ?? 0 : row.price_total_cents ?? 0;
    return {
      bookingId: row.id,
      productName: product?.name ?? "Booking",
      paymentMode: product?.payment_mode ?? "full",
      requiresApproval: product?.requires_approval ?? false,
      amountDueCents,
      priceTotalCents: row.price_total_cents,
      amountPaidCents: row.amount_paid_cents ?? 0,
      paymentStatus: row.payment_status,
      status: row.status,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      startsAt: row.starts_at,
      provider: "mock" as const,
    };
  });

export const completeMockPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        bookingId: z.string().uuid(),
        outcome: z.enum(["paid", "failed"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Use admin client so guest checkouts (no auth session) can complete the
    // mock payment. In a real integration this is the webhook handler, which
    // always runs as a trusted server caller.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: loadErr } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, price_total_cents, deposit_due_cents, status, payment_status, booking_products(payment_mode, requires_approval)",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (loadErr) throw new Error(loadErr.message);
    if (!row) throw new Error("Booking not found");
    const product = (row as { booking_products: { payment_mode: "full" | "deposit" | "invoice"; requires_approval: boolean } | null }).booking_products;
    const mode = product?.payment_mode ?? "full";
    const requiresApproval = product?.requires_approval ?? false;

    if (data.outcome === "failed") {
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("id", data.bookingId);
      if (error) throw new Error(error.message);
      return { ok: true, status: row.status, paymentStatus: "failed" as const };
    }

    // Paid path
    const amountPaid =
      mode === "deposit" ? row.deposit_due_cents ?? 0 : row.price_total_cents ?? 0;
    const paymentStatus = mode === "deposit" ? "deposit_paid" : "paid";
    const status = requiresApproval ? "pending" : "confirmed";

    const patch: Record<string, unknown> = {
      payment_status: paymentStatus,
      amount_paid_cents: amountPaid,
      status,
    };
    if (status === "confirmed") {
      patch.approved_at = new Date().toISOString();
    }
    const { error } = await supabaseAdmin.from("bookings").update(patch).eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true, status, paymentStatus };
  });