import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const TEST_ACCOUNTS = {
  admin: { email: "e2e-admin@test.lovable.dev", password: "TestPass!2026", label: "Admin" },
  user: { email: "e2e-user@test.lovable.dev", password: "TestPass!2026", label: "User" },
} as const;

interface LoginFormProps {
  onForgotPassword: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onForgotPassword, redirectUrl }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      const { data: userData } = await supabase.auth.getUser();
      let destination = redirectUrl;
      if (!destination && userData.user) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id);
        const roles = (rolesData ?? []).map((r) => r.role as string);
        destination =
          roles.includes("super_admin") || roles.includes("admin") ? "/cms" : "/booking/dashboard";
      }

      navigate({ to: destination || "/booking/dashboard" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please verify your email and password.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error instanceof Error ? result.error.message : "Google sign-in failed.");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: redirectUrl ?? "/booking/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  };

  const handleTestLogin = async (kind: "admin" | "user") => {
    setBusy(true);
    setError("");
    try {
      const creds = TEST_ACCOUNTS[kind];
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (signInError) throw signInError;
      const dest = redirectUrl ?? (kind === "admin" ? "/cms" : "/booking/dashboard");
      navigate({ to: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quick sign-in failed.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-all active:scale-[0.98] hover:bg-muted disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
          />
        </svg>
        Sign in with Google
      </button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          or continue with email
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="loginEmail"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
          >
            Account Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              id="loginEmail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pilot@example.com"
              className="block w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="loginPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-primary hover:underline focus:outline-none"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              id="loginPass"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign In to Flight Portal
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo / Quick Test Accounts (Discreet & Monospace) */}
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Demo & Verification Sign-In
        </span>
        <div className="grid grid-cols-2 gap-2">
          {(["user", "admin"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => handleTestLogin(k)}
              disabled={busy}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-all hover:border-primary/40 disabled:opacity-50"
            >
              <div className="font-semibold text-foreground">{TEST_ACCOUNTS[k].label}</div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {TEST_ACCOUNTS[k].email}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
