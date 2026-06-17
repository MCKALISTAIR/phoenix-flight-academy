import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ORG_ID } from "@/lib/constants";

export const getMySelfHireStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("self_hire_approvals")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { approved: false as const };
    const active = !data.revoked_at && (!data.expires_at || new Date(data.expires_at) > new Date());
    return { approved: active, record: data };
  });

export const listSelfHireApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("self_hire_approvals")
      .select("*, profiles!self_hire_approvals_user_id_fkey(display_name)")
      .order("approved_at", { ascending: false });
    // Profiles fk may not exist; gracefully degrade
    if (error) {
      const fallback = await context.supabase
        .from("self_hire_approvals")
        .select("*")
        .order("approved_at", { ascending: false });
      if (fallback.error) throw new Error(fallback.error.message);
      return fallback.data ?? [];
    }
    return data ?? [];
  });

export const approveSelfHire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        expires_at: z.string().datetime().nullable().optional(),
        notes: z.string().max(500).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("self_hire_approvals").upsert(
      {
        user_id: data.user_id,
        approved_by: context.userId,
        approved_at: new Date().toISOString(),
        expires_at: data.expires_at ?? null,
        revoked_at: null,
        notes: data.notes ?? null,
        organization_id: DEFAULT_ORG_ID,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokeSelfHire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("self_hire_approvals")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });