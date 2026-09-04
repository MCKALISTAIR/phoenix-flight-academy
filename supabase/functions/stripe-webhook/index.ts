import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey || !webhookSecret) {
      throw new Error("STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is missing.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL or Service Role Key missing in environment.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No stripe-signature header." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const bodyText = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(bodyText, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Webhook signature verification failed: ${msg}`);
      return new Response(JSON.stringify({ error: `Signature verification failed: ${msg}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Received Stripe event: ${event.type} (${event.id})`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        console.warn("checkout.session.completed received with no bookingId metadata.");
        return new Response(JSON.stringify({ received: true, warning: "no_booking_id" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Query booking details to determine status transition
      const { data: booking, error: fetchErr } = await supabaseAdmin
        .from("bookings")
        .select(
          "id, status, payment_status, deposit_due_cents, price_total_cents, booking_products(payment_mode, requires_approval)",
        )
        .eq("id", bookingId)
        .maybeSingle();

      if (fetchErr || !booking) {
        console.error(`Booking ${bookingId} not found in database:`, fetchErr);
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const product = booking.booking_products as {
        payment_mode: "full" | "deposit" | "invoice";
        requires_approval: boolean;
      } | null;
      const mode = product?.payment_mode ?? "full";
      const requiresApproval = product?.requires_approval ?? false;

      const paymentStatus = mode === "deposit" ? "deposit_paid" : "paid";
      const bookingStatus = requiresApproval ? "pending" : "confirmed";
      const amountPaid =
        session.amount_total ??
        (mode === "deposit" ? (booking.deposit_due_cents ?? 0) : booking.price_total_cents);

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      const patch = {
        payment_status: paymentStatus as "deposit_paid" | "paid",
        amount_paid_cents: amountPaid,
        status: bookingStatus as "pending" | "confirmed",
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        ...(bookingStatus === "confirmed" ? { approved_at: new Date().toISOString() } : {}),
      };

      const { error: updateErr } = await supabaseAdmin
        .from("bookings")
        .update(patch)
        .eq("id", bookingId);

      if (updateErr) {
        console.error(`Failed to update booking ${bookingId}:`, updateErr);
        throw new Error(updateErr.message);
      }

      console.log(
        `Booking ${bookingId} updated successfully: status=${bookingStatus}, payment_status=${paymentStatus}`,
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook processing error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
