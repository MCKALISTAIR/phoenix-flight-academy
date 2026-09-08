import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

/**
 * PAYMENTS WEBHOOK
 * ----------------
 * Receives payment events and applies the booking status transitions —
 * the same contract the mock payment layer used (payment_status +
 * status + approved_at). Signature is verified before any write.
 */
async function fulfillBooking(session: Record<string, any>) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.warn("Payment session completed with no bookingId metadata:", session.id);
    return;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, status, payment_status, deposit_due_cents, price_total_cents, booking_products(payment_mode, requires_approval)",
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    console.error(`Booking ${bookingId} not found for session ${session.id}:`, fetchErr);
    throw new Error("Booking not found");
  }

  // Idempotent: a paid booking is already fulfilled.
  if (booking.payment_status === "paid" || booking.payment_status === "deposit_paid") {
    return;
  }

  const product = (
    booking as {
      booking_products: { payment_mode: string; requires_approval: boolean } | null;
    }
  ).booking_products;
  const mode = product?.payment_mode ?? "full";
  const requiresApproval = product?.requires_approval ?? false;

  const paymentStatus = mode === "deposit" ? "deposit_paid" : "paid";
  const status = requiresApproval ? "pending" : "confirmed";
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const { error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      amount_paid_cents:
        session.amount_total ??
        (mode === "deposit" ? (booking.deposit_due_cents ?? 0) : booking.price_total_cents),
      status,
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      ...(status === "confirmed" ? { approved_at: new Date().toISOString() } : {}),
    })
    .eq("id", bookingId);

  if (updateErr) throw new Error(updateErr.message);
  console.log(`Booking ${bookingId} fulfilled: status=${status}, payment_status=${paymentStatus}`);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid or missing env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);

          switch (event.type) {
            case "checkout.session.completed":
            case "transaction.completed": {
              const session = event.data.object as Record<string, any>;
              // "unpaid" means a delayed-notification method was submitted
              // but hasn't settled — wait for the async events.
              if (session.payment_status && session.payment_status !== "unpaid") {
                await fulfillBooking(session);
              } else if (!session.payment_status) {
                // transaction.completed is a settled payment — fulfill.
                await fulfillBooking(session);
              }
              break;
            }
            case "checkout.session.async_payment_succeeded":
              await fulfillBooking(event.data.object);
              break;
            case "checkout.session.async_payment_failed":
            case "transaction.payment_failed":
              // Booking stays unpaid; customer can retry from checkout.
              console.log("Payment failed event:", event.data.object?.id);
              break;
            default:
              console.log("Unhandled payment event:", event.type);
          }

          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
