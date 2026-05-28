import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { listExpiringDocuments } from "@/lib/students.functions";

export const Route = createFileRoute("/cms/expiries")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ExpiriesPage,
});

function daysUntil(d: string | null | undefined) {
  if (!d) return null;
  const t = new Date(d).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((t - today.getTime()) / 86400000);
}

function ExpiriesPage() {
  const fn = useServerFn(listExpiringDocuments);
  const { data, isLoading } = useQuery({
    queryKey: ["expiring-docs"],
    queryFn: () => fn(),
  });

  const docs = (data?.documents ?? []).map((d) => ({ ...d, days: daysUntil(d.expires_on) }));
  const expired = docs.filter((d) => d.days !== null && d.days < 0);
  const within30 = docs.filter((d) => d.days !== null && d.days >= 0 && d.days <= 30);
  const within90 = docs.filter((d) => d.days !== null && d.days > 30 && d.days <= 90);
  const beyond = docs.filter((d) => d.days !== null && d.days > 90);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[oklch(0.70_0.18_270)]" />
          Document Expiries
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Medicals, licenses and IDs across all students. Renew anything red or amber before next flight.
        </p>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-white/40 text-sm">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Expired" value={expired.length} color="text-red-400 border-red-500/20 bg-red-500/10" />
            <Stat label="≤ 30 days" value={within30.length} color="text-amber-400 border-amber-500/20 bg-amber-500/10" />
            <Stat label="31 – 90 days" value={within90.length} color="text-yellow-300 border-yellow-500/20 bg-yellow-500/10" />
            <Stat label="> 90 days" value={beyond.length} color="text-emerald-400 border-emerald-500/20 bg-emerald-500/10" />
          </div>

          <Group title="Expired" items={expired} severity="red" />
          <Group title="Expiring within 30 days" items={within30} severity="amber" />
          <Group title="Expiring within 90 days" items={within90} severity="yellow" />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs font-semibold mt-1">{label}</div>
    </div>
  );
}

function Group({
  title,
  items,
  severity,
}: {
  title: string;
  items: any[];
  severity: "red" | "amber" | "yellow";
}) {
  if (items.length === 0) return null;
  const dotColor =
    severity === "red" ? "text-red-400" : severity === "amber" ? "text-amber-400" : "text-yellow-300";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 text-sm font-bold text-white flex items-center gap-2">
        <AlertTriangle className={`h-4 w-4 ${dotColor}`} />
        {title} <span className="text-white/40 font-normal">({items.length})</span>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
          <tr>
            <th className="px-3 py-2 text-left">Student</th>
            <th className="px-3 py-2 text-left">Document</th>
            <th className="px-3 py-2 text-left">Number</th>
            <th className="px-3 py-2 text-left">Expires</th>
            <th className="px-3 py-2 text-right">Days</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/80">
          {items.map((d) => (
            <tr key={d.id}>
              <td className="px-3 py-2 text-white font-semibold">
                {d.student?.display_name ?? "—"}
              </td>
              <td className="px-3 py-2 capitalize">{d.document_type.replace(/_/g, " ")}</td>
              <td className="px-3 py-2 font-mono">{d.document_number ?? "—"}</td>
              <td className="px-3 py-2">{d.expires_on}</td>
              <td className={`px-3 py-2 text-right font-bold ${dotColor}`}>
                {d.days < 0 ? `${-d.days}d ago` : `${d.days}d`}
              </td>
              <td className="px-3 py-2">
                {d.student && (
                  <Link
                    to="/cms/students/$studentId"
                    params={{ studentId: d.student.id }}
                    className="text-[oklch(0.75_0.18_270)] hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}