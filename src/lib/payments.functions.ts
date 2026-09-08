import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

type CheckoutResult = { clientSecret: string } | { error: string };

// Tax code for flight training / aircraft hire services (general services).
const SERVICES_TAX_CODE = "txcd_20030000";

/**
 * Public checkout session read. Guests have no RLS read on bookings, so this
 * runs server-side — the booking id (an unguessable uuid from the checkout
 * link) is the bearer of access, same trust model as the confirmation page.
 */
export const getPublicCheckoutSession = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, price_total_cents, deposit_due_cents, amount_paid_cents, payment_status, status, customer_email, customer_name, starts_at, booking_products(name, payment_mode, requires_approval)",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Booking not found");

    const product = (
      row as {
        booking_products: {
          name: string;
          payment_mode: "full" | "deposit" | "invoice";
          requires_approval: boolean;
        } | null;
      }
    ).booking_products;
    const amountDueCents =
      product?.payment_mode === "deposit"
        ? (row.deposit_due_cents ?? 0)
        : (row.price_total_cents ?? 0);
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
    };
  });

/**
 * REAL CHECKOUT INITIATOR
 * -----------------------
 * Creates an embedded checkout session for the amount due on a booking
 * (deposit or full, computed server-side from the booking record — the
 * client can never name its own price). The webhook at
 * /api/public/payments/webhook applies the paid status transitions; this
 * function only starts the session.
 */
export const createBookingCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        bookingId: z.string().uuid(),
        returnUrl: z.string().url(),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      // Guest checkouts have no auth session, so read via the privileged
      // client — the booking id itself is the bearer of access here, same
      // trust model as the mock layer and the confirmation page.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: row, error } = await supabaseAdmin
        .from("bookings")
        .select(
          "id, price_total_cents, deposit_due_cents, payment_status, status, customer_email, customer_name, starts_at, booking_products(name, payment_mode)",
        )
        .eq("id", data.bookingId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!row) throw new Error("Booking not found");

      const product = (
        row as { booking_products: { name: string; payment_mode: string } | null }
      ).booking_products;
      const mode = product?.payment_mode ?? "full";

      if (mode === "invoice") {
        throw new Error("This booking is billed by invoice — no online payment needed.");
      }
      if (row.payment_status === "paid" || row.payment_status === "deposit_paid") {
        throw new Error("This booking has already been paid.");
      }
      if (row.status === "cancelled") {
        throw new Error("This booking has been cancelled.");
      }

      const amountDueCents =
        mode === "deposit" ? (row.deposit_due_cents ?? 0) : (row.price_total_cents ?? 0);
      if (amountDueCents < 50) {
        throw new Error("Amount due must be at least £0.50.");
      }

      const stripe = createStripeClient(data.environment as StripeEnv);

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: product?.name ?? "Phoenix Flight Training Booking",
                description:
                  mode === "deposit"
                    ? `Deposit — ${new Date(row.starts_at).toLocaleDateString("en-GB")}`
                    : `Flight on ${new Date(row.starts_at).toLocaleDateString("en-GB")}`,
                tax_code: SERVICES_TAX_CODE,
              },
              unit_amount: amountDueCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer_email: row.customer_email,
        // Tax calculation and collection at checkout; the school handles
        // registration, filing and remittance.
        automatic_tax: { enabled: true },
        payment_intent_data: {
          description: `${product?.name ?? "Flight booking"} — Phoenix Flight Training`,
        },
        metadata: {
          bookingId: row.id,
          paymentMode: mode,
        },
      });

      await supabaseAdmin
        .from("bookings")
        .update({ stripe_session_id: session.id })
        .eq("id", row.id);

      return { clientSecret: session.client_secret ?? "" };
    } catch (err) {
      return { error: getStripeErrorMessage(err) };
    }
  });
