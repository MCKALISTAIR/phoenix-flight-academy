import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Coins,
  TrendingUp,
  CreditCard,
  Send,
  BookOpen,
  DollarSign,
  X,
  Loader2,
  Plane,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import {
  listAllBookings,
  updateBookingStatus,
  recordManualPayment,
  triggerBookingReminder,
} from "@/lib/bookings.functions";
import { listStudents } from "@/lib/students.functions";
import { createFlightLogEntry } from "@/lib/flight-log.functions";

export const Route = createFileRoute("/cms/bookings")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: BookingsAdmin,
});

const STATUSES = ["all", "pending", "confirmed", "cancelled", "completed", "no_show"] as const;
type StatusFilter = (typeof STATUSES)[number];

function formatDocType(type: string): string {
  const mapping: Record<string, string> = {
    medical_class1: "Medical Class 1",
    medical_class2: "Medical Class 2",
    medical_lapl: "LAPL Medical",
    student_pilot_license: "Student License",
    ppl: "PPL License",
    lapl: "LAPL License",
    rt_license: "RT License",
    language_proficiency: "ELP",
  };
  return mapping[type] || type.replace(/_/g, " ");
}

function BookingsAdmin() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllBookings);
  const updateStatus = useServerFn(updateBookingStatus);
  const payManual = useServerFn(recordManualPayment);
  const sendReminder = useServerFn(triggerBookingReminder);
  const fetchStudents = useServerFn(listStudents);
  const saveFlightLog = useServerFn(createFlightLogEntry);

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["cms-bookings"],
    queryFn: () => fetchAll({ data: { status: null } }),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: () => fetchStudents(),
  });
  const studentsList = studentsData?.students ?? [];

  const mut = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-bookings"] });
      qc.invalidateQueries({ queryKey: ["cms-dashboard"] });
    },
  });

  // Modal States
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null);
  const [payAmountPounds, setPayAmountPounds] = useState("");
  const [payMethod, setPayMethod] = useState<"card_terminal" | "cash" | "bacs_transfer" | "voucher">("card_terminal");
  const [payRef, setPayRef] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payMessage, setPayMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Reminder State
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<Record<string, string>>({});

  // Log Flight Modal State
  const [logModalBooking, setLogModalBooking] = useState<any | null>(null);
  const [logStudentId, setLogStudentId] = useState("");
  const [logPicName, setLogPicName] = useState("Capt. Alistair McKay");
  const [logRemarks, setLogRemarks] = useState("");
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logMessage, setLogMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Financial Metrics computations
  const totalBookedValue = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price_total_cents, 0);

  const collectedRevenue = allBookings.reduce((sum, b) => sum + (b.amount_paid_cents || 0), 0);

  const outstandingInvoiceValue = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + Math.max(0, b.price_total_cents - (b.amount_paid_cents || 0)), 0);

  const filteredData =
    filter === "all" ? allBookings : allBookings.filter((b) => b.status === filter);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentBooking) return;
    const pounds = parseFloat(payAmountPounds);
    if (isNaN(pounds) || pounds <= 0) {
      setPayMessage({ kind: "err", text: "Please enter a valid amount greater than £0.00" });
      return;
    }

    setPaySubmitting(true);
    setPayMessage(null);
    try {
      await payManual({
        data: {
          bookingId: paymentBooking.id,
          amountCents: Math.round(pounds * 100),
          paymentMethod: payMethod,
          reference: payRef.trim() || null,
        },
      });
      qc.invalidateQueries({ queryKey: ["cms-bookings"] });
      qc.invalidateQueries({ queryKey: ["cms-dashboard"] });
      setPayMessage({ kind: "ok", text: "Payment successfully recorded!" });
      setTimeout(() => {
        setPaymentBooking(null);
        setPayMessage(null);
      }, 1000);
    } catch (err) {
      setPayMessage({ kind: "err", text: err instanceof Error ? err.message : "Failed to record payment" });
    } finally {
      setPaySubmitting(false);
    }
  }

  async function handleSendReminder(bookingId: string) {
    setSendingReminderId(bookingId);
    try {
      const res = await sendReminder({ data: { bookingId } });
      setReminderStatus((prev) => ({
        ...prev,
        [bookingId]: res.sent ? "Sent ✓" : res.reason === "not_configured" ? "Email pending domain" : "Failed",
      }));
    } catch (e) {
      setReminderStatus((prev) => ({ ...prev, [bookingId]: "Error" }));
    } finally {
      setSendingReminderId(null);
    }
  }

  function openLogModal(b: any) {
    setLogModalBooking(b);
    setLogMessage(null);
    // Attempt to match customer to an enrolled student
    const matchedStudent = studentsList.find(
      (s) => s.user_id === b.user_id || s.display_name?.toLowerCase() === b.customer_name?.toLowerCase(),
    );
    setLogStudentId(matchedStudent?.id || studentsList[0]?.id || "");
    const instructorName = b.instructors?.name || "Capt. Alistair McKay";
    setLogPicName(instructorName);
    setLogRemarks(b.booking_products?.name ? `Completed ${b.booking_products.name}` : "Flight training exercise");
  }

  async function handleSaveLogEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!logModalBooking || !logStudentId) {
      setLogMessage({ kind: "err", text: "Please select an enrolled student to log this flight to." });
      return;
    }

    setLogSubmitting(true);
    setLogMessage(null);
    try {
      const offBlocks = new Date(logModalBooking.starts_at);
      const onBlocks = new Date(logModalBooking.ends_at);
      const flightDate = logModalBooking.starts_at.slice(0, 10);
      const durationMin = Math.max(15, Math.round((onBlocks.getTime() - offBlocks.getTime()) / 60000));

      await saveFlightLog({
        data: {
          student_id: logStudentId,
          aircraft_registration: logModalBooking.aircraft?.registration || "G-EGPG",
          aircraft_model: logModalBooking.aircraft?.model || "Piper PA-28 Archer III",
          departure_aerodrome: "EGPG",
          arrival_aerodrome: "EGPG",
          off_blocks_at: offBlocks.toISOString(),
          on_blocks_at: onBlocks.toISOString(),
          flight_date: flightDate,
          pic_name: logPicName,
          capacity: "dual",
          dual_received_minutes: durationMin,
          single_pilot_se_minutes: durationMin,
          landings_day: 1,
          landings_night: 0,
          night_minutes: 0,
          ifr_minutes: 0,
          remarks: logRemarks,
          exercises: [],
        },
      });

      qc.invalidateQueries({ queryKey: ["students"] });
      setLogMessage({ kind: "ok", text: "Flight logged directly to student logbook!" });
      setTimeout(() => {
        setLogModalBooking(null);
        setLogMessage(null);
      }, 1200);
    } catch (err) {
      setLogMessage({ kind: "err", text: err instanceof Error ? err.message : "Failed to log flight" });
    } finally {
      setLogSubmitting(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Bookings &amp; Operations Management</h1>
        <p className="mt-1 text-sm text-white/50">
          Approve, cancel, take desk payments, send flight briefings, and log completed lessons.
        </p>
      </div>

      {/* Financial Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Booked Value</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-black text-white">£{(totalBookedValue / 100).toFixed(2)}</p>
          <span className="text-[10px] text-white/30 font-medium">Excluding cancelled bookings</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">Collected Revenue</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-400">£{(collectedRevenue / 100).toFixed(2)}</p>
          <span className="text-[10px] text-white/30 font-medium">Card, cash, BACS &amp; deposit payments</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Balances</span>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-amber-400">£{(outstandingInvoiceValue / 100).toFixed(2)}</p>
          <span className="text-[10px] text-white/30 font-medium">Due to be settled in person or invoiced</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 pt-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all uppercase tracking-wider ${
              filter === s
                ? "border-primary bg-primary/20 text-primary font-bold"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-white/40">Loading bookings…</div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-white/40">No bookings match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Aircraft</th>
                  <th className="px-4 py-3">Financials</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Operations Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((b) => {
                  const prod = (b as { booking_products: { name: string } | null }).booking_products;
                  const ac = (b as { aircraft: { registration: string } | null }).aircraft;
                  const safetyFlag = (b as { safety_flag?: boolean }).safety_flag;
                  const expiredDocs = (b as { expired_documents?: string[] }).expired_documents ?? [];
                  const total = b.price_total_cents;
                  const paid = b.amount_paid_cents || 0;
                  const balance = Math.max(0, total - paid);
                  const isPaid = balance === 0 && total > 0;
                  const reminderTxt = reminderStatus[b.id];

                  return (
                    <tr
                      key={b.id}
                      className="border-b border-white/5 text-white hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-primary">
                          {new Date(b.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="text-[11px] text-white/40">
                          {new Date(b.starts_at).toLocaleDateString("en-GB", { dateStyle: "short" })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{b.customer_name}</span>
                            {safetyFlag && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-black text-red-400 border border-red-500/20">
                                <AlertCircle className="h-2.5 w-2.5" /> Safety Flag
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-white/50">{b.customer_email}</span>
                          {b.customer_phone && (
                            <span className="text-[11px] text-white/40">{b.customer_phone}</span>
                          )}
                          {expiredDocs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {expiredDocs.map((doc: string) => (
                                <span
                                  key={doc}
                                  className="inline-flex items-center rounded-md bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-300 border border-red-500/20"
                                >
                                  ⚠️ Expired {formatDocType(doc)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-white/80">
                        <p className="font-semibold text-xs">{prod?.name ?? "—"}</p>
                        <span className="text-[10px] font-mono text-white/30">ID: {b.id.slice(0, 8)}</span>
                      </td>

                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-white/90">
                          {ac?.registration ?? "G-EGPG"}
                        </span>
                        <p className="text-[10px] text-white/40">PA-28</p>
                      </td>

                      {/* Financial Balance Breakdown */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <div className="font-bold text-white">
                            Total: £{(total / 100).toFixed(2)}
                          </div>
                          <div className="text-[11px] text-white/60">
                            Paid: £{(paid / 100).toFixed(2)}
                          </div>
                          {balance > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-amber-400">
                                Due: £{(balance / 100).toFixed(2)}
                              </span>
                              <button
                                onClick={() => {
                                  setPaymentBooking(b);
                                  setPayAmountPounds((balance / 100).toFixed(2));
                                  setPayMessage(null);
                                }}
                                className="rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold text-amber-300 px-1.5 py-0.5 border border-amber-500/30"
                              >
                                Collect
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400">
                              ✓ Paid in full
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusPill status={b.status} />
                      </td>

                      {/* Operations Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end flex-wrap gap-1.5">
                          {/* Approve */}
                          {b.status === "pending" && (
                            <button
                              onClick={() => mut.mutate({ data: { id: b.id, status: "confirmed" } })}
                              className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
                            >
                              Approve
                            </button>
                          )}

                          {/* Send Pre-Flight Briefing */}
                          {b.status === "confirmed" && (
                            <button
                              disabled={sendingReminderId === b.id}
                              onClick={() => handleSendReminder(b.id)}
                              className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 flex items-center gap-1"
                              title="Send pre-flight reminder & arrival briefing to student"
                            >
                              {sendingReminderId === b.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3 text-primary" />
                              )}
                              {reminderTxt || "Send Briefing"}
                            </button>
                          )}

                          {/* Record Payment */}
                          <button
                            onClick={() => {
                              setPaymentBooking(b);
                              setPayAmountPounds(balance > 0 ? (balance / 100).toFixed(2) : "0.00");
                              setPayMessage(null);
                            }}
                            className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 flex items-center gap-1"
                            title="Record in-person desk payment"
                          >
                            <CreditCard className="h-3 w-3 text-amber-400" />
                            Record Pay
                          </button>

                          {/* Mark Done */}
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => mut.mutate({ data: { id: b.id, status: "completed" } })}
                              className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/25"
                            >
                              Mark Done
                            </button>
                          )}

                          {/* Log Flight to Logbook */}
                          {b.status === "completed" && (
                            <button
                              onClick={() => openLogModal(b)}
                              className="rounded-lg bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 text-xs font-bold text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                              title="Log flight directly to student CAA logbook"
                            >
                              <BookOpen className="h-3 w-3" />
                              Log Flight
                            </button>
                          )}

                          {/* Cancel */}
                          {(b.status === "pending" || b.status === "confirmed") && (
                            <button
                              onClick={() => {
                                const reason = window.prompt("Cancellation reason?");
                                if (reason === null) return;
                                mut.mutate({
                                  data: {
                                    id: b.id,
                                    status: "cancelled",
                                    cancellation_reason: reason || null,
                                  },
                                });
                              }}
                              className="rounded-lg bg-red-500/15 border border-red-500/20 px-2 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/25"
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
          </div>
        )}
      </div>

      {/* Modal: Record Manual / Desk Payment */}
      {paymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[oklch(0.14_0.04_250)] p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-400" />
                  Record Desk Payment
                </h3>
                <p className="text-xs text-white/50">{paymentBooking.customer_name}</p>
              </div>
              <button
                onClick={() => setPaymentBooking(null)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              {/* Balances Info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Fee:</span>
                  <span className="font-bold text-white">
                    £{(paymentBooking.price_total_cents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Already Paid:</span>
                  <span className="text-emerald-400 font-semibold">
                    £{((paymentBooking.amount_paid_cents || 0) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1.5 font-bold">
                  <span className="text-amber-400">Remaining Balance:</span>
                  <span className="text-amber-400">
                    £{(
                      Math.max(
                        0,
                        paymentBooking.price_total_cents - (paymentBooking.amount_paid_cents || 0),
                      ) / 100
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Amount to Record */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Amount Received (£)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-white/40">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={payAmountPounds}
                    onChange={(e) => setPayAmountPounds(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 pl-8 pr-3 py-2 text-sm font-bold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="card_terminal">Hangar Card Terminal (SumUp / PDQ)</option>
                  <option value="cash">Cash (In-person)</option>
                  <option value="bacs_transfer">BACS Bank Transfer</option>
                  <option value="voucher">Gift Voucher / Flight Credit</option>
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Receipt / Bank Reference (Optional)
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. Card slip #9014, BACS Ref"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {payMessage && (
                <div
                  className={`rounded-lg p-3 text-xs font-semibold ${
                    payMessage.kind === "ok"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {payMessage.text}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentBooking(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {paySubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Lesson Flight to Student Logbook */}
      {logModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[oklch(0.14_0.04_250)] p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Log Flight to UK CAA Logbook
                </h3>
                <p className="text-xs text-white/50">Auto-populates from completed flight booking</p>
              </div>
              <button
                onClick={() => setLogModalBooking(null)}
                className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLogEntry} className="space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Enrolled Student Pilot
                </label>
                <select
                  value={logStudentId}
                  onChange={(e) => setLogStudentId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.display_name || "Pilot"} ({st.license_sought || "PPL"})
                    </option>
                  ))}
                </select>
                {studentsList.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    ⚠️ No students enrolled yet. Enrol the student in CMS &gt; Students first.
                  </p>
                )}
              </div>

              {/* Aircraft & Aerodrome Pre-fill */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="text-white/40 block text-[10px] uppercase font-mono">Aircraft</span>
                  <span className="font-bold text-white text-sm">
                    {logModalBooking.aircraft?.registration || "G-EGPG"}
                  </span>
                  <span className="text-white/50 block text-[10px]">Piper PA-28 Archer III</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                  <span className="text-white/40 block text-[10px] uppercase font-mono">Route</span>
                  <span className="font-bold text-white text-sm">EGPG → EGPG</span>
                  <span className="text-white/50 block text-[10px]">Cumbernauld Local</span>
                </div>
              </div>

              {/* PIC Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Instructor (PIC Name)
                </label>
                <input
                  type="text"
                  value={logPicName}
                  onChange={(e) => setLogPicName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  Lesson Remarks / Syllabus Exercises
                </label>
                <textarea
                  rows={2}
                  value={logRemarks}
                  onChange={(e) => setLogRemarks(e.target.value)}
                  placeholder="e.g. Exercises 6 & 7: Straight & level flight, climbing and descending"
                  className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {logMessage && (
                <div
                  className={`rounded-lg p-3 text-xs font-semibold ${
                    logMessage.kind === "ok"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {logMessage.text}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalBooking(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logSubmitting || studentsList.length === 0}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {logSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit to Logbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; Icon: typeof Clock }> = {
    pending: { cls: "text-amber-400 bg-amber-500/15 border-amber-500/30", Icon: Clock },
    confirmed: { cls: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", Icon: CheckCircle2 },
    cancelled: { cls: "text-red-400 bg-red-500/15 border-red-500/30", Icon: XCircle },
    completed: { cls: "text-blue-400 bg-blue-500/15 border-blue-500/30", Icon: CheckCircle2 },
    no_show: { cls: "text-white/50 bg-white/10 border-white/20", Icon: AlertCircle },
  };
  const { cls, Icon } = map[status] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${cls}`}
    >
      <Icon className="h-3 w-3" /> {status.replace("_", " ")}
    </span>
  );
}
