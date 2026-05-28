import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STAFF_ROLES = ["super_admin", "admin", "instructor"] as const;

async function assertStaff(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: staff role required");
  }
}

export const listStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const { data: students, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((students ?? []).map((s) => s.user_id)));
    const profilesById = new Map<string, { display_name: string | null; phone: string | null }>();
    if (userIds.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("user_id, display_name, phone")
        .in("user_id", userIds);
      (profs ?? []).forEach((p) =>
        profilesById.set(p.user_id, { display_name: p.display_name, phone: p.phone }),
      );
    }

    // Hours summary per student
    const studentIds = (students ?? []).map((s) => s.id);
    const totalsByStudent = new Map<string, { total: number; flights: number; last: string | null }>();
    if (studentIds.length) {
      const { data: flights } = await supabaseAdmin
        .from("flight_log_entries")
        .select("student_id, total_minutes, flight_date")
        .in("student_id", studentIds);
      (flights ?? []).forEach((f) => {
        const cur = totalsByStudent.get(f.student_id) ?? { total: 0, flights: 0, last: null };
        cur.total += f.total_minutes ?? 0;
        cur.flights += 1;
        if (!cur.last || f.flight_date > cur.last) cur.last = f.flight_date;
        totalsByStudent.set(f.student_id, cur);
      });
    }

    return {
      students: (students ?? []).map((s) => ({
        ...s,
        display_name: profilesById.get(s.user_id)?.display_name ?? null,
        phone: profilesById.get(s.user_id)?.phone ?? null,
        total_minutes: totalsByStudent.get(s.id)?.total ?? 0,
        flights_count: totalsByStudent.get(s.id)?.flights ?? 0,
        last_flight_date: totalsByStudent.get(s.id)?.last ?? null,
      })),
    };
  });

export const listEligibleStudentUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    // Users without a students row yet
    const { data: existing } = await supabaseAdmin.from("students").select("user_id");
    const existingIds = new Set((existing ?? []).map((s) => s.user_id));
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name")
      .order("display_name");
    return {
      users: (profiles ?? [])
        .filter((p) => !existingIds.has(p.user_id))
        .map((p) => ({ user_id: p.user_id, display_name: p.display_name })),
    };
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        user_id: z.string().uuid(),
        license_sought: z.enum(["PPL", "LAPL", "NPPL", "CPL", "IR", "Other"]).default("PPL"),
        start_date: z.string().optional().nullable(),
        notes: z.string().max(2000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("students")
      .insert({
        user_id: data.user_id,
        license_sought: data.license_sought,
        start_date: data.start_date || null,
        notes: data.notes || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    // Ensure they also have the 'student' role
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.user_id, role: "student" }, { onConflict: "user_id,role" });
    return { student: row };
  });

export const updateStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        license_sought: z.enum(["PPL", "LAPL", "NPPL", "CPL", "IR", "Other"]).optional(),
        start_date: z.string().optional().nullable(),
        status: z.enum(["active", "paused", "completed", "withdrawn"]).optional(),
        notes: z.string().max(2000).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("students").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getStudent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name, phone, avatar_url")
      .eq("user_id", student.user_id)
      .maybeSingle();

    const { data: flights } = await supabaseAdmin
      .from("flight_log_entries")
      .select("*")
      .eq("student_id", data.id)
      .order("flight_date", { ascending: false })
      .order("off_blocks_at", { ascending: false });

    const flightIds = (flights ?? []).map((f) => f.id);
    const { data: flightExercises } = flightIds.length
      ? await supabaseAdmin
          .from("flight_log_exercises")
          .select("*")
          .in("flight_log_entry_id", flightIds)
      : { data: [] as any[] };

    const { data: documents } = await supabaseAdmin
      .from("student_documents")
      .select("*")
      .eq("student_id", data.id)
      .order("expires_on", { ascending: true });

    const { data: endorsements } = await supabaseAdmin
      .from("student_endorsements")
      .select("*")
      .eq("student_id", data.id)
      .order("signed_at", { ascending: false });

    const { data: theory } = await supabaseAdmin
      .from("theory_exam_results")
      .select("*")
      .eq("student_id", data.id)
      .order("taken_on", { ascending: false, nullsFirst: false });

    return {
      student,
      profile: profile ?? null,
      flights: flights ?? [],
      flightExercises: flightExercises ?? [],
      documents: documents ?? [],
      endorsements: endorsements ?? [],
      theory: theory ?? [],
    };
  });

export const listExpiringDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const { data: docs } = await supabaseAdmin
      .from("student_documents")
      .select("*")
      .not("expires_on", "is", null)
      .order("expires_on", { ascending: true });
    const studentIds = Array.from(new Set((docs ?? []).map((d) => d.student_id)));
    const studentsById = new Map<
      string,
      { id: string; user_id: string; display_name: string | null }
    >();
    if (studentIds.length) {
      const { data: students } = await supabaseAdmin
        .from("students")
        .select("id, user_id")
        .in("id", studentIds);
      const userIds = (students ?? []).map((s) => s.user_id);
      const { data: profs } = userIds.length
        ? await supabaseAdmin
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds)
        : { data: [] as any[] };
      const nameMap = new Map((profs ?? []).map((p) => [p.user_id, p.display_name]));
      (students ?? []).forEach((s) =>
        studentsById.set(s.id, {
          id: s.id,
          user_id: s.user_id,
          display_name: nameMap.get(s.user_id) ?? null,
        }),
      );
    }
    return {
      documents: (docs ?? []).map((d) => ({
        ...d,
        student: studentsById.get(d.student_id) ?? null,
      })),
    };
  });