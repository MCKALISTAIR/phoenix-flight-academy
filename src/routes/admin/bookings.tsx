import { createFileRoute, useNavigate, isRedirect, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Search, RefreshCw, BadgeCheck, CirclePoundSterling, X } from "lucide-react";
import { toast } from "sonner";
import { requireAdmin } from "@/lib/auth-guards";
import {
  listAllBookings,
  recordManualPayment,
  updateBookingStatus,
} from "@/lib/bookings.functions";

export const Route = createFileRoute("/admin/bookings")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { title: "All Bookings & Payments | Phoenix Flight Training" },
      {
        name: "description",
        content: "Staff view of every paid and unpaid booking, with tools to resolve balances.",
      },
      { property: "og:title", content: "All Bookings & Payments | Phoenix Flight Training" },
      {
        property: "og:description",
        content: "Staff view of every paid and unpaid booking, with tools to resolve balances.",
      },
    ],
  }),
  component: AdminBookingsPage,
});

type BookingRow = Awaited<ReturnType<typeof listAllBookings>>[number];

type PaymentFilter = "all" | "unpaid" | "deposit_paid" | "paid" | "refunded" | "partial_refund";

const PAYMENT_FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "deposit_paid", label: "Deposit paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "partial_refund", label: "Partial refund" },
];

const PAYMENT_METHODS = [
  { value: "card_terminal", label: "Card Terminal (Desk)" },
  { value: "cash", label: "Cash (Desk)" },
  { value: "bacs_transfer", label: "BACS Bank Transfer" },
  { value: "voucher", label: "Voucher / Account Credit" },
  { value: "other", label: "Other" },
] as const;

function formatMoney(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function paymentBadge(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "deposit_paid":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "refunded":
    case "partial_refund":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    default:
      return "bg-red-500/15 text-red-300 border-red-500/30";
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    case "cancelled":
    case "no_show":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    default:
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AdminBookingsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [resolving, setResolving] = useState<BookingRow | null>(null);

  const fetchAll = useServerFn(listAllBookings);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAll({ data: {} });
      setRows((data ?? []) as BookingRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (paymentFilter !== "all" && row.payment_status !== paymentFilter) return false;
      if (!term) return true;
      return (
        row.customer_name.toLowerCase().includes(term) ||
        row.customer_email.toLowerCase().includes(term) ||
        row.id.toLowerCase().startsWith(term)
      );
    });
  }, [rows, paymentFilter, search]);

  const totals = useMemo(() => {
    const outstanding = rows
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + Math.max(0, r.price_total_cents - r.amount_paid_cents), 0);
    const collected = rows.reduce((sum, r) => sum + r.amount_paid_cents, 0);
    return { outstanding, collected, count: rows.length };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[oklch(0.12_0.04_250)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">All Bookings</h1>
              <p className="text-xs text-white/50">
                Every paid and unpaid booking, with tools to settle balances.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Bookings</p>
            <p className="mt-1 text-2xl font-bold">{totals.count}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Collected
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {formatMoney(totals.collected)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Outstanding
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-300">
              {formatMoney(totals.outstanding)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, email or reference..."
              className="w-full rounded-md border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setPaymentFilter(f.value)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  paymentFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Flight</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/40">
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/40">
                    No bookings match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const balance = Math.max(0, row.price_total_cents - row.amount_paid_cents);
                  const needsResolve =
                    row.status !== "cancelled" && (balance > 0 || row.status === "pending");
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{row.customer_name}</p>
                        <p className="text-[11px] text-white/40">{row.customer_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white/80">{row.booking_products?.name ?? "Booking"}</p>
                        <p className="text-[11px] text-white/40">
                          {row.aircraft?.registration ?? "—"}
                          {row.instructors?.name ? ` • ${row.instructors.name}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-white/70">{formatDateTime(row.starts_at)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatMoney(row.price_total_cents)}
                      </td>
                      <td className="px-4 py-3 text-right text-white/70">
                        {formatMoney(row.amount_paid_cents)}
                        {balance > 0 && row.status !== "cancelled" && (
                          <p className="text-[10px] text-amber-300">{formatMoney(balance)} due</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${paymentBadge(row.payment_status)}`}
                        >
                          {labelize(row.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadge(row.status)}`}
                        >
                          {labelize(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {needsResolve ? (
                          <button
                            type="button"
                            onClick={() => setResolving(row)}
                            className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
                          >
                            Resolve
                          </button>
                        ) : (
                          <span className="text-[11px] text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {resolving && (
        <ResolveDialog
          booking={resolving}
          onClose={() => setResolving(null)}
          onDone={() => {
            setResolving(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function ResolveDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const balance = Math.max(0, booking.price_total_cents - booking.amount_paid_cents);
  const [amountPounds, setAmountPounds] = useState((balance / 100).toFixed(2));
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["value"]>("card_terminal");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleRecordPayment() {
    const cents = Math.round(parseFloat(amountPounds || "0") * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const result = await recordManualPayment({
        data: {
          bookingId: booking.id,
          amountCents: cents,
          paymentMethod: method,
          reference: reference || null,
        },
      });
      toast.success(
        result.isFullyPaid
          ? "Balance settled — booking is fully paid"
          : `Payment recorded — ${formatMoney(result.balanceRemainingCents)} still due`,
      );
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record payment");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await updateBookingStatus({ data: { id: booking.id, status: "confirmed" } });
      toast.success("Booking confirmed");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not confirm booking");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[oklch(0.16_0.04_250)] p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold">Resolve booking</h2>
            <p className="mt-0.5 text-xs text-white/50">
              {booking.customer_name} • {booking.booking_products?.name ?? "Booking"} •{" "}
              {formatDateTime(booking.starts_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-white/50">Total</span>
            <span>{formatMoney(booking.price_total_cents)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-white/50">Paid so far</span>
            <span>{formatMoney(booking.amount_paid_cents)}</span>
          </div>
          <div className="flex justify-between py-0.5 font-semibold">
            <span className="text-white/50">Balance due</span>
            <span className={balance > 0 ? "text-amber-300" : "text-emerald-300"}>
              {formatMoney(balance)}
            </span>
          </div>
        </div>

        {balance > 0 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-white/40">
                Amount received (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPounds}
                onChange={(e) => setAmountPounds(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-white/40">
                Payment method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-[oklch(0.16_0.04_250)]">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-white/40">
                Reference (optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. BACS ref or till receipt no."
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRecordPayment()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <CirclePoundSterling className="h-4 w-4" />
              Record payment
            </button>
          </div>
        )}

        {booking.status === "pending" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className={`flex w-full items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-3 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 ${balance > 0 ? "mt-3" : ""}`}
          >
            <BadgeCheck className="h-4 w-4" />
            Confirm booking
          </button>
        )}
      </div>
    </div>
  );
}
