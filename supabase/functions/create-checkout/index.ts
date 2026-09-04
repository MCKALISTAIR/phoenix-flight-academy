import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  bookingId: string;
  origin?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured in Supabase Edge Function secrets.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL or Service Role Key missing in environment.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { bookingId, origin }: RequestBody = await req.json();

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "bookingId is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retrieve booking details
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, price_total_cents, deposit_due_cents, customer_email, customer_name, starts_at, booking_products(name, payment_mode, requires_approval)",
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: bookingErr?.message ?? "Booking not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const product = booking.booking_products as {
      name: string;
      payment_mode: "full" | "deposit" | "invoice";
      requires_approval: boolean;
    } | null;
    const mode = product?.payment_mode ?? "full";
    const amountDueCents =
      mode === "deposit" ? (booking.deposit_due_cents ?? 0) : booking.price_total_cents;

    if (amountDueCents <= 0) {
      return new Response(JSON.stringify({ error: "Amount due must be greater than zero." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const baseOrigin = origin || req.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${baseOrigin}/booking/confirm/${booking.id}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseOrigin}/booking/checkout/${booking.id}`;

    const description =
      mode === "deposit"
        ? `Deposit for ${product?.name ?? "Flight Training"} (${new Date(booking.starts_at).toLocaleDateString("en-GB")})`
        : `${product?.name ?? "Flight Training"} (${new Date(booking.starts_at).toLocaleDateString("en-GB")})`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: amountDueCents,
            product_data: {
              name: product?.name ?? "Phoenix Flight Academy Booking",
              description,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: booking.customer_email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: booking.id,
        paymentMode: mode,
      },
    });

    // Store the stripe session ID on the booking record
    await supabaseAdmin
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
