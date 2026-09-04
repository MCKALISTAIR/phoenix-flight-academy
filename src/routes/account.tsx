import { createFileRoute, redirect, isRedirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  GraduationCap,
  Plane,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
} from "lucide-react";
import { requireAuth } from "@/lib/auth-guards";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyCustomerStatus,
  becomeStudent,
  submitPilotVerification,
  withdrawPilotVerification,
} from "@/lib/customer-tier.functions";

export const Route = createFileRoute("/account")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAuth(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AccountPage,
  head: () => ({ meta: [{ title: "My Account | Phoenix Flight Training" }] }),
  errorComponent: ({ error }) => (
    <div className="p-10 text-white/70">Couldn't load your account: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-10 text-white/70">Not found.</div>,
});

function AccountPage() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getMyCustomerStatus);
  const becomeStudentFn = useServerFn(becomeStudent);
  const submitFn = useServerFn(submitPilotVerification);
  const withdrawFn = useServerFn(withdrawPilotVerification);

  const { data, isLoading } = useQuery({
    queryKey: ["my-customer-status"],
    queryFn: () => fetchStatus(),
  });

  const becomeStudentMut = useMutation({
    mutationFn: () => becomeStudentFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-customer-status"] }),
  });

  const withdrawMut = useMutation({
    mutationFn: (id: string) => withdrawFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-customer-status"] }),
  });

  const tier = data?.profile?.tier ?? null;
  const pending = data?.latestRequest?.status === "pending" ? data.latestRequest : null;
  const lastRequest = data?.latestRequest;

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_250)] text-white">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
          <p className="mt-2 text-white/60">Manage your tier and qualifications.</p>
        </div>

        {isLoading ? (
          <div className="text-white/50">Loading…</div>
        ) : (
          <div className="space-y-6">
            <TierCard tier={tier} qualifiedAt={data?.profile?.qualified_at ?? null} />

            {tier === null && !pending && (
              <ChooseTierCard
                onBecomeStudent={() => becomeStudentMut.mutate()}
                busy={becomeStudentMut.isPending}
                error={becomeStudentMut.error?.message ?? null}
              />
            )}

            {tier === "student" && !pending && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Already qualified?</h2>
                    <p className="text-sm text-white/60">
                      Submit your licence for verification to unlock self-hire.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tier !== "pilot" && !pending && (
              <PilotVerificationForm onSubmit={(payload) => submitFn({ data: payload })} />
            )}

            {pending && (
              <PendingCard
                request={pending}
                onWithdraw={() => withdrawMut.mutate(pending.id)}
                busy={withdrawMut.isPending}
              />
            )}

            {!pending &&
              lastRequest &&
              lastRequest.status !== "approved" &&
              lastRequest.status !== "withdrawn" && <LastDecisionCard request={lastRequest} />}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Book a flight
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TierCard({ tier, qualifiedAt }: { tier: string | null; qualifiedAt: string | null }) {
  const meta =
    tier === "pilot"
      ? {
          Icon: Plane,
          label: "Pilot",
          color: "text-emerald-400",
          bg: "bg-emerald-500/15",
          blurb: "You're cleared for self-hire bookings.",
        }
      : tier === "student"
        ? {
            Icon: GraduationCap,
            label: "Student",
            color: "text-sky-400",
            bg: "bg-sky-500/15",
            blurb: "You can book training lessons with an instructor.",
          }
        : {
            Icon: ShieldCheck,
            label: "No tier yet",
            color: "text-white/70",
            bg: "bg-white/10",
            blurb: "Pick a path below to get started.",
          };
  const Icon = meta.Icon;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-white/40">Current tier</p>
          <h2 className={`text-2xl font-extrabold ${meta.color}`}>{meta.label}</h2>
          <p className="text-sm text-white/60">{meta.blurb}</p>
        </div>
        {qualifiedAt && (
          <div className="text-right text-xs text-white/40">
            Qualified <br />
            {new Date(qualifiedAt).toLocaleDateString("en-GB")}
          </div>
        )}
      </div>
    </section>
  );
}

function ChooseTierCard({
  onBecomeStudent,
  busy,
  error,
}: {
  onBecomeStudent: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-bold">Get started</h2>
      <p className="mt-1 text-sm text-white/60">Tell us how you'll use Phoenix Flight Training.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-sky-400" />
            <h3 className="font-bold">I want to learn to fly</h3>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Become a student. Instant — no approval needed.
          </p>
          <button
            disabled={busy}
            onClick={onBecomeStudent}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {busy ? "Setting up…" : "Become a student"}
          </button>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <Plane className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold">I'm already a pilot</h3>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Submit your licence below. We'll verify and unlock self-hire.
          </p>
        </div>
      </div>
    </section>
  );
}

function PendingCard({
  request,
  onWithdraw,
  busy,
}: {
  request: any;
  onWithdraw: () => void;
  busy: boolean;
}) {
  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
      <div className="flex items-start gap-3">
        <Clock className="mt-1 h-5 w-5 text-amber-400" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-amber-100">Verification pending</h2>
          <p className="mt-1 text-sm text-amber-100/80">
            Submitted {new Date(request.submitted_at).toLocaleString("en-GB")}. We typically review
            within a few working days.
          </p>
          <dl className="mt-3 grid gap-2 text-sm text-amber-100/80 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-amber-100/50">Licence</dt>
              <dd className="font-mono">{request.licence_number}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-amber-100/50">Authority</dt>
              <dd>{request.issuing_authority}</dd>
            </div>
          </dl>
          <button
            onClick={onWithdraw}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-500/25 disabled:opacity-50"
          >
            Withdraw request
          </button>
        </div>
      </div>
    </section>
  );
}

function LastDecisionCard({ request }: { request: any }) {
  const rejected = request.status === "rejected";
  return (
    <section
      className={`rounded-2xl border p-6 ${rejected ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"}`}
    >
      <div className="flex items-start gap-3">
        {rejected ? (
          <XCircle className="mt-1 h-5 w-5 text-red-400" />
        ) : (
          <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-400" />
        )}
        <div>
          <h2 className="text-lg font-bold">
            {rejected ? "Last request rejected" : `Last request: ${request.status}`}
          </h2>
          {request.review_notes && (
            <p className="mt-1 text-sm text-white/70">"{request.review_notes}"</p>
          )}
          <p className="mt-2 text-xs text-white/40">
            Reviewed{" "}
            {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString("en-GB") : "—"}. You
            can submit a new request below.
          </p>
        </div>
      </div>
    </section>
  );
}

function PilotVerificationForm({ onSubmit }: { onSubmit: (payload: any) => Promise<any> }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    licence_number: "",
    issuing_authority: "UK CAA",
    licence_expiry: "",
    medical_expiry: "",
    ratings: "",
  });
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File, kind: "licence" | "medical"): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user!.id;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${uid}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pilot-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(`${kind} upload failed: ${error.message}`);
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const document_path = licenceFile ? await uploadFile(licenceFile, "licence") : null;
      const medical_document_path = medicalFile ? await uploadFile(medicalFile, "medical") : null;
      await onSubmit({
        licence_number: form.licence_number.trim(),
        issuing_authority: form.issuing_authority.trim(),
        licence_expiry: form.licence_expiry || null,
        medical_expiry: form.medical_expiry || null,
        ratings: form.ratings.trim() || null,
        document_path,
        medical_document_path,
      });
      qc.invalidateQueries({ queryKey: ["my-customer-status"] });
      setForm({
        licence_number: "",
        issuing_authority: "UK CAA",
        licence_expiry: "",
        medical_expiry: "",
        ratings: "",
      });
      setLicenceFile(null);
      setMedicalFile(null);
    } catch (err: any) {
      setError(err.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">Verify as a Qualified Pilot</h2>
      </div>
      <p className="mt-1 text-sm text-white/60">
        Submit your licence details and supporting documents. Approval grants you self-hire access.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Licence number" required>
          <input
            required
            value={form.licence_number}
            onChange={(e) => setForm((f) => ({ ...f, licence_number: e.target.value }))}
            className={inputCls}
            maxLength={64}
          />
        </Field>
        <Field label="Issuing authority" required>
          <input
            required
            value={form.issuing_authority}
            onChange={(e) => setForm((f) => ({ ...f, issuing_authority: e.target.value }))}
            className={inputCls}
            maxLength={120}
          />
        </Field>
        <Field label="Licence expiry">
          <input
            type="date"
            value={form.licence_expiry}
            onChange={(e) => setForm((f) => ({ ...f, licence_expiry: e.target.value }))}
            className={inputCls}
          />
        </Field>
        <Field label="Medical expiry">
          <input
            type="date"
            value={form.medical_expiry}
            onChange={(e) => setForm((f) => ({ ...f, medical_expiry: e.target.value }))}
            className={inputCls}
          />
        </Field>
        <Field label="Ratings (optional)" full>
          <textarea
            value={form.ratings}
            onChange={(e) => setForm((f) => ({ ...f, ratings: e.target.value }))}
            placeholder="e.g. SEP (Land), Night, IR(R)"
            className={`${inputCls} min-h-[72px] resize-y`}
            maxLength={500}
          />
        </Field>
        <FileField
          label="Licence document (PDF or image)"
          file={licenceFile}
          setFile={setLicenceFile}
        />
        <FileField
          label="Medical document (optional)"
          file={medicalFile}
          setFile={setMedicalFile}
        />

        {error && (
          <div className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all active:scale-[0.98] active:translate-y-[0.5px] hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit for verification"}
          </button>
        </div>
      </form>
    </section>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-surface-navy px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none";

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

function FileField({
  label,
  file,
  setFile,
}: {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
}) {
  return (
    <Field label={label}>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white/70 hover:border-white/30">
        <Upload className="h-4 w-4" />
        <span className="flex-1 truncate">{file ? file.name : "Choose a file…"}</span>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>
    </Field>
  );
}
