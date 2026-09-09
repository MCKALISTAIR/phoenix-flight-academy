import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import {
  getEmailSettingsForAdmin,
  saveEmailSettings,
  sendTestBookingEmail,
} from "@/lib/email-settings.functions";

export const Route = createFileRoute("/cms/emails")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: EmailSettingsPage,
  head: () => ({
    meta: [
      { title: "Email Settings | CMS" },
      {
        name: "description",
        content: "Control booking confirmation and team notification emails for the flight school.",
      },
    ],
  }),
});

function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [teamEmail, setTeamEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [customerOn, setCustomerOn] = useState(true);
  const [teamOn, setTeamOn] = useState(true);
  const [testTo, setTestTo] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getEmailSettingsForAdmin();
        setConfigured(res.configured);
        const s = res.settings as Record<string, any> | null;
        if (s) {
          setTeamEmail(s.team_notification_email ?? "");
          setSenderName(s.sender_display_name ?? "");
          setReplyTo(s.reply_to_email ?? "");
          setCustomerOn(Boolean(s.customer_receipt_enabled));
          setTeamOn(Boolean(s.team_notification_enabled));
        }
      } catch (e) {
        setFeedback({ kind: "err", text: e instanceof Error ? e.message : "Could not load" });
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      await saveEmailSettings({
        data: {
          team_notification_email: teamEmail.trim() || null,
          sender_display_name: senderName.trim() || "Phoenix Flight Training",
          reply_to_email: replyTo.trim() || null,
          customer_receipt_enabled: customerOn,
          team_notification_enabled: teamOn,
        },
      });
      setFeedback({ kind: "ok", text: "Saved." });
    } catch (e) {
      setFeedback({ kind: "err", text: e instanceof Error ? e.message : "Could not save" });
    }
    setSaving(false);
  }

  async function sendTest() {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await sendTestBookingEmail({ data: { to: testTo.trim() } });
      setFeedback(
        res.sent
          ? { kind: "ok", text: `Test email sent to ${testTo}.` }
          : {
              kind: "err",
              text:
                res.reason === "not_configured"
                  ? "No sending domain is connected yet, so nothing was sent."
                  : `Could not send: ${res.reason}`,
            },
      );
    } catch (e) {
      setFeedback({ kind: "err", text: e instanceof Error ? e.message : "Could not send" });
    }
    setTesting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Mail className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Email settings</h1>
          <p className="text-sm text-muted-foreground">
            Booking confirmations for customers and new-booking alerts for the team.
          </p>
        </div>
      </div>

      {!configured && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            No sending address is connected yet. You can set everything up here now — emails start
            going out as soon as a sending domain is connected to this site.
          </p>
        </div>
      )}

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <Field label="Sender name shown to customers">
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Phoenix Flight Training"
          />
        </Field>
        <Field label="Reply-to address (optional)">
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="office@example.co.uk"
          />
        </Field>
        <Field label="Team notification address">
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={teamEmail}
            onChange={(e) => setTeamEmail(e.target.value)}
            placeholder="bookings@example.co.uk"
          />
        </Field>

        <Toggle
          label="Send a confirmation and receipt to the customer"
          checked={customerOn}
          onChange={setCustomerOn}
        />
        <Toggle
          label="Alert the team when a booking is paid"
          checked={teamOn}
          onChange={setTeamOn}
        />

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Save settings
        </button>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Send a test</h2>
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-56 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.co.uk"
          />
          <button
            onClick={sendTest}
            disabled={testing || !testTo.trim()}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send test
          </button>
        </div>
      </div>

      {feedback && (
        <p
          className={`text-sm ${feedback.kind === "ok" ? "text-emerald-600" : "text-destructive"}`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
