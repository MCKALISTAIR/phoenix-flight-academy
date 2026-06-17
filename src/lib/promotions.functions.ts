import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ORG_ID } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Promotion = {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  applies_to_kinds: string[];
  active_from: string;
  active_until: string | null;
  max_uses: number | null;
  uses_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

// ─── List all promotions (CMS) ────────────────────────────────────────────────

export const listAllPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("booking_promotions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Promotion[];
  });

// ─── Upsert a promotion (CMS) ─────────────────────────────────────────────────

const promoSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(40).transform((v) => v.toUpperCase()),
  name: z.string().min(1).max(120),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().int().min(0),
  applies_to_kinds: z.array(z.string()).default([]),
  active_from: z.string().datetime(),
  active_until: z.string().datetime().nullable().optional(),
  max_uses: z.number().int().min(0).nullable().optional(),
  published: z.boolean().default(true),
});

export const upsertPromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => promoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const payload = {
      code: data.code,
      name: data.name,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      applies_to_kinds: data.applies_to_kinds,
      active_from: data.active_from,
      active_until: data.active_until ?? null,
      max_uses: data.max_uses ?? null,
      published: data.published,
    };

    if (data.id) {
      const { error } = await context.supabase
        .from("booking_promotions")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    } else {
      const { error } = await context.supabase
        .from("booking_promotions")
        .insert({ ...payload, organization_id: DEFAULT_ORG_ID });
      if (error) throw new Error(error.message);
      return { ok: true };
    }
  });

// ─── Delete a promotion (CMS) ─────────────────────────────────────────────────

export const deletePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_promotions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─── Check / validate a promo code (public) ───────────────────────────────────

export const checkPromoCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z.string().min(1).max(40),
        productKind: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const code = data.code.toUpperCase();
    const { data: row, error } = await supabase
      .from("booking_promotions")
      .select("*")
      .eq("code", code)
      .eq("published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return { valid: false, reason: "Code not found." } as const;

    const now = new Date();
    if (new Date(row.active_from) > now)
      return { valid: false, reason: "This code is not yet active." } as const;
    if (row.active_until && new Date(row.active_until) < now)
      return { valid: false, reason: "This code has expired." } as const;
    if (row.max_uses !== null && row.uses_count >= row.max_uses)
      return { valid: false, reason: "This code has reached its usage limit." } as const;

    const kinds = (row.applies_to_kinds ?? []) as string[];
    if (kinds.length > 0 && !kinds.includes(data.productKind))
      return { valid: false, reason: "This code does not apply to this product." } as const;

    return {
      valid: true as const,
      promoId: row.id as string,
      code: row.code as string,
      discountType: row.discount_type as "percentage" | "fixed_amount",
      discountValue: row.discount_value as number,
    };
  });
