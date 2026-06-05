import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listPublishedBookingProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("booking_products")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listAllBookingProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("booking_products")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBookingProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabase
      .from("booking_products")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  kind: z.enum(["experience", "lesson", "self_hire"]),
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  duration_minutes: z.number().int().min(15).max(600),
  package_price_cents: z.number().int().min(0).nullable().optional(),
  instructor_fee_per_hour_cents: z.number().int().min(0).nullable().optional(),
  payment_mode: z.enum(["full", "deposit", "invoice"]),
  deposit_pct: z.number().int().min(0).max(100),
  requires_approval: z.boolean(),
  cancellation_hours: z.number().int().min(0).max(720),
  min_notice_hours: z.number().int().min(0).max(720),
  max_advance_days: z.number().int().min(1).max(365),
  display_order: z.number().int().min(0).max(999),
  published: z.boolean(),
});

export const upsertBookingProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...rest } = data;
    if (id) {
      const { error } = await supabase.from("booking_products").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await supabase
      .from("booking_products")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteBookingProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("booking_products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });