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
      .order("approved_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const record = data?.[0];
    if (!record) return { approved: false as const };
    const active =
      !record.revoked_at && (!record.expires_at || new Date(record.expires_at) > new Date());
    return { approved: active, record };
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
    const payload = {
      approved_by: context.userId,
      approved_at: new Date().toISOString(),
      expires_at: data.expires_at ?? null,
      revoked_at: null,
      notes: data.notes ?? null,
      organization_id: DEFAULT_ORG_ID,
    };

    // Only one active approval per pilot is allowed (partial unique index on
    // user_id WHERE revoked_at IS NULL), so refresh an existing active row and
    // only insert when there isn't one.
    const { data: updated, error: updateError } = await context.supabase
      .from("self_hire_approvals")
      .update(payload)
      .eq("user_id", data.user_id)
      .is("revoked_at", null)
      .select("id");
    if (updateError) throw new Error(updateError.message);
    if ((updated?.length ?? 0) > 0) return { ok: true };

    const { error } = await context.supabase
      .from("self_hire_approvals")
      .insert({ user_id: data.user_id, ...payload });
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
      .eq("user_id", data.user_id)
      .is("revoked_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
