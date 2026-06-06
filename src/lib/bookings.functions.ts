import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function computePrice(
  product: {
    kind: "experience" | "lesson" | "self_hire";
    duration_minutes: number;
    package_price_cents: number | null;
    instructor_fee_per_hour_cents: number | null;
    payment_mode: "full" | "deposit" | "invoice";
    deposit_pct: number;
  },
  aircraft: { rate_wet: number | null } | null,
  discount?: { discountType: "percentage" | "fixed_amount"; discountValue: number } | null,
): { totalCents: number; depositCents: number; discountAppliedCents: number } {
  const hours = product.duration_minutes / 60;
  const wetCents = aircraft?.rate_wet ? Math.round(Number(aircraft.rate_wet) * 100) : 0;
  let baseCents = 0;
  if (product.kind === "experience") {
    baseCents = product.package_price_cents ?? 0;
  } else if (product.kind === "lesson") {
    baseCents = Math.round(wetCents * hours + (product.instructor_fee_per_hour_cents ?? 0) * hours);
  } else {
    baseCents = Math.round(wetCents * hours);
  }

  let discountAppliedCents = 0;
  if (discount) {
    if (discount.discountType === "percentage") {
      discountAppliedCents = Math.round((baseCents * discount.discountValue) / 100);
    } else {
      discountAppliedCents = Math.min(discount.discountValue, baseCents);
    }
  }
  const totalCents = Math.max(0, baseCents - discountAppliedCents);

  const depositCents =
    product.payment_mode === "deposit"
      ? Math.round((totalCents * product.deposit_pct) / 100)
      : product.payment_mode === "full"
      ? totalCents
      : 0;
  return { totalCents, depositCents, discountAppliedCents };
}

const createSchema = z.object({
  productSlug: z.string().min(1).max(120),
  aircraftId: z.string().uuid().nullable().optional(),
  instructorId: z.string().uuid().nullable().optional(),
  startsAt: z.string().datetime(),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email().max(255),
  customerPhone: z.string().max(40).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  promoCode: z.string().max(40).nullable().optional(),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => createSchema.parse(input))
  .handler(async ({ data }) => {
    // Load product, aircraft, and (optionally) the auth user
    const productRes = await supabase
      .from("booking_products")
      .select("*")
      .eq("slug", data.productSlug)
      .eq("published", true)
      .maybeSingle();
    if (productRes.error) throw new Error(productRes.error.message);
    const product = productRes.data;
    if (!product) throw new Error("Product not found");

    let aircraft: { id: string; rate_wet: number | null } | null = null;
    if (data.aircraftId) {
      const r = await supabase
        .from("aircraft")
        .select("id, rate_wet")
        .eq("id", data.aircraftId)
        .maybeSingle();
      if (r.error) throw new Error(r.error.message);
      aircraft = r.data;
    }

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;

    // Guards by product kind
    if (product.kind === "lesson") {
      if (!userId) throw new Error("Lessons require a signed-in student account");
      const s = await supabase.from("students").select("id").eq("user_id", userId).maybeSingle();
      if (!s.data) throw new Error("Only enrolled students can book lessons. Contact the school to enroll.");
    }
    if (product.kind === "self_hire") {
      if (!userId) throw new Error("Self-hire requires sign-in");
      const a = await supabase
        .from("self_hire_approvals")
        .select("id, revoked_at, expires_at")
        .eq("user_id", userId)
        .maybeSingle();
      const ok =
        a.data &&
        !a.data.revoked_at &&
        (!a.data.expires_at || new Date(a.data.expires_at) > new Date());
      if (!ok) throw new Error("You are not approved for self-hire. Contact the school for approval.");
    }

    const starts = new Date(data.startsAt);
    const ends = new Date(starts.getTime() + product.duration_minutes * 60_000);

    // Conflict check (server-authoritative)
    if (data.aircraftId) {
      const c = await supabase
        .from("bookings")
        .select("id")
        .eq("aircraft_id", data.aircraftId)
        .in("status", ["pending", "confirmed"])
        .lt("starts_at", ends.toISOString())
        .gt("ends_at", starts.toISOString())
        .limit(1);
      if ((c.data ?? []).length) throw new Error("That aircraft is no longer available for the selected slot");
    }
    if (data.instructorId) {
      const c = await supabase
        .from("bookings")
        .select("id")
        .eq("instructor_id", data.instructorId)
        .in("status", ["pending", "confirmed"])
        .lt("starts_at", ends.toISOString())
        .gt("ends_at", starts.toISOString())
        .limit(1);
      if ((c.data ?? []).length) throw new Error("That instructor is no longer available for the selected slot");
    }

    // Validate promo code if supplied
    let appliedDiscount: { discountType: "percentage" | "fixed_amount"; discountValue: number; promoId: string } | null = null;
    let validatedPromoCode: string | null = null;
    if (data.promoCode) {
      const code = data.promoCode.toUpperCase();
      const now = new Date();
      const { data: promo, error: promoErr } = await supabase
        .from("booking_promotions")
        .select("id, code, discount_type, discount_value, applies_to_kinds, active_from, active_until, max_uses, uses_count, published")
        .eq("code", code)
        .eq("published", true)
        .maybeSingle();
      if (!promoErr && promo) {
        const kinds = (promo.applies_to_kinds ?? []) as string[];
        const notExpired = !promo.active_until || new Date(promo.active_until) > now;
        const notStarted = new Date(promo.active_from) > now;
        const notExhausted = promo.max_uses === null || promo.uses_count < promo.max_uses;
        const kindMatch = kinds.length === 0 || kinds.includes(product.kind);
        if (!notStarted && notExpired && notExhausted && kindMatch) {
          appliedDiscount = { discountType: promo.discount_type as "percentage" | "fixed_amount", discountValue: promo.discount_value, promoId: promo.id };
          validatedPromoCode = code;
        }
      }
    }

    const { totalCents, depositCents, discountAppliedCents } = computePrice(product, aircraft, appliedDiscount);

    const status: "pending" =
      product.payment_mode === "invoice"
        ? "pending"
        : product.requires_approval
        ? "pending"
        : product.payment_mode === "full"
        ? "pending" // will flip to confirmed once Stripe webhook lands
        : "pending";

    const insertPayload = {
      product_id: product.id,
      aircraft_id: data.aircraftId ?? null,
      instructor_id: data.instructorId ?? null,
      user_id: userId,
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      customer_phone: data.customerPhone ?? null,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status,
      payment_status: "unpaid" as const,
      price_total_cents: totalCents,
      deposit_due_cents: depositCents,
      notes: data.notes ?? null,
      promo_code: validatedPromoCode,
      discount_applied_cents: discountAppliedCents,
    };

    const ins = await supabase.from("bookings").insert(insertPayload).select("id").single();
    if (ins.error) throw new Error(ins.error.message);

    // Increment uses_count on the promo (read-then-write; safe for low concurrency flight school volume)
    if (appliedDiscount) {
      const { data: cur } = await supabase
        .from("booking_promotions")
        .select("uses_count")
        .eq("id", appliedDiscount.promoId)
        .maybeSingle();
      if (cur) {
        await supabase
          .from("booking_promotions")
          .update({ uses_count: cur.uses_count + 1 })
          .eq("id", appliedDiscount.promoId);
      }
    }

    return {
      id: ins.data.id,
      paymentMode: product.payment_mode,
      totalCents,
      depositCents,
      discountAppliedCents,
      promoCode: validatedPromoCode,
      requiresApproval: product.requires_approval,
    };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, booking_products(name, kind, payment_mode), aircraft(registration, model), instructors(name)")
      .eq("user_id", context.userId)
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        status: z
          .enum(["pending", "confirmed", "cancelled", "completed", "no_show"])
          .nullable()
          .optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bookings")
      .select("*, booking_products(name, kind, payment_mode), aircraft(registration, model), instructors(name)")
      .order("starts_at", { ascending: false })
      .limit(500);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]),
        cancellation_reason: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      status: typeof data.status;
      approved_at?: string;
      approved_by?: string;
      cancelled_at?: string;
      cancellation_reason?: string | null;
    } = { status: data.status };
    if (data.status === "confirmed") {
      patch.approved_at = new Date().toISOString();
      patch.approved_by = context.userId;
    }
    if (data.status === "cancelled") {
      patch.cancelled_at = new Date().toISOString();
      patch.cancellation_reason = data.cancellation_reason ?? null;
    }
    const { error } = await context.supabase.from("bookings").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getBookingById = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabase
      .from("bookings")
      .select("*, booking_products(name, kind, payment_mode), aircraft(registration, model), instructors(name)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });