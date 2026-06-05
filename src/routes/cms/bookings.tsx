import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { listAllBookings, updateBookingStatus } from "@/lib/bookings.functions";

export const Route = createFileRoute("/cms/bookings")({
  beforeLoad: async ({ location }) => {
    try { await requireSuperAdmin(location.href); } catch (e) { if (isRedirect(e)) throw e; throw redirect({ to: "/login", search: { redirect: location.href } }); }
  },
  component: BookingsAdmin,
});

const STATUSES = ["all", "pending", "confirmed", "cancelled", "completed", "no_show"] as const;
type StatusFilter = typeof STATUSES[number];

function BookingsAdmin() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllBookings);
  const updateStatus = useServerFn(updateBookingStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-bookings", filter],
    queryFn: () => fetchAll({ data: { status: filter === "all" ? null : filter } }),
  });

  const mut = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-bookings"] }),
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Bookings</h1>
        <p className="mt-1 text-sm text-white/50">Approve, cancel, or mark bookings complete.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === s
                ? "border-[oklch(0.55_0.22_270)] bg-[oklch(0.55_0.22_270)]/15 text-[oklch(0.75_0.18_270)]"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {isLoading ? (
          <div className="p-8 text-white/40">Loading…</div>
        ) : !data || data.length === 0 ? (
          <div className="p-8 text-white/40">No bookings match this filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Aircraft</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((b) => {
                const prod = (b as { booking_products: { name: string } | null }).booking_products;
                const ac = (b as { aircraft: { registration: string } | null }).aircraft;
                return (
                  <tr key={b.id} className="border-b border-white/5 text-white">
                    <td className="px-4 py-3 text-white/70">{new Date(b.starts_at).toLocaleString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{b.customer_name}</p>
                      <p className="text-xs text-white/50">{b.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">{prod?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/70">{ac?.registration ?? "—"}</td>
                    <td className="px-4 py-3 text-white/70">£{(b.price_total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {b.status === "pending" && (
                          <button
                            onClick={() => mut.mutate({ data: { id: b.id, status: "confirmed" } })}
                            className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
                          >
                            Approve
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => mut.mutate({ data: { id: b.id, status: "completed" } })}
                            className="rounded-lg bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/25"
                          >
                            Mark done
                          </button>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <button
                            onClick={() => {
                              const reason = window.prompt("Cancellation reason?");
                              if (reason === null) return;
                              mut.mutate({ data: { id: b.id, status: "cancelled", cancellation_reason: reason || null } });
                            }}
                            className="rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: typeof Clock }> = {
    pending: { cls: "text-amber-400 bg-amber-500/15", Icon: Clock },
    confirmed: { cls: "text-emerald-400 bg-emerald-500/15", Icon: CheckCircle2 },
    cancelled: { cls: "text-red-400 bg-red-500/15", Icon: XCircle },
    completed: { cls: "text-blue-400 bg-blue-500/15", Icon: CheckCircle2 },
    no_show: { cls: "text-white/50 bg-white/10", Icon: AlertCircle },
  };
  const { cls, Icon } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      <Icon className="h-3 w-3" /> {status.replace("_", " ")}
    </span>
  );
}