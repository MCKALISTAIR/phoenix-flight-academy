import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uuid = z.string().uuid();

// ---- Customer self-service ----

export const getMyCustomerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, latest, selfHire] = await Promise.all([
      supabase.from("customer_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("pilot_verification_requests")
        .select("*")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("self_hire_approvals").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (profile.error) throw new Error(profile.error.message);
    if (latest.error) throw new Error(latest.error.message);
    if (selfHire.error) throw new Error(selfHire.error.message);
    return {
      profile: profile.data,
      latestRequest: latest.data,
      selfHire: selfHire.data,
    };
  });

export const becomeStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("set_self_as_student");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const verificationSchema = z.object({
  licence_number: z.string().trim().min(2).max(64),
  issuing_authority: z.string().trim().min(2).max(120),
  licence_expiry: z.string().date().nullable().optional(),
  medical_expiry: z.string().date().nullable().optional(),
  ratings: z.string().max(500).nullable().optional(),
  document_path: z.string().max(500).nullable().optional(),
  medical_document_path: z.string().max(500).nullable().optional(),
});

export const submitPilotVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => verificationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Block if there is already a pending request
    const existing = await supabase
      .from("pilot_verification_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) throw new Error("You already have a pending verification request.");

    const { data: row, error } = await supabase
      .from("pilot_verification_requests")
      .insert({
        user_id: userId,
        licence_number: data.licence_number,
        issuing_authority: data.issuing_authority,
        licence_expiry: data.licence_expiry ?? null,
        medical_expiry: data.medical_expiry ?? null,
        ratings: data.ratings ?? null,
        document_path: data.document_path ?? null,
        medical_document_path: data.medical_document_path ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const withdrawPilotVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pilot_verification_requests")
      .update({ status: "withdrawn" })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Staff review ----

export const listPilotVerifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ status: z.enum(["pending", "approved", "rejected", "withdrawn", "all"]).optional() })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("pilot_verification_requests")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const reviewPilotVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: uuid,
        decision: z.enum(["approved", "rejected"]),
        notes: z.string().max(1000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("pilot_verification_requests")
      .update({
        status: data.decision,
        review_notes: data.notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createSignedDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ path: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("pilot-documents")
      .createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });