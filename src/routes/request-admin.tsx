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
    <div className="min-h-screen bg-[oklch(0.12_0.04_250)] text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Request CMS Access</h1>
            <p className="text-xs text-white/50">
              Super-admin grants full editing rights across the site.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-success/15 text-success">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {done.duplicate ? "Already Pending" : "Request Submitted"}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {done.duplicate
                    ? "A request for this email is already waiting for review."
                    : "An existing super-admin will review your request and grant access from /cms/users."}
                </p>
              </div>
              <ol className="mx-auto max-w-sm space-y-1.5 text-left text-xs text-white/50">
                <li>
                  1. Make sure you have a portal account at{" "}
                  <Link to="/login" className="text-primary underline">
                    /login
                  </Link>
                  .
                </li>
                <li>2. Wait for approval — no action needed.</li>
                <li>
                  3. Once approved, sign in and visit{" "}
                  <code className="rounded bg-white/10 px-1 font-mono">/cms</code>.
                </li>
              </ol>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface-navy px-4 py-3 text-sm text-white outline-none placeholder-white/25 focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1.5 text-[11px] text-white/40">
                  Must match the email on your portal account.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  Reason (optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why do you need CMS access?"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface-navy px-4 py-3 text-sm text-white outline-none placeholder-white/25 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-50"
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
