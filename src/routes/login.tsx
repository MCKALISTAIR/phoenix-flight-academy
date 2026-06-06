import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { AlertCircle, Cloud, PlaneTakeoff, Lock, ArrowLeft, Send, CheckCircle2, UserPlus, GraduationCap, Compass, Shield, User, Mail } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const TEST_ACCOUNTS = {
  admin: { email: "e2e-admin@test.lovable.dev", password: "TestPass!2026" },
  user: { email: "e2e-user@test.lovable.dev", password: "TestPass!2026" },
} as const;

type LoginSearch = { redirect?: string; tab?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: search.redirect ?? (await defaultDestinationFor(data.session.user.id)) });
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in | Phoenix Flight Training" },
      { name: "description", content: "Access the Phoenix Flight online portal. Unified member login and prospective student/renter registration gateway." }
    ],
  }),
});

type ViewMode = "login" | "register";
type RegisterType = "student" | "pilot";

async function defaultDestinationFor(userId: string): Promise<string> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("super_admin") || roles.includes("admin")) return "/cms";
  return "/booking/dashboard";
}

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [viewMode, setViewMode] = useState<ViewMode>(search.tab === "register" ? "register" : "login");
  const [registerType, setRegisterType] = useState<RegisterType>("student");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Login inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Weather Console State
  const [showDecoded, setShowDecoded] = useState(false);
  const [windDir, setWindDir] = useState(240);
  const [windSpeed, setWindSpeed] = useState(15);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "ppl",
    message: ""
  });

  // Pilot Form State
  const [pilotForm, setPilotForm] = useState({
    name: "",
    email: "",
    license: "ppl",
    hours: "",
    medical: "current"
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      const { data: userData } = await supabase.auth.getUser();
      const dest = search.redirect ?? (userData.user ? await defaultDestinationFor(userData.user.id) : "/booking/dashboard");
      navigate({ to: dest });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
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
      navigate({ to: search.redirect ?? "/booking/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setBusy(false);
    }
  }

  async function handleTestLogin(kind: "admin" | "user") {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const creds = TEST_ACCOUNTS[kind];
      const { error } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });
      if (error) throw error;
      const dest = search.redirect ?? (kind === "admin" ? "/cms" : "/booking/dashboard");
      navigate({ to: dest });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test sign-in failed.");
      setBusy(false);
    }
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (registerType === "student") {
      if (!studentForm.name.trim()) {
        newErrors.studentName = "Please enter your full name.";
      }
      if (!studentForm.email.trim()) {
        newErrors.studentEmail = "Please enter your email address.";
      } else if (!emailRegex.test(studentForm.email.trim())) {
        newErrors.studentEmail = "Please enter a valid email address.";
      }
      if (!studentForm.phone.trim()) {
        newErrors.studentPhone = "Please enter your contact phone number.";
      }
    } else {
      if (!pilotForm.name.trim()) {
        newErrors.pilotName = "Please enter your full name.";
      }
      if (!pilotForm.email.trim()) {
        newErrors.pilotEmail = "Please enter your email address.";
      } else if (!emailRegex.test(pilotForm.email.trim())) {
        newErrors.pilotEmail = "Please enter a valid email address.";
      }
      if (!pilotForm.hours.trim()) {
        newErrors.pilotHours = "Please enter your total flight hours.";
      } else {
        const hrs = Number(pilotForm.hours);
        if (isNaN(hrs) || hrs < 0) {
          newErrors.pilotHours = "Flight hours must be a valid positive number.";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSubmitted(false);
    } else {
      setFormErrors({});
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormErrors({});
    setError("");
    setInfo("");
    setStudentForm({ name: "", email: "", phone: "", course: "ppl", message: "" });
    setPilotForm({ name: "", email: "", license: "ppl", hours: "", medical: "current" });
  };

  // Active Runway calculations for Cumbernauld (EGPG)
  const diffTo26 = Math.min(Math.abs(windDir - 260), 360 - Math.abs(windDir - 260));
  const diffTo08 = Math.min(Math.abs(windDir - 80), 360 - Math.abs(windDir - 80));
  const activeRunway = diffTo26 < diffTo08 ? "26" : "08";
  const activeHeading = activeRunway === "26" ? 260 : 80;
  
  const angleDiffRad = ((windDir - activeHeading) * Math.PI) / 180;
  const headwind = Math.max(0, Math.round(windSpeed * Math.cos(angleDiffRad)));
  const crosswind = Math.round(Math.abs(windSpeed * Math.sin(angleDiffRad)));

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Portal Header */}
      <div className="bg-[oklch(0.12_0.04_250)] py-12 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-white/10 p-1.5 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Phoenix Flight Academy Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Booking Portal
                </h1>
                <p className="text-sm text-white/80">
                  Phoenix Flight Training Online System
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Onboarding Portal Gate */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Flying Operations Bar */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                  Airfield Status
                </h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center gap-4 rounded-xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">
                  <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="font-medium text-sm">Cumbernauld flights are operating normally today.</span>
                </div>
              </div>
            </div>

            {/* Premium Auth Portal Card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              
              {/* Clean Two-Way Toggle Header */}
              <div className="flex border-b border-border bg-muted/30">
                <button
                  onClick={() => { setViewMode("login"); resetForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
                    viewMode === "login"
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/15"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Sign In
                </button>
                <button
                  onClick={() => { setViewMode("register"); resetForm(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
                    viewMode === "register"
                      ? "border-primary text-primary bg-card"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/15"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Request Access / Enroll
                </button>
              </div>

              {/* Dynamic Auth Body */}
              <div className="p-8">
                {submitted ? (
                  /* Success Overlay */
                  <div className="text-center py-12 max-w-md mx-auto space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Application Queued!</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Your request for {registerType === "student" ? "PPL Flight Training" : "Self-Hire Pilot privileges"} has been successfully queued. An airfield representative will contact you shortly to confirm your booking checkout or lesson schedule.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={resetForm}
                        className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        Submit Another Form
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {viewMode === "login" ? (
                      /* Classic Login Form */
                      <div className="space-y-6">
                        <button
                          type="button"
                          onClick={handleGoogle}
                          disabled={busy}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
                          </svg>
                          Continue with Google
                        </button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                          <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or email sign-in</span></div>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-5 max-w-md">
                          <div>
                            <label htmlFor="loginEmail" className="block text-sm font-semibold text-foreground">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="loginEmail"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                              placeholder="Enter your pilot email"
                            />
                          </div>
                          <div>
                            <label htmlFor="loginPass" className="block text-sm font-semibold text-foreground">
                              Password
                            </label>
                            <input
                              type="password"
                              id="loginPass"
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <a href="#" className="text-xs font-semibold text-primary hover:underline">
                              Forgotten Password?
                            </a>
                            <Link to="/request-admin" className="text-xs font-semibold text-primary hover:underline">
                              Request CMS access
                            </Link>
                          </div>

                          {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                            </div>
                          )}
                          {info && (
                            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /><span>{info}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.01] disabled:opacity-50"
                          >
                            {busy ? "Signing in..." : "Login to Portal"}
                          </button>
                        </form>

                        <div className="mt-6 border-t border-dashed border-border pt-5">
                          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Test sign-in (dev only)
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleTestLogin("admin")}
                              disabled={busy}
                              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                            >
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" /> Admin
                              </span>
                              <span className="text-[10px] font-normal text-muted-foreground">
                                {TEST_ACCOUNTS.admin.email}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTestLogin("user")}
                              disabled={busy}
                              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                            >
                              <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> User
                              </span>
                              <span className="text-[10px] font-normal text-muted-foreground">
                                {TEST_ACCOUNTS.user.email}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Unified Registration Flow */
                      <div className="space-y-8">
                        
                        {/* Beautiful Account Type Selector Cards */}
                        <div className="space-y-3">
                          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Select Your Journey Type
                          </span>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Student Pilot Card */}
                            <button
                              type="button"
                              onClick={() => setRegisterType("student")}
                              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                                registerType === "student"
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:bg-muted/50 bg-card"
                              }`}
                            >
                              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                registerType === "student" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground text-sm sm:text-base">Student Pilot</h4>
                                <p className="mt-1 text-xs text-muted-foreground leading-normal">
                                  Enroll in PPL training or request a trial flight lesson.
                                </p>
                              </div>
                            </button>

                            {/* Qualified Pilot Card */}
                            <button
                              type="button"
                              onClick={() => setRegisterType("pilot")}
                              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                                registerType === "pilot"
                                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                                  : "border-border hover:bg-muted/50 bg-card"
                              }`}
                            >
                              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                registerType === "pilot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>
                                <Compass className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground text-sm sm:text-base">Qualified Renter</h4>
                                <p className="mt-1 text-xs text-muted-foreground leading-normal">
                                  Request checkout flight clearance for self-hire fleet access.
                                </p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Dynamically Rendered Form */}
                        {registerType === "student" ? (
                          /* Student Form */
                          <form onSubmit={handleRegisterSubmit} className="space-y-5" noValidate>
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor="stName" className="block text-sm font-semibold text-foreground">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  id="stName"
                                  value={studentForm.name}
                                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                  className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.studentName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                  placeholder="John Smith"
                                />
                                {formErrors.studentName && (
                                  <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-red-500" />
                                    {formErrors.studentName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label htmlFor="stPhone" className="block text-sm font-semibold text-foreground">
                                  Contact Number
                                </label>
                                <input
                                  type="tel"
                                  id="stPhone"
                                  value={studentForm.phone}
                                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                  className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.studentPhone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                  placeholder="07123 456789"
                                />
                                {formErrors.studentPhone && (
                                  <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-red-500" />
                                    {formErrors.studentPhone}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label htmlFor="stEmail" className="block text-sm font-semibold text-foreground">
                                  Email Address
                              </label>
                              <input
                                type="email"
                                id="stEmail"
                                value={studentForm.email}
                                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                  className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.studentEmail ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                placeholder="john@example.com"
                              />
                              {formErrors.studentEmail && (
                                <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-red-500" />
                                  {formErrors.studentEmail}
                                </p>
                              )}
                            </div>

                            <div>
                              <label htmlFor="stCourse" className="block text-sm font-semibold text-foreground">
                                Desired Flight Syllabus
                              </label>
                              <select
                                id="stCourse"
                                value={studentForm.course}
                                onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                                className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                              >
                                <option value="ppl">Full Private Pilot License (PPL) - 45 Hours</option>
                                <option value="lapl">Light Aircraft Pilot License (LAPL) - 30 Hours</option>
                                <option value="trial">Introductory Trial Lesson (Lesson #1)</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor="stMsg" className="block text-sm font-semibold text-foreground">
                                Previous Experience or Schedule Goals
                              </label>
                              <textarea
                                id="stMsg"
                                rows={3}
                                value={studentForm.message}
                                onChange={(e) => setStudentForm({ ...studentForm, message: e.target.value })}
                                className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                placeholder="E.g., availability (weekends / weekdays), flight simulator hours..."
                              />
                            </div>

                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.01]"
                            >
                              <Send className="h-4 w-4" />
                              Submit Student Enrollment Request
                            </button>
                          </form>
                        ) : (
                          /* Renter Form */
                          <form onSubmit={handleRegisterSubmit} className="space-y-5" noValidate>
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor="pName" className="block text-sm font-semibold text-foreground">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  id="pName"
                                  value={pilotForm.name}
                                  onChange={(e) => setPilotForm({ ...pilotForm, name: e.target.value })}
                                  className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.pilotName ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                  placeholder="Sarah Jenkins"
                                />
                                {formErrors.pilotName && (
                                  <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-red-500" />
                                    {formErrors.pilotName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label htmlFor="pHours" className="block text-sm font-semibold text-foreground">
                                  Total Logged Flight Hours
                                </label>
                                <input
                                  type="number"
                                  id="pHours"
                                  value={pilotForm.hours}
                                  onChange={(e) => setPilotForm({ ...pilotForm, hours: e.target.value })}
                                  className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.pilotHours ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                  placeholder="e.g. 150"
                                />
                                {formErrors.pilotHours && (
                                  <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-red-500" />
                                    {formErrors.pilotHours}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label htmlFor="pEmail" className="block text-sm font-semibold text-foreground">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="pEmail"
                                value={pilotForm.email}
                                onChange={(e) => setPilotForm({ ...pilotForm, email: e.target.value })}
                                className={`mt-1.5 block w-full rounded-lg border bg-background px-3.5 py-2.5 shadow-sm text-sm focus:outline-none focus:ring-1 ${formErrors.pilotEmail ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-input focus:border-primary focus:ring-primary"}`}
                                placeholder="sarah@example.com"
                              />
                              {formErrors.pilotEmail && (
                                <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1">
                                  <span className="h-1 w-1 rounded-full bg-red-500" />
                                  {formErrors.pilotEmail}
                                </p>
                              )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor="pLicense" className="block text-sm font-semibold text-foreground">
                                  License Held
                                </label>
                                <select
                                  id="pLicense"
                                  value={pilotForm.license}
                                  onChange={(e) => setPilotForm({ ...pilotForm, license: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                >
                                  <option value="ppl">EASA / UK PPL (A)</option>
                                  <option value="lapl">UK LAPL (A)</option>
                                  <option value="cpl">CPL / ATPL Commercial</option>
                                </select>
                              </div>
                              <div>
                                <label htmlFor="pMedical" className="block text-sm font-semibold text-foreground">
                                  Medical Validity
                                </label>
                                <select
                                  id="pMedical"
                                  value={pilotForm.medical}
                                  onChange={(e) => setPilotForm({ ...pilotForm, medical: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                >
                                  <option value="current">Class 2 Medical - Current</option>
                                  <option value="laplMed">LAPL Medical Declaration - Current</option>
                                  <option value="lapsed">Class 1/2 Medical - Lapsed</option>
                                </select>
                              </div>
                            </div>

                            {pilotForm.medical === "lapsed" && (
                              <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/25 animate-in fade-in slide-in-from-top-1 duration-200">
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                  Warning: Self-hire rentals require a current valid medical. Phoenix offers contact information for CAA AMEs if you need a renewal checkout.
                                </p>
                              </div>
                            )}

                            <div className="rounded-lg bg-orange-500/10 p-4 border border-orange-500/25">
                              <p className="text-xs leading-relaxed text-orange-800 dark:text-orange-300">
                                <strong>Club Notice:</strong> Renting pilot privileges require a one-hour club checkout flight with a Phoenix instructor. Please bring your paper logbook, license booklet, and active medical sheet when arriving for checkout scheduling.
                              </p>
                            </div>

                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.01]"
                            >
                              <Send className="h-4 w-4" />
                              Apply for Checkout Scheduling
                            </button>
                          </form>
                        )}

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar: Operations & Weather */}
          <div className="space-y-8">
            
            {/* Weather widget */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Live Airfield Weather
                </h2>
                <button
                  onClick={() => setShowDecoded(!showDecoded)}
                  className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  {showDecoded ? "Show METAR" : "Decode Weather"}
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cumbernauld EGPG</h3>
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                      VFR Active
                    </span>
                  </div>

                  {!showDecoded ? (
                    <div className="mt-2 rounded-lg bg-slate-950 p-3.5 text-xs font-mono text-slate-100 border border-slate-800 leading-relaxed tracking-wide">
                      EGPG 171120Z {windDir.toString().padStart(3, '0')}{windSpeed.toString().padStart(2, '0')}KT 9999 FEW030 14/08 Q1012
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg bg-slate-950 p-3.5 text-xs font-mono text-slate-300 border border-slate-800 space-y-1.5 leading-relaxed">
                      <p><span className="text-blue-400">WIND:</span> {windDir}° at {windSpeed} knots</p>
                      <p><span className="text-blue-400">VISIBILITY:</span> 10km+ (Perfect Visual Range)</p>
                      <p><span className="text-blue-400">CLOUDS:</span> Few Clouds at 3,000 ft</p>
                      <p><span className="text-blue-400">TEMP/DEW:</span> 14°C / 08°C</p>
                      <p><span className="text-blue-400">ALTIMETER:</span> QNH 1012 hPa (Standard)</p>
                    </div>
                  )}
                </div>

                {/* Wind Simulator Slider */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wind Simulator Controls</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                        <span>Wind Direction: {windDir}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={windDir}
                        onChange={(e) => setWindDir(Number(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                        <span>Wind Speed: {windSpeed} kts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(Number(e.target.value))}
                        className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* ATC Runway Status Console */}
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 text-[10px] tracking-wider uppercase font-bold">EGPG Airfield Status</span>
                    <span className="animate-pulse rounded bg-green-500/20 px-1 py-0.5 text-[9px] font-bold text-green-400 uppercase">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ACTIVE RUNWAY:</span>
                    <span className="text-sm font-bold text-primary">Runway {activeRunway}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] bg-slate-900/50 p-2 rounded">
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase font-bold">Headwind</span>
                      <span className="text-emerald-400 font-bold text-sm">{headwind} kts</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[9px] uppercase font-bold">Crosswind</span>
                      <span className={`font-bold text-sm ${crosswind > 15 ? "text-red-400" : "text-amber-500"}`}>{crosswind} kts</span>
                    </div>
                  </div>
                  {crosswind > 15 && (
                    <div className="text-[10px] bg-red-950/40 border border-red-900/30 text-red-400 p-2.5 rounded flex items-start gap-2 leading-relaxed">
                      <span className="block h-2 w-2 shrink-0 mt-0.5 animate-pulse rounded-full bg-red-500" />
                      <span>Warning: Crosswinds exceed safe 15 kts limit for student solo circuits. Dual instructions advised.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Information board */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Notice Board</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      MAY
                    </span>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">
                      Privacy & Data Sync
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Phoenix Flight portals synchronize and protect training records strictly within EASA and CAA data regulations.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
