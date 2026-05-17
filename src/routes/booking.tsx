import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Cloud, PlaneTakeoff, Lock, ArrowLeft, Send, CheckCircle2, UserPlus, FileCheck, GraduationCap, Compass } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/booking")({
  component: BookingPortal,
  head: () => ({
    meta: [
      { title: "Portal Login & Registration | Phoenix Flight Training" },
      { name: "description", content: "Access the Phoenix Flight online portal. Unified member login and prospective student/renter registration gateway." }
    ],
  }),
});

type ViewMode = "login" | "register";
type RegisterType = "student" | "pilot";

function BookingPortal() {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [registerType, setRegisterType] = useState<RegisterType>("student");
  const [submitted, setSubmitted] = useState<boolean>(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulates saving to Supabase queued operations
  };

  const resetForm = () => {
    setSubmitted(false);
    setStudentForm({ name: "", email: "", phone: "", course: "ppl", message: "" });
    setPilotForm({ name: "", email: "", license: "ppl", hours: "", medical: "current" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Portal Header */}
      <div className="bg-foreground py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <PlaneTakeoff className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-background">
                  Booking Portal
                </h1>
                <p className="text-sm text-background/80">
                  Phoenix Flight Training Online System
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-background/25 bg-background/5 px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-background/10"
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
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
                      <form className="space-y-5 max-w-md">
                        <div>
                          <label htmlFor="loginEmail" className="block text-sm font-semibold text-foreground">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="loginEmail"
                            required
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
                            className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <a href="#" className="text-xs font-semibold text-primary hover:underline">
                            Forgotten Password?
                          </a>
                        </div>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-transform hover:scale-[1.01]"
                        >
                          Login to Portal
                        </button>
                      </form>
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
                          <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor="stName" className="block text-sm font-semibold text-foreground">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  id="stName"
                                  required
                                  value={studentForm.name}
                                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                  placeholder="John Smith"
                                />
                              </div>
                              <div>
                                <label htmlFor="stPhone" className="block text-sm font-semibold text-foreground">
                                  Contact Number
                                </label>
                                <input
                                  type="tel"
                                  id="stPhone"
                                  required
                                  value={studentForm.phone}
                                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                  placeholder="07123 456789"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="stEmail" className="block text-sm font-semibold text-foreground">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="stEmail"
                                required
                                value={studentForm.email}
                                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                placeholder="john@example.com"
                              />
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
                          <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label htmlFor="pName" className="block text-sm font-semibold text-foreground">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  id="pName"
                                  required
                                  value={pilotForm.name}
                                  onChange={(e) => setPilotForm({ ...pilotForm, name: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                  placeholder="Sarah Jenkins"
                                />
                              </div>
                              <div>
                                <label htmlFor="pHours" className="block text-sm font-semibold text-foreground">
                                  Total Logged Flight Hours
                                </label>
                                <input
                                  type="number"
                                  id="pHours"
                                  required
                                  value={pilotForm.hours}
                                  onChange={(e) => setPilotForm({ ...pilotForm, hours: e.target.value })}
                                  className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                  placeholder="e.g. 150"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="pEmail" className="block text-sm font-semibold text-foreground">
                                Email Address
                              </label>
                              <input
                                type="email"
                                id="pEmail"
                                required
                                value={pilotForm.email}
                                onChange={(e) => setPilotForm({ ...pilotForm, email: e.target.value })}
                                className="mt-1.5 block w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm focus:border-primary focus:outline-none"
                                placeholder="sarah@example.com"
                              />
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
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  Airport METAR
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cumbernauld (Edinburgh Ref)</h3>
                  <div className="mt-2 rounded-lg bg-foreground p-3 text-sm font-mono text-background">
                    EGPH 171120Z 24015KT 9999 FEW030 14/08 Q1012
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Forecast TAF</h3>
                  <div className="mt-2 rounded-lg bg-foreground p-3 text-sm font-mono text-background">
                    EGPH 171100Z 1712/1812 24015KT 9999 SCT030
                  </div>
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
