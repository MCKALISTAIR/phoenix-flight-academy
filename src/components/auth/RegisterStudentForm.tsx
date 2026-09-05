import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Send, Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RegisterStudentFormProps {
  onSuccess: () => void;
  redirectUrl?: string;
}

export function RegisterStudentForm({ onSuccess, redirectUrl }: RegisterStudentFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    course: "ppl",
    message: "",
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
    if (!form.phone.trim()) newErrors.phone = "Please enter your contact phone number.";
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
            role: "student",
          },
        },
      });

      if (signUpError) throw signUpError;

      const notes = `Course Sought: ${form.course.toUpperCase()}\nPhone: ${form.phone}\nMessage: ${form.message || "None"}`;

      await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        company: "Student Pilot Enrollment",
        message: notes,
        source: "registration_student",
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
            htmlFor="studentName"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="studentName"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="E.g. Alex Campbell"
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
            htmlFor="studentEmail"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="studentEmail"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="studentPhone"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Contact Telephone
          </label>
          <input
            type="tel"
            id="studentPhone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+44 7700 900123"
            className={`block w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 ${
              errors.phone
                ? "border-destructive focus:ring-destructive"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-[11px] text-destructive font-medium">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="studentCourse"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Primary Training Goal
          </label>
          <select
            id="studentCourse"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ppl">Private Pilot Licence (PPL) - 45 Hours Min</option>
            <option value="lapl">Light Aircraft Pilot Licence (LAPL) - 30 Hours Min</option>
            <option value="trial">Introductory Trial Lesson (First Flight)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="studentPass"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Create Password
          </label>
          <input
            type="password"
            id="studentPass"
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
            htmlFor="studentConfirm"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="studentConfirm"
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

      <div>
        <label
          htmlFor="studentMsg"
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1"
        >
          Flying Experience or Schedule Notes (Optional)
        </label>
        <textarea
          id="studentMsg"
          rows={2}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="E.g. weekend availability, previous glider/simulator experience..."
          className="block w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Student Account...
          </>
        ) : (
          <>
            <GraduationCap className="h-4 w-4" />
            Create Student Pilot Account
          </>
        )}
      </button>
    </form>
  );
}
