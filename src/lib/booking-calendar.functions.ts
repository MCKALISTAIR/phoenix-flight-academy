import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_ORG_ID } from "@/lib/constants";

export const getCalendarSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("booking_calendar_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

const settingsSchema = z.object({
  id: z.string().uuid(),
  open_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  close_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  slot_minutes: z.number().int().min(15).max(240),
  buffer_minutes: z.number().int().min(0).max(120),
  weekday_mask: z.string().regex(/^[YN]{7}$/),
  timezone: z.string().min(1).max(64),
});

export const updateCalendarSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("booking_calendar_settings")
      .update({ ...rest, updated_by: context.userId })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listClosedDates = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("booking_closed_dates")
    .select("*")
    .gte("ends_on", new Date().toISOString().slice(0, 10))
    .order("starts_on", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const addClosedDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reason: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_closed_dates")
      .insert({ ...data, created_by: context.userId, organization_id: DEFAULT_ORG_ID });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClosedDate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_closed_dates")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listResourceBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("booking_resource_blocks")
      .select("*")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addResourceBlock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        resource_kind: z.enum(["aircraft", "instructor"]),
        aircraft_id: z.string().uuid().nullable().optional(),
        instructor_id: z.string().uuid().nullable().optional(),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        reason: z.string().max(300).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("booking_resource_blocks")
      .insert({ ...data, created_by: context.userId, organization_id: DEFAULT_ORG_ID });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteResourceBlock = createServerFn({ method: "POST" })
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

// ============================================================
// AVAILABILITY ENGINE
// ============================================================

const slotsSchema = z.object({
  productSlug: z.string().min(1).max(120),
  aircraftId: z.string().uuid().nullable().optional(),
  instructorId: z.string().uuid().nullable().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type AvailableSlot = {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
};

export const getAvailableSlots = createServerFn({ method: "GET" })
  .inputValidator((input) => slotsSchema.parse(input))
  .handler(async ({ data }): Promise<AvailableSlot[]> => {
    const [productRes, settingsRes, closedRes] = await Promise.all([
      supabase.from("booking_products").select("*").eq("slug", data.productSlug).maybeSingle(),
      supabase.from("booking_calendar_settings").select("*").limit(1).maybeSingle(),
      supabase
        .from("booking_closed_dates")
        .select("*")
        .lte("starts_on", data.to)
        .gte("ends_on", data.from),
    ]);
    if (productRes.error) throw new Error(productRes.error.message);
    if (settingsRes.error) throw new Error(settingsRes.error.message);
    if (closedRes.error) throw new Error(closedRes.error.message);
    const product = productRes.data;
    const settings = settingsRes.data;
    if (!product || !settings) return [];

    const fromDate = new Date(`${data.from}T00:00:00Z`);
    const toDate = new Date(`${data.to}T23:59:59Z`);
    const now = new Date();
    const minBookableAt = new Date(now.getTime() + product.min_notice_hours * 3600_000);
    const maxBookableAt = new Date(now.getTime() + product.max_advance_days * 86400_000);

    // Build candidate slots in the local timezone (Europe/London)
    const [openH, openM] = settings.open_time.split(":").map(Number);
    const [closeH, closeM] = settings.close_time.split(":").map(Number);
    const slotMin = settings.slot_minutes;
    const duration = product.duration_minutes;
    const buffer = settings.buffer_minutes;
    const stepMin = Math.max(slotMin, duration);

    const closedRanges = (closedRes.data ?? []).map((c) => ({
      start: new Date(`${c.starts_on}T00:00:00Z`),
      end: new Date(`${c.ends_on}T23:59:59Z`),
    }));

    // Fetch existing bookings + blocks that could overlap
    const overlapFrom = fromDate.toISOString();
    const overlapTo = toDate.toISOString();
    const bookingsQ = supabase
      .from("bookings")
      .select("aircraft_id, instructor_id, starts_at, ends_at, status")
      .in("status", ["pending", "confirmed"])
      .lt("starts_at", overlapTo)
      .gt("ends_at", overlapFrom);
    const blocksQ = supabase
      .from("booking_resource_blocks")
      .select("resource_kind, aircraft_id, instructor_id, starts_at, ends_at")
      .lt("starts_at", overlapTo)
      .gt("ends_at", overlapFrom);
    const [bookingsRes, blocksRes] = await Promise.all([bookingsQ, blocksQ]);
    if (bookingsRes.error) throw new Error(bookingsRes.error.message);
    if (blocksRes.error) throw new Error(blocksRes.error.message);
    const bookings = bookingsRes.data ?? [];
    const blocks = blocksRes.data ?? [];

    function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
      return aStart < bEnd && bStart < aEnd;
    }

    const out: AvailableSlot[] = [];
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      const dayIdx = (cursor.getUTCDay() + 6) % 7; // Mon=0..Sun=6
      const open = settings.weekday_mask[dayIdx] === "Y";
      if (open) {
        let h = openH;
        let m = openM;
        while (h * 60 + m + duration <= closeH * 60 + closeM) {
          const startsAt = new Date(cursor);
          startsAt.setUTCHours(h, m, 0, 0);
          const endsAt = new Date(startsAt.getTime() + duration * 60_000);
          const endWithBuffer = new Date(endsAt.getTime() + buffer * 60_000);

          let available = true;
          let reason: string | undefined;

          if (startsAt < minBookableAt) {
            available = false;
            reason = "Too soon";
          } else if (startsAt > maxBookableAt) {
            available = false;
            reason = "Too far ahead";
          } else if (closedRanges.some((r) => overlaps(startsAt, endsAt, r.start, r.end))) {
            available = false;
            reason = "Airfield closed";
          } else {
            if (data.aircraftId) {
              const conflict =
                bookings.some(
                  (b) =>
                    b.aircraft_id === data.aircraftId &&
                    overlaps(startsAt, endWithBuffer, new Date(b.starts_at), new Date(b.ends_at)),
                ) ||
                blocks.some(
                  (b) =>
                    b.aircraft_id === data.aircraftId &&
                    overlaps(startsAt, endsAt, new Date(b.starts_at), new Date(b.ends_at)),
                );
              if (conflict) {
                available = false;
                reason = "Aircraft booked";
              }
            }
            if (available && data.instructorId) {
              const conflict =
                bookings.some(
                  (b) =>
                    b.instructor_id === data.instructorId &&
                    overlaps(startsAt, endWithBuffer, new Date(b.starts_at), new Date(b.ends_at)),
                ) ||
                blocks.some(
                  (b) =>
                    b.instructor_id === data.instructorId &&
                    overlaps(startsAt, endsAt, new Date(b.starts_at), new Date(b.ends_at)),
                );
              if (conflict) {
                available = false;
                reason = "Instructor unavailable";
              }
            }
          }

          out.push({
            start: startsAt.toISOString(),
            end: endsAt.toISOString(),
            available,
            reason,
          });

          m += stepMin;
          while (m >= 60) {
            h += 1;
            m -= 60;
          }
        }
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return out;
  });
