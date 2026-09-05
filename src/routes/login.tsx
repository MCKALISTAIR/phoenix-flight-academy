import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  Lock,
  UserPlus,
  CheckCircle2,
  GraduationCap,
  PlaneTakeoff,
  MapPin,
  ShieldCheck,
  Radio,
  Cloud,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterStudentForm } from "@/components/auth/RegisterStudentForm";
import { RegisterPilotForm } from "@/components/auth/RegisterPilotForm";
import { PasswordResetDialog } from "@/components/auth/PasswordResetDialog";

type LoginSearch = { redirect?: string; tab?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({
        to: search.redirect ?? (await defaultDestinationFor(data.session.user.id)),
      });
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign In & Member Portal | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Access the Phoenix Flight online portal. Member login and prospective student/renter registration gateway at Cumbernauld Airport.",
      },
    ],
  }),
});

type ViewMode = "login" | "register";
type RegisterType = "student" | "pilot";

async function defaultDestinationFor(userId: string): Promise<string> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("super_admin") || roles.includes("admin")) return "/cms";
  return "/booking/dashboard";
}

function LoginPage() {
  const search = Route.useSearch();

  const [viewMode, setViewMode] = useState<ViewMode>(
    search.tab === "register" ? "register" : "login",
  );
  const [registerType, setRegisterType] = useState<RegisterType>("student");
  const [submitted, setSubmitted] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showDecoded, setShowDecoded] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-muted/20">
      {/* Aerodrome Header Strip */}
      <div className="bg-[oklch(0.12_0.04_250)] py-8 border-b border-white/10 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 border border-white/15 p-2 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Phoenix Flight Academy"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Flight Operations & Booking Portal
                </h1>
                <p className="text-xs text-white/70">
                  Phoenix Flight Training • Cumbernauld Airport
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-mono text-white/90 border border-white/15 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-primary">EGPG</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums">RWY 26/08</span>
              <span className="text-white/30">|</span>
              <span className="tabular-nums">120.605 MHz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Authentication Content */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-12 items-start">
          {/* Form Card (7 cols) */}
          <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Two-Way View Toggle */}
            <div className="flex border-b border-border bg-muted/40">
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setSubmitted(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all ${
                  viewMode === "login"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("register");
                  setSubmitted(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold border-b-2 transition-all ${
                  viewMode === "register"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Create Account / Enroll
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {submitted ? (
                /* Registration Success Confirmation */
                <div className="text-center py-8 space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground">
                      Registration Received!
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-md mx-auto">
                      Your application for{" "}
                      <strong>
                        {registerType === "student"
                          ? "PPL Flight Training"
                          : "Self-Hire Pilot Privileges"}
                      </strong>{" "}
                      has been logged. We&apos;ve sent a verification link to your email. Once
                      confirmed, you can sign in to schedule your first flight or checkout.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setViewMode("login");
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                </div>
              ) : viewMode === "login" ? (
                /* Streamlined Login Form */
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-extrabold text-foreground">Welcome Back</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your credentials to manage your training records, bookings, and flight
                      logs.
                    </p>
                  </div>
                  <LoginForm
                    onForgotPassword={() => setForgotOpen(true)}
                    redirectUrl={search.redirect}
                  />
                </div>
              ) : (
                /* Registration Flow with Tab Switcher */
                <div className="space-y-6">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">
                      Select Your Journey Type
                    </div>
                    <h2 className="text-xl font-extrabold text-foreground">
                      Start Flying at Cumbernauld
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select your pathway below to set up your online pilot account.
                    </p>
                  </div>

                  {/* Student vs Licensed Pilot Sub-Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted/60 border border-border">
                    <button
                      type="button"
                      onClick={() => setRegisterType("student")}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
                        registerType === "student"
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      Student Pilot
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterType("pilot")}
                      className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${
                        registerType === "pilot"
                          ? "bg-card text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <PlaneTakeoff className="h-3.5 w-3.5 text-primary" />
                      Licensed Self-Hire
                    </button>
                  </div>

                  {registerType === "student" ? (
                    <RegisterStudentForm
                      onSuccess={() => setSubmitted(true)}
                      redirectUrl={search.redirect}
                    />
                  ) : (
                    <RegisterPilotForm
                      onSuccess={() => setSubmitted(true)}
                      redirectUrl={search.redirect}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Operations & Airfield Info Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Airfield Weather & Flying Status */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/40 px-5 py-3.5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  Live Airfield Weather
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDecoded(!showDecoded)}
                  className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20 active:scale-[0.98]"
                >
                  {showDecoded ? "Show METAR" : "Decode Weather"}
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Airfield Flying Status Badge */}
                <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold leading-tight">
                    Cumbernauld flights are operating normally
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                      Cumbernauld EGPG
                    </span>
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      VFR Active
                    </span>
                  </div>

                  {!showDecoded ? (
                    <div className="mt-2 rounded-lg bg-[oklch(0.15_0.03_250)] p-3 text-xs font-mono text-emerald-400 border border-white/10 leading-relaxed tracking-wide">
                      EGPG 171120Z 24012KT 9999 FEW035 14/08 Q1018
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg bg-[oklch(0.15_0.03_250)] p-3 text-xs font-mono text-slate-200 border border-white/10 space-y-1 leading-relaxed">
                      <p>
                        <span className="text-blue-400 font-semibold">WIND:</span> 240° at 12 knots
                        (Runway 26 in use)
                      </p>
                      <p>
                        <span className="text-blue-400 font-semibold">VISIBILITY:</span> 10km+ (Full
                        VFR Range)
                      </p>
                      <p>
                        <span className="text-blue-400 font-semibold">CLOUDS:</span> Few Clouds at
                        3,500 ft AGL
                      </p>
                      <p>
                        <span className="text-blue-400 font-semibold">TEMP/DEW:</span> 14°C / 08°C
                      </p>
                      <p>
                        <span className="text-blue-400 font-semibold">ALTIMETER:</span> QNH 1018 hPa
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-4 w-4" />
                Airfield Operations
              </div>
              <h3 className="text-base font-bold text-foreground">Cumbernauld Airport (EGPG)</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Phoenix Flight Academy operates 7 days a week from Cumbernauld Airport, Scotland.
                Our airfield features an 820m asphalt runway, AFISO flight information service, and
                active flying training circuits.
              </p>

              <div className="space-y-2.5 pt-2 text-xs border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Radio Communications</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    120.605 MHz
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Operations Desk</span>
                  <span className="font-mono font-bold text-foreground">+44 (0) 1236 730 000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fuel Availability</span>
                  <span className="font-mono font-bold text-foreground">AVGAS 100LL & UL91</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Location & Transport
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Situated off the M80 motorway, 15 miles northeast of Glasgow and 30 miles west of
                Edinburgh. Free parking for students and visitors directly adjacent to the clubhouse
                hangar.
              </p>
              <div className="pt-1">
                <Link to="/contact" className="text-xs font-bold text-primary hover:underline">
                  View Driving Directions & Visiting Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <PasswordResetDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
