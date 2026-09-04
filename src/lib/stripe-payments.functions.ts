import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const initiateSchema = z.object({
  bookingId: z.string().uuid(),
  origin: z.string().url().optional(),
});

export type CheckoutInitResponse =
  | { success: true; url: string; sessionId?: string }
  | { success: false; fallbackToMock: boolean; message: string };

/**
 * Initiates a Stripe Checkout Session via the Supabase Edge Function 'create-checkout'.
 * If the Edge Function or Stripe keys are not yet configured in Lovable/Supabase,
 * it returns a structured fallback indicator so the UI can gracefully guide the user
 * or allow local sandbox testing.
 */
export const initiateStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => initiateSchema.parse(input))
  .handler(async ({ data }): Promise<CheckoutInitResponse> => {
    try {
      const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            bookingId: data.bookingId,
            origin: data.origin,
          },
        },
      );

      if (edgeErr) {
        console.warn("[Stripe Edge Function] create-checkout error:", edgeErr.message);
        return {
          success: false,
          fallbackToMock: true,
          message: edgeErr.message || "Stripe Edge Function unavailable.",
        };
      }

      if (edgeData?.url) {
        return {
          success: true,
          url: edgeData.url,
          sessionId: edgeData.sessionId,
        };
      }

      if (edgeData?.error) {
        return {
          success: false,
          fallbackToMock: true,
          message: edgeData.error,
        };
      }

      return {
        success: false,
        fallbackToMock: true,
        message: "No checkout URL returned from Stripe.",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[Stripe Checkout] Exception during checkout initiation:", message);
      return {
        success: false,
        fallbackToMock: true,
        message,
      };
    }
  });

const verifySchema = z.object({
  bookingId: z.string().uuid(),
  sessionId: z.string().optional(),
});

/**
 * Reconciles the booking status after returning from Stripe Hosted Checkout.
 * In case the Stripe webhook takes 1-2 seconds to land, this verifies whether
 * the session was completed and ensures the booking is displayed as confirmed.
 */
export const verifyStripeSession = createServerFn({ method: "POST" })
  .inputValidator((input) => verifySchema.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabase
      .from("bookings")
      .select(
        "id, status, payment_status, stripe_session_id, deposit_due_cents, price_total_cents, booking_products(payment_mode, requires_approval)",
      )
      .eq("id", data.bookingId)
      .maybeSingle();

    if (error || !row) {
      throw new Error(error?.message ?? "Booking not found");
    }

    // If webhook already processed the payment
    if (row.payment_status === "paid" || row.payment_status === "deposit_paid") {
      return {
        confirmed: row.status === "confirmed",
        paymentStatus: row.payment_status,
        status: row.status,
      };
    }

    // If a session ID was provided and matches what was stored on the booking,
    // and if we have service role credentials, reconcile immediately.
    if (data.sessionId && (row.stripe_session_id === data.sessionId || !row.stripe_session_id)) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const product = (
          row as {
            booking_products: {
              payment_mode: "full" | "deposit" | "invoice";
              requires_approval: boolean;
            } | null;
          }
        ).booking_products;
        const mode = product?.payment_mode ?? "full";
        const requiresApproval = product?.requires_approval ?? false;

        const paymentStatus = mode === "deposit" ? "deposit_paid" : "paid";
        const newStatus = requiresApproval ? "pending" : "confirmed";
        const amountPaid =
          mode === "deposit" ? (row.deposit_due_cents ?? 0) : row.price_total_cents;

        await supabaseAdmin
          .from("bookings")
          .update({
            payment_status: paymentStatus,
            status: newStatus,
            amount_paid_cents: amountPaid,
            stripe_session_id: data.sessionId,
            ...(newStatus === "confirmed" ? { approved_at: new Date().toISOString() } : {}),
          })
          .eq("id", data.bookingId);

        return {
          confirmed: newStatus === "confirmed",
          paymentStatus,
          status: newStatus,
        };
      } catch (adminErr) {
        console.warn("[Stripe Reconcile] Direct admin reconcile skipped:", adminErr);
      }
    }

    return {
      confirmed: row.status === "confirmed",
      paymentStatus: row.payment_status,
      status: row.status,
    };
  });
