import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PlaneTakeoff, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RegisterPilotFormProps {
  onSuccess: () => void;
  redirectUrl?: string;
}

export function RegisterPilotForm({ onSuccess, redirectUrl }: RegisterPilotFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    license: "ppl",
    hours: "",
    medical: "current",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) newErrors.name = "Please enter your full name.";
    if (!form.email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.hours.trim()) {
      newErrors.hours = "Please enter your total flight hours.";
    } else if (isNaN(Number(form.hours)) || Number(form.hours) < 0) {
      newErrors.hours = "Flight hours must be a positive number.";
    }
    if (!form.password) {
      newErrors.password = "Please enter a password.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setBusy(true);
    setServerError("");

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            display_name: form.name.trim(),
            role: "pilot",
          },
        },
      });

      if (signUpError) throw signUpError;

      const notes = `Licence Held: ${form.license.toUpperCase()}\nLogged Flight Hours: ${form.hours}\nMedical Status: ${form.medical}`;

      await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company: "Qualified Pilot Registration",
        message: notes,
        source: "registration_pilot",
      });

      if (signUpData.session) {
        navigate({ to: redirectUrl ?? "/booking/dashboard" });
      } else {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("user already exists")
      ) {
        setServerError("An account with this email already exists. Please sign in above.");
      } else {
        setServerError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pilotName"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="pilotName"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="E.g. Sarah Jenkins"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 ${
              errors.name
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-destructive font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="pilotEmail"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="pilotEmail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="pilot@example.com"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-[11px] text-destructive font-medium">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="pilotLicence"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Licence Held
          </label>
          <select
            id="pilotLicence"
            value={form.license}
            onChange={(e) => setForm({ ...form, license: e.target.value })}
            className="block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ppl">UK CAA PPL(A)</option>
            <option value="lapl">UK CAA LAPL(A)</option>
            <option value="cpl_atpl">CPL / ATPL</option>
            <option value="faa">FAA / Foreign Licence</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="pilotHours"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Total Flight Hours
          </label>
          <input
            type="number"
            id="pilotHours"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            placeholder="E.g. 150"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 ${
              errors.hours
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.hours && (
            <p className="mt-1 text-[11px] text-destructive font-medium">{errors.hours}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="pilotMedical"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Medical Validity
          </label>
          <select
            id="pilotMedical"
            value={form.medical}
            onChange={(e) => setForm({ ...form, medical: e.target.value })}
            className="block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="current">Class 2 Medical - Current</option>
            <option value="lapl_med">LAPL Medical - Current</option>
            <option value="class1">Class 1 Medical - Current</option>
            <option value="lapsed">Medical Expired / Lapsed</option>
          </select>
        </div>
      </div>

      {form.medical === "lapsed" && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Self-hire requires a current valid medical. We can assist you with local CAA AME
            booking.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pilotPass"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Create Password
          </label>
          <input
            type="password"
            id="pilotPass"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 ${
              errors.password
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-[11px] text-destructive font-medium">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="pilotConfirm"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="pilotConfirm"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="Repeat password"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 ${
              errors.confirmPassword
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-[11px] text-destructive font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-muted/40 p-3 border border-border text-xs text-muted-foreground leading-relaxed">
        <strong>Checkout Notice:</strong> All renter privileges require a 1-hour aerodrome checkout
        with a senior Phoenix flight instructor. Please bring your paper logbook, licence booklet,
        and medical certificate when arriving.
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Registering Pilot Account...
          </>
        ) : (
          <>
            <PlaneTakeoff className="h-4 w-4" />
            Register for Self-Hire Privileges
          </>
        )}
      </button>
    </form>
  );
}
