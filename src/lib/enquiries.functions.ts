import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendAppEmail, getEmailSettings } from "@/lib/email/send.server";

const STAFF_ROLES = ["super_admin", "admin", "instructor"] as const;

async function assertStaff(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r))) {
    throw new Error("Forbidden: staff role required");
  }
}

const submitSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  subject: z.string().min(1).default("General Query"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

export const submitContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const formattedMessage = `[Subject: ${data.subject}]\n\n${data.message}`;

    // 1. Insert into database
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("contact_submissions")
      .insert({
        name: data.name,
        email: data.email,
        company: data.subject,
        message: formattedMessage,
        source: "contact_page",
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // 2. Dispatch team notification email
    try {
      const emailSettings = await getEmailSettings();
      const targetEmail =
        emailSettings.team_notification_email || "info@phoenixflighttraining.co.uk";

      if (emailSettings.team_notification_enabled !== false) {
        await sendAppEmail({
          templateName: "team-enquiry-notification",
          to: targetEmail,
          templateData: {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            schoolName: emailSettings.sender_display_name || "Phoenix Flight Training",
          },
          label: "team-enquiry-notification",
        });
      }
    } catch (emailErr) {
      // Email failure should not block user confirmation
      console.warn("[enquiries] Failed to dispatch team notification email:", emailErr);
    }

    return { ok: true, id: inserted?.id };
  });

export const listContactEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);

    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((row) => {
      // Extract subject label from company column or parsed message
      let subject = row.company || "General Query";
      let cleanMessage = row.message;

      const subjectMatch = row.message.match(/^\[Subject:\s*([^\]]+)\]\n\n([\s\S]*)$/);
      if (subjectMatch) {
        subject = subjectMatch[1] || subject;
        cleanMessage = subjectMatch[2] || row.message;
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        subject,
        message: cleanMessage,
        source: row.source ?? "contact_page",
        created_at: row.created_at,
        status: (row as { status?: string }).status ?? "new",
        notes: (row as { notes?: string | null }).notes ?? null,
      };
    });

    const newCount = rows.filter((r) => r.status === "new").length;

    return {
      enquiries: rows,
      newCount,
      totalCount: rows.length,
    };
  });

const updateEnquirySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "converted", "archived"]),
  notes: z.string().max(2000).nullable().optional(),
});

export const updateContactEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateEnquirySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);

    const patch: { status: string; notes?: string | null; updated_at: string } = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };
    if (data.notes !== undefined) {
      patch.notes = data.notes;
    }

    const { error } = await supabaseAdmin
      .from("contact_submissions")
      .update(patch)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
