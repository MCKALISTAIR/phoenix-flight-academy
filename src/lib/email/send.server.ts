import { render } from "@react-email/render";
import { sendLovableEmail } from "@lovable.dev/email-js";
import React from "react";
import { TEMPLATES, type TemplateName } from "@/lib/email-templates/registry";

export interface EmailSettings {
  team_notification_email: string | null;
  sender_display_name: string;
  reply_to_email: string | null;
  customer_receipt_enabled: boolean;
  team_notification_enabled: boolean;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("email_settings")
    .select(
      "team_notification_email, sender_display_name, reply_to_email, customer_receipt_enabled, team_notification_enabled",
    )
    .limit(1)
    .maybeSingle();

  return (
    (data as EmailSettings | null) ?? {
      team_notification_email: null,
      sender_display_name: "Phoenix Flight Training",
      reply_to_email: null,
      customer_receipt_enabled: true,
      team_notification_enabled: true,
    }
  );
}

/** The verified sender subdomain, set once an email domain is connected to the project. */
function senderDomain() {
  return process.env["LOVABLE_EMAIL_SENDER_DOMAIN"] ?? process.env["EMAIL_SENDER_DOMAIN"] ?? null;
}

export function emailConfigured() {
  return Boolean(senderDomain() && process.env["LOVABLE_API_KEY"]);
}

export interface SendArgs {
  templateName: TemplateName;
  to: string;
  templateData?: Record<string, unknown>;
  subject?: string;
  idempotencyKey?: string;
  label?: string;
}

/**
 * Renders a template and sends it. Until a sender domain is connected to this
 * project the send is skipped and logged, so booking flows never fail because
 * of email configuration.
 */
export async function sendAppEmail(args: SendArgs): Promise<{ sent: boolean; reason?: string }> {
  const domain = senderDomain();
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!domain || !apiKey) {
    console.warn(`[email] skipped "${args.templateName}" — no sender domain connected yet`);
    return { sent: false, reason: "not_configured" };
  }

  const entry = TEMPLATES[args.templateName];
  const settings = await getEmailSettings();
  const data = { schoolName: settings.sender_display_name, ...(args.templateData ?? {}) };
  const element = React.createElement(entry.component, data);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    args.subject ?? (typeof entry.subject === "function" ? entry.subject(data) : entry.subject);

  try {
    await sendLovableEmail(
      {
        to: args.to,
        from: { name: settings.sender_display_name, address: `bookings@${domain}` },
        sender_domain: domain,
        subject,
        html,
        text,
        purpose: "transactional",
        label: args.label ?? args.templateName,
        idempotency_key: args.idempotencyKey,
        ...(settings.reply_to_email ? { reply_to: settings.reply_to_email } : {}),
      },
      { apiKey },
    );
    return { sent: true };
  } catch (e) {
    console.error(`[email] failed to send "${args.templateName}":`, e);
    return { sent: false, reason: e instanceof Error ? e.message : "send_failed" };
  }
}
