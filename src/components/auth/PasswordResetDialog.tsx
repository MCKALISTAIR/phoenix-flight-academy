import { useState } from "react";
import { Lock, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetDialogProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export function PasswordResetDialog({
  open,
  onClose,
  initialEmail = "",
}: PasswordResetDialogProps) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMsg("Password reset instructions sent. Please check your email inbox.");
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Failed to request password reset.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Reset Your Password
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Enter the email address associated with your flight portal account. We&apos;ll send you a
          secure link to choose a new password.
        </p>

        {msg && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="resetEmail"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              Account Email Address
            </label>
            <input
              type="email"
              id="resetEmail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pilot@example.com"
              className="block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3 w-3 animate-spin" />}
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
