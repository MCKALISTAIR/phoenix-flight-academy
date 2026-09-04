import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEFAULT_ORG_ID } from "@/lib/constants";

const STAFF_ROLES = ["super_admin", "admin", "instructor"] as const;

async function assertStaff(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: staff role required");
  }
}

export const listSyllabus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("syllabus_exercises")
      .select("*")
      .order("exercise_number");
    if (error) throw new Error(error.message);
    return { exercises: data ?? [] };
  });

export const listAircraftLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("aircraft")
      .select("id, registration, model")
      .order("registration");
    if (error) throw new Error(error.message);
    return { aircraft: data ?? [] };
  });

const exerciseEntrySchema = z.object({
  exercise_id: z.string().uuid(),
  grade: z.enum(["intro", "practiced", "competent", "review"]).default("intro"),
  notes: z.string().max(500).optional().nullable(),
});

export const createFlightLogEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        student_id: z.string().uuid(),
        aircraft_id: z.string().uuid().optional().nullable(),
        aircraft_registration: z.string().min(1).max(20),
        aircraft_model: z.string().min(1).max(100),
        flight_date: z.string().min(8),
        departure_aerodrome: z.string().min(1).max(20),
        arrival_aerodrome: z.string().min(1).max(20),
        off_blocks_at: z.string(),
        on_blocks_at: z.string(),
        pic_name: z.string().min(1).max(120),
        capacity: z.enum(["dual", "pic", "put", "picus", "instructor", "examiner"]),
        landings_day: z.number().int().min(0).max(50).default(0),
        landings_night: z.number().int().min(0).max(50).default(0),
        night_minutes: z.number().int().min(0).max(1440).default(0),
        ifr_minutes: z.number().int().min(0).max(1440).default(0),
        single_pilot_se_minutes: z.number().int().min(0).max(1440).default(0),
        single_pilot_me_minutes: z.number().int().min(0).max(1440).default(0),
        multi_pilot_minutes: z.number().int().min(0).max(1440).default(0),
        dual_received_minutes: z.number().int().min(0).max(1440).default(0),
        instructor_given_minutes: z.number().int().min(0).max(1440).default(0),
        fstd_type: z.string().max(50).optional().nullable(),
        fstd_minutes: z.number().int().min(0).max(1440).default(0),
        remarks: z.string().max(2000).optional().nullable(),
        exercises: z.array(exerciseEntrySchema).max(25).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const off = new Date(data.off_blocks_at).getTime();
    const on = new Date(data.on_blocks_at).getTime();
    if (!Number.isFinite(off) || !Number.isFinite(on) || on <= off) {
      throw new Error("On-blocks must be after off-blocks");
    }
    const total_minutes = Math.round((on - off) / 60000);

    const { exercises, ...row } = data;
    const { data: inserted, error } = await supabaseAdmin
      .from("flight_log_entries")
      .insert({
        ...row,
        total_minutes,
        instructor_user_id: context.userId,
        signed_by_user_id: context.userId,
        signed_at: new Date().toISOString(),
        organization_id: DEFAULT_ORG_ID,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (exercises.length) {
      const { error: exErr } = await supabaseAdmin.from("flight_log_exercises").insert(
        exercises.map((e) => ({
          flight_log_entry_id: inserted.id,
          exercise_id: e.exercise_id,
          grade: e.grade,
          notes: e.notes ?? null,
          organization_id: DEFAULT_ORG_ID,
        })),
      );
      if (exErr) throw new Error(exErr.message);
    }

    return { entry: inserted };
  });

export const deleteFlightLogEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin.from("flight_log_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ===== Documents ===== */

export const upsertStudentDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        student_id: z.string().uuid(),
        document_type: z.enum([
          "medical_class1",
          "medical_class2",
          "medical_lapl",
          "student_pilot_license",
          "ppl",
          "lapl",
          "rt_license",
          "passport",
          "photo_id",
          "language_proficiency",
          "other",
        ]),
        document_number: z.string().max(80).optional().nullable(),
        issued_on: z.string().optional().nullable(),
        expires_on: z.string().optional().nullable(),
        issuing_authority: z.string().max(120).optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabaseAdmin.from("student_documents").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("student_documents")
        .insert({ ...data, organization_id: DEFAULT_ORG_ID });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteStudentDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin.from("student_documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ===== Endorsements ===== */

export const createEndorsement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        student_id: z.string().uuid(),
        endorsement_type: z.enum([
          "first_solo",
          "solo_circuits",
          "solo_local",
          "solo_nav",
          "solo_cross_country",
          "type_endorsement",
          "night_rating",
          "differences_training",
          "other",
        ]),
        title: z.string().min(1).max(200),
        details: z.string().max(2000).optional().nullable(),
        valid_until: z.string().optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin.from("student_endorsements").insert({
      ...data,
      signed_by_user_id: context.userId,
      organization_id: DEFAULT_ORG_ID,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEndorsement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin.from("student_endorsements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ===== Theory exams ===== */

export const upsertTheoryResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        student_id: z.string().uuid(),
        subject: z.string().min(1).max(120),
        result: z.enum(["pass", "fail", "pending"]).default("pending"),
        score: z.number().min(0).max(100).optional().nullable(),
        taken_on: z.string().optional().nullable(),
        notes: z.string().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabaseAdmin.from("theory_exam_results").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("theory_exam_results")
        .insert({ ...data, recorded_by_user_id: context.userId, organization_id: DEFAULT_ORG_ID });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteTheoryResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await supabaseAdmin.from("theory_exam_results").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const PPL_THEORY_SUBJECTS = [
  "Air Law",
  "Operational Procedures",
  "Human Performance & Limitations",
  "Meteorology",
  "Navigation",
  "Principles of Flight",
  "Aircraft General Knowledge",
  "Flight Performance & Planning",
  "Communications",
] as const;
