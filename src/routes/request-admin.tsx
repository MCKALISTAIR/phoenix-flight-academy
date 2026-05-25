import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { submitAdminRequest } from "@/lib/admin-requests.functions";

export const Route = createFileRoute("/request-admin")({
  component: RequestAdminPage,
  head: () => ({
    meta: [
      { title: "Request CMS access | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Request super-admin CMS access. Submissions are reviewed and approved manually by an existing administrator.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function RequestAdminPage() {
  const submit = useServerFn(submitAdminRequest);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { duplicate: boolean }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await submit({
        data: { email, message: message.trim() || undefined },
      });
      setDone({ duplicate: Boolean(res.duplicate) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.10_0.03_270)] text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[oklch(0.55_0.22_270)]/15 text-[oklch(0.75_0.18_270)] border border-[oklch(0.55_0.22_270)]/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Request CMS access</h1>
            <p className="text-xs text-white/50">
              Super-admin grants full editing rights across the site.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {done.duplicate ? "Already pending" : "Request submitted"}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {done.duplicate
                    ? "A request for this email is already waiting for review."
                    : "An existing super-admin will review your request and grant access from /cms/users."}
                </p>
              </div>
              <ol className="mx-auto max-w-sm space-y-1.5 text-left text-xs text-white/50">
                <li>1. Make sure you have a portal account at <Link to="/login" className="text-[oklch(0.75_0.18_270)] underline">/login</Link>.</li>
                <li>2. Wait for approval — no action needed.</li>
                <li>3. Once approved, sign in and visit <code className="rounded bg-white/10 px-1">/cms</code>.</li>
              </ol>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder-white/25 focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)]"
                />
                <p className="mt-1.5 text-[11px] text-white/40">
                  Must match the email on your portal account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Reason (optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why do you need CMS access?"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder-white/25 focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)]"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] py-3 text-sm font-bold text-white transition-all hover:scale-[1.01] hover:bg-[oklch(0.60_0.22_270)] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {busy ? "Submitting..." : "Submit request"}
              </button>
              <p className="text-center text-[11px] text-white/35">
                Requests are reviewed manually. No role is granted automatically.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}