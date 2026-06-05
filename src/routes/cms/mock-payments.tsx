import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CreditCard, Loader2, AlertCircle, CheckCircle2, XCircle, Search } from "lucide-react";
import { listAllBookings } from "@/lib/bookings.functions";
import { completeMockPayment, getCheckoutSession } from "@/lib/mock-payments.functions";

export const Route = createFileRoute("/cms/mock-payments")({
  component: MockPaymentsPage,
  head: () => ({ meta: [{ title: "Mock Payments | CMS" }] }),
});

function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function MockPaymentsPage() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllBookings);
  const fetchSession = useServerFn(getCheckoutSession);
  const pay = useServerFn(completeMockPayment);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["cms-bookings-all"],
    queryFn: () => fetchAll({ data: {} }),
  });

  const [manualId, setManualId] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function run(id: string, outcome: "paid" | "failed") {
    setError(null);
    setResult(null);
    setBusyId(id);
    try {
      const res = await pay({ data: { bookingId: id, outcome } });
      setResult(`Booking ${id.slice(0, 8)}… → status: ${res.status}, payment: ${res.paymentStatus}`);
      await qc.invalidateQueries({ queryKey: ["cms-bookings-all"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function lookupAndPay(outcome: "paid" | "failed") {
    const id = manualId.trim();
    if (!id) {
      setError("Enter a booking ID.");
      return;
    }
    setError(null);
    setBusyId(id);
    try {
      // Validate it exists first for a nicer error.
      await fetchSession({ data: { bookingId: id } });
      await run(id, outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking not found.");
      setBusyId(null);
    }
  }

  return (
    <div className="p-8 text-white">
      <div className="mb-6 flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-[oklch(0.75_0.18_270)]" />
        <div>
          <h1 className="text-2xl font-extrabold">Mock Payments</h1>
          <p className="text-sm text-white/50">
            Simulate the payment-provider webhook for any booking. Dev/admin only — replace when a real provider is live.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-4 w-4 text-amber-400" />
        <p className="text-amber-200/90">
          "Paid" sets payment_status to <code>paid</code> / <code>deposit_paid</code> (depending on payment mode) and
          flips status to <code>confirmed</code> unless the product requires approval. "Failed" leaves the booking
          unpaid.
        </p>
      </div>

      {/* Manual ID form */}
      <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60">Mark by booking ID</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Booking UUID"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm font-mono"
            />
          </div>
          <button
            type="button"
            disabled={!!busyId}
            onClick={() => lookupAndPay("paid")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {busyId === manualId.trim() ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Mark paid
          </button>
          <button
            type="button"
            disabled={!!busyId}
            onClick={() => lookupAndPay("failed")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" /> Mark failed
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {result && <p className="mt-3 text-sm text-emerald-400">{result}</p>}
      </section>

      {/* Recent bookings list */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60">Recent bookings</h2>
        {isLoading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Payment</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(bookings ?? []).slice(0, 50).map((b) => {
                  const row = b as {
                    id: string;
                    starts_at: string;
                    customer_name: string;
                    customer_email: string;
                    status: string;
                    payment_status: string;
                    price_total_cents: number;
                    booking_products: { name: string; payment_mode: string } | null;
                  };
                  return (
                    <tr key={row.id} className="border-t border-white/5">
                      <td className="py-2 pr-3 text-white/80">
                        {new Date(row.starts_at).toLocaleString("en-GB")}
                      </td>
                      <td className="py-2 pr-3">{row.booking_products?.name ?? "—"}</td>
                      <td className="py-2 pr-3 text-white/70">
                        <div>{row.customer_name}</div>
                        <div className="text-xs text-white/40">{row.customer_email}</div>
                      </td>
                      <td className="py-2 pr-3 capitalize">{row.status}</td>
                      <td className="py-2 pr-3 capitalize">{row.payment_status}</td>
                      <td className="py-2 pr-3">{money(row.price_total_cents)}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-white/40">{row.id.slice(0, 8)}…</td>
                      <td className="py-2 pr-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            disabled={!!busyId}
                            onClick={() => run(row.id, "paid")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            {busyId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Paid
                          </button>
                          <button
                            type="button"
                            disabled={!!busyId}
                            onClick={() => run(row.id, "failed")}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
                          >
                            <XCircle className="h-3 w-3" /> Failed
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(bookings ?? []).length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-sm text-white/40">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}