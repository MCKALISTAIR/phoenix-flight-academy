import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const settingsSchema = z.object({
  team_notification_email: z.string().email().max(200).nullable(),
  sender_display_name: z.string().min(1).max(120),
  reply_to_email: z.string().email().max(200).nullable(),
  customer_receipt_enabled: z.boolean(),
  team_notification_enabled: z.boolean(),
});

export const getEmailSettingsForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { emailConfigured } = await import("@/lib/email/send.server");
    return { settings: data, configured: emailConfigured() };
  });

export const saveEmailSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("email_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!existing) throw new Error("Email settings row missing");
    const { error } = await context.supabase
      .from("email_settings")
      .update(data)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTestBookingEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ to: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const { sendAppEmail } = await import("@/lib/email/send.server");
    const result = await sendAppEmail({
      templateName: "booking-receipt",
      to: data.to,
      label: "test-booking-receipt",
      subject: "Test: your booking is confirmed",
      templateData: {
        customerName: "Test pilot",
        productName: "30-Minute Trial Flight",
        startsAt: "Saturday 14 June 2026, 10:00",
        aircraft: "G-PHNX",
        amountPaid: "£149.00",
        reference: "TEST-0001",
      },
    });
    return result;
  });
