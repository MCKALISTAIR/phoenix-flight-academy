import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ORG_ID } from "@/lib/constants";

const TIME = /^\d{2}:\d{2}(:\d{2})?$/;

/** Public read: weekly availability windows for published instructors. */
export const listAvailabilityWindows = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({ instructorId: z.string().uuid().optional() })
      .default({})
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabase
      .from("instructor_availability")
      .select("id, instructor_id, weekday, start_time, end_time, note")
      .order("weekday")
      .order("start_time");
    if (data.instructorId) q = q.eq("instructor_id", data.instructorId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** The instructor record linked to the signed-in account, if any. */
export const getMyInstructorRecord = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("instructors")
      .select("id, name, role, published, user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const windowSchema = z.object({
  id: z.string().uuid().optional(),
  instructorId: z.string().uuid(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(TIME),
  endTime: z.string().regex(TIME),
  note: z.string().max(200).nullable().optional(),
});

/** Create or update one weekly window. RLS allows staff, or the instructor themselves. */
export const saveAvailabilityWindow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => windowSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.endTime <= data.startTime) {
      throw new Error("The finish time must be after the start time.");
    }
    const payload = {
      instructor_id: data.instructorId,
      weekday: data.weekday,
      start_time: data.startTime,
      end_time: data.endTime,
      note: data.note ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("instructor_availability")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await context.supabase
      .from("instructor_availability")
      .insert({ ...payload, created_by: context.userId, organization_id: DEFAULT_ORG_ID })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id };
  });

export const deleteAvailabilityWindow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("instructor_availability")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Time off (one-off blocks) for one instructor — future only. */
export const listInstructorTimeOff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ instructorId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("booking_resource_blocks")
      .select("id, starts_at, ends_at, reason")
      .eq("instructor_id", data.instructorId)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const addInstructorTimeOff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        instructorId: z.string().uuid(),
        startsAt: z.string().datetime(),
        endsAt: z.string().datetime(),
        reason: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new Error("The end of the time off must be after the start.");
    }
    const { error } = await context.supabase.from("booking_resource_blocks").insert({
      resource_kind: "instructor" as const,
      instructor_id: data.instructorId,
      starts_at: data.startsAt,
      ends_at: data.endsAt,
      reason: data.reason ?? null,
      created_by: context.userId,
      organization_id: DEFAULT_ORG_ID,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInstructorTimeOff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_resource_blocks")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

/** Admin: instructors plus the email of the account linked to each one. */
export const listInstructorAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("instructors")
      .select("id, name, role, published, user_id, display_order")
      .order("display_order");
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const emails = new Map((list?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    return (rows ?? []).map((r) => ({ ...r, email: r.user_id ? emails.get(r.user_id) : null }));
  });

/** Admin: connect (or disconnect) an instructor profile to a login account. */
export const linkInstructorAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        instructorId: z.string().uuid(),
        email: z.string().email().max(255).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.email) {
      const { error } = await supabaseAdmin
        .from("instructors")
        .update({ user_id: null })
        .eq("id", data.instructorId);
      if (error) throw new Error(error.message);
      return { ok: true, linked: false as const };
    }

    const target = data.email.trim().toLowerCase();
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw new Error(listErr.message);
    const match = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === target);
    if (!match) {
      throw new Error(`No account found for ${data.email}. Ask them to sign up first.`);
    }

    const { error } = await supabaseAdmin
      .from("instructors")
      .update({ user_id: match.id })
      .eq("id", data.instructorId);
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: match.id, role: "instructor" }, { onConflict: "user_id,role" });

    return { ok: true, linked: true as const, email: match.email ?? target };
  });
