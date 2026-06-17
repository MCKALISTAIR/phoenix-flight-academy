import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ORG_ID } from "@/lib/constants";

const emailSchema = z.string().trim().email().max(255);

export const submitAdminRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: emailSchema,
        message: z.string().trim().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();

    // Look up if there's an existing auth user for this email (optional link)
    let requestedUserId: string | null = null;
    try {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      requestedUserId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    } catch {
      requestedUserId = null;
    }

    // Prevent duplicate pending requests for the same email
    const { data: existing } = await supabaseAdmin
      .from("admin_requests")
      .select("id")
      .eq("status", "pending")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return { ok: true, duplicate: true };
    }

    const { error } = await supabaseAdmin.from("admin_requests").insert({
      email,
      message: data.message ?? null,
      requested_user_id: requestedUserId,
      organization_id: DEFAULT_ORG_ID,
    });
    if (error) throw new Error(error.message);

    return { ok: true, duplicate: false };
  });

export const listAdminRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("admin_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { requests: data ?? [] };
  });

export const reviewAdminRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approve", "reject"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Confirm caller is super_admin (RLS would also block, but fail fast with clear error)
    const { data: isSuper } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });
    if (!isSuper) throw new Error("Forbidden: super_admin required");

    const { data: req, error: fetchErr } = await supabaseAdmin
      .from("admin_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (fetchErr) throw new Error(fetchErr.message);
    if (!req) throw new Error("Request not found");
    if (req.status !== "pending") {
      throw new Error(`Request already ${req.status}`);
    }

    if (data.action === "approve") {
      // Find the auth user for this email
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (listErr) throw new Error(listErr.message);
      const target = list.users.find(
        (u) => u.email?.toLowerCase() === req.email.toLowerCase(),
      );
      if (!target) {
        throw new Error(
          "No account exists for that email. Ask them to sign up first, then approve.",
        );
      }

      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: target.id, role: "super_admin" },
          { onConflict: "user_id,role" },
        );
      if (roleErr) throw new Error(roleErr.message);
    }

    const { error: updErr } = await supabaseAdmin
      .from("admin_requests")
      .update({
        status: data.action === "approve" ? "approved" : "rejected",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true };
  });