import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon, Plane, User as UserIcon, CreditCard, AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getBookingProductBySlug } from "@/lib/booking-products.functions";
import { getAvailableSlots } from "@/lib/booking-calendar.functions";
import { createBooking } from "@/lib/bookings.functions";
import { getMySelfHireStatus } from "@/lib/self-hire.functions";
import { checkPromoCode } from "@/lib/promotions.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/booking/book/$slug")({
  component: BookingFlow,
  head: ({ params }) => ({
    meta: [{ title: `Book ${params.slug} | Phoenix Flight Training` }],
  }),
});

type Aircraft = { id: string; registration: string; model: string; rate_wet: number | null; status: string };
type Instructor = { id: string; name: string; role: string | null };

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function money(cents: number) {
  return `£${(cents / 100).toFixed(2)}`;
}

function BookingFlow() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProduct = useServerFn(getBookingProductBySlug);
  const fetchSlots = useServerFn(getAvailableSlots);
  const submitBooking = useServerFn(createBooking);
  const fetchSelfHire = useServerFn(getMySelfHireStatus);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["booking-product", slug],
    queryFn: () => fetchProduct({ data: { slug } }),
  });

  // Aircraft + instructors (public reads)
  const { data: aircraft } = useQuery<Aircraft[]>({
    queryKey: ["aircraft", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aircraft")
        .select("id, registration, model, rate_wet, status")
        .eq("published", true)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Aircraft[];
    },
  });

  const { data: instructors } = useQuery<Instructor[]>({
    queryKey: ["instructors", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructors")
        .select("id, name, role")
        .eq("published", true)
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Instructor[];
    },
  });

  const { data: selfHire } = useQuery({
    queryKey: ["self-hire", user?.id],
    queryFn: () => fetchSelfHire(),
    enabled: !!user && product?.kind === "self_hire",
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => fmtDate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [aircraftId, setAircraftId] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promo code state
  const applyPromo = useServerFn(checkPromoCode);
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoDiscount, setPromoDiscount] = useState<{ discountType: "percentage" | "fixed_amount"; discountValue: number } | null>(null);

  // Block Booking state
  const [recurrence, setRecurrence] = useState<"weekly" | "fortnightly" | "none">("none");
  const [occurrences, setOccurrences] = useState<number>(5);

  const projectedSlots = useMemo(() => {
    if (!selectedSlot || recurrence === "none" || occurrences <= 1) return [];
    const dates = [];
    const startsDate = new Date(selectedSlot);
    for (let i = 1; i < occurrences; i++) {
      const offsetDays = i * (recurrence === "weekly" ? 7 : 14);
      const nextDate = new Date(startsDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
      dates.push(nextDate);
    }
    return dates;
  }, [selectedSlot, recurrence, occurrences]);

  // Prefill from auth
  useEffect(() => {
    if (user) {
      setEmail((e) => e || user.email || "");
      setName((n) => n || (user.user_metadata?.display_name as string) || "");
    }
  }, [user]);

  // Auto-pick first serviceable aircraft
  useEffect(() => {
    if (!aircraftId && aircraft && aircraft.length > 0) {
      const ok = aircraft.find((a) => a.status === "serviceable") ?? aircraft[0];
      setAircraftId(ok.id);
    }
  }, [aircraft, aircraftId]);

  // Auto-pick first instructor for lesson/experience
  useEffect(() => {
    if (!instructorId && instructors && instructors.length > 0 && product && product.kind !== "self_hire") {
      setInstructorId(instructors[0].id);
    }
  }, [instructors, instructorId, product]);

  // Build 14-day window for available slots
  const dateRange = useMemo(() => {
    const today = new Date();
    const from = fmtDate(today);
    const to = fmtDate(new Date(today.getTime() + 60 * 86400_000));
    return { from, to };
  }, []);

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", slug, aircraftId, instructorId, dateRange.from, dateRange.to],
    queryFn: () =>
      fetchSlots({
        data: {
          productSlug: slug,
          aircraftId: aircraftId ?? undefined,
          instructorId: product?.kind !== "self_hire" ? instructorId ?? undefined : undefined,
          from: dateRange.from,
          to: dateRange.to,
        },
      }),
    enabled: !!product && !!aircraftId,
  });

  const slotsByDate = useMemo(() => {
    const m: Record<string, typeof slots> = {};
    (slots ?? []).forEach((s) => {
      const d = s.start.slice(0, 10);
      if (!m[d]) m[d] = [];
      m[d]!.push(s);
    });
    return m;
  }, [slots]);

  const daysWithAvailability = useMemo(
    () =>
      Object.entries(slotsByDate)
        .filter(([, list]) => (list ?? []).some((s) => s.available))
        .map(([d]) => d),
    [slotsByDate],
  );

  const dayList = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push(fmtDate(d));
    }
    return out;
  }, []);

  const dayDisplay = (d: string) => {
    const dt = new Date(`${d}T12:00:00Z`);
    return {
      weekday: dt.toLocaleDateString("en-GB", { weekday: "short" }),
      day: dt.getDate(),
      month: dt.toLocaleDateString("en-GB", { month: "short" }),
    };
  };

  const selectedAircraft = aircraft?.find((a) => a.id === aircraftId) ?? null;

  // Price preview (display only — server recomputes)
  const pricePreview = useMemo(() => {
    if (!product) return null;
    const hours = product.duration_minutes / 60;
    const wet = selectedAircraft?.rate_wet ? Number(selectedAircraft.rate_wet) * 100 : 0;
    let base = 0;
    if (product.kind === "experience") base = product.package_price_cents ?? 0;
    else if (product.kind === "lesson") base = wet * hours + (product.instructor_fee_per_hour_cents ?? 0) * hours;
    else base = wet * hours;
    base = Math.round(base);

    let discountCents = 0;
    if (promoDiscount) {
      if (promoDiscount.discountType === "percentage") {
        discountCents = Math.round((base * promoDiscount.discountValue) / 100);
      } else {
        discountCents = Math.min(promoDiscount.discountValue, base);
      }
    }
    const total = Math.max(0, base - discountCents);
    const deposit =
      product.payment_mode === "deposit"
        ? Math.round((total * product.deposit_pct) / 100)
        : product.payment_mode === "full"
        ? total
        : 0;
    return { base, total, deposit, discountCents };
  }, [product, selectedAircraft, promoDiscount]);

  if (productLoading) {
    return <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white/60">Loading…</div>;
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-[oklch(0.13_0.03_270)] p-8 text-white">
        <p>Product not found.</p>
        <Link to="/booking" className="text-[oklch(0.75_0.18_270)] underline">Back to booking</Link>
      </div>
    );
  }

  // Access gates
  const needsLogin =
    (product.kind === "lesson" || product.kind === "self_hire") && !user;
  const needsSelfHireApproval =
    product.kind === "self_hire" && user && selfHire && !selfHire.approved;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedSlot) {
      setError("Please pick a date and time slot.");
      return;
    }
    if (!aircraftId) {
      setError("Please pick an aircraft.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitBooking({
        data: {
          productSlug: slug,
          aircraftId,
          instructorId: product!.kind === "self_hire" ? null : instructorId,
          startsAt: selectedSlot,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || null,
          notes: notes || null,
          promoCode: promoStatus === "valid" ? promoInput.toUpperCase() : null,
          recurrence,
          occurrences,
        },
      });
      if (res.paymentMode !== "invoice") {
        navigate({ to: "/booking/checkout/$id", params: { id: res.id } });
      } else {
        navigate({ to: "/booking/confirm/$id", params: { id: res.id } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.13_0.03_270)] text-white">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/booking" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to all products
        </Link>

        <div className="mb-8">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/60">
            {product.kind === "self_hire" ? "Self-Hire" : product.kind}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold">{product.name}</h1>
          {product.tagline && <p className="mt-1 text-white/60">{product.tagline}</p>}
        </div>

        {needsLogin && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">Sign-in required</p>
              <p className="mt-1 text-amber-200/80">
                {product.kind === "lesson" ? "Lessons are for enrolled students." : "Self-hire requires an approved pilot account."}{" "}
                <Link to="/login" search={{ redirect: `/booking/book/${slug}` }} className="underline">
                  Sign in to continue
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {needsSelfHireApproval && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">Self-hire approval required</p>
              <p className="mt-1 text-amber-200/80">
                Contact the school to be approved for self-hire. Once approved you'll be able to book aircraft here.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Left column: pickers */}
          <div className="space-y-6 lg:col-span-2">
            {/* Aircraft */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                <Plane className="h-4 w-4" /> Aircraft
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(aircraft ?? []).map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => setAircraftId(a.id)}
                    disabled={a.status !== "serviceable"}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      aircraftId === a.id
                        ? "border-[oklch(0.55_0.22_270)] bg-[oklch(0.55_0.22_270)]/15"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    } ${a.status !== "serviceable" ? "opacity-40" : ""}`}
                  >
                    <p className="font-bold">{a.registration}</p>
                    <p className="text-xs text-white/50">{a.model}</p>
                    {a.rate_wet && <p className="mt-1 text-xs text-white/70">£{Number(a.rate_wet).toFixed(2)}/hr wet</p>}
                    {a.status !== "serviceable" && <p className="mt-1 text-xs text-red-400 capitalize">{a.status}</p>}
                  </button>
                ))}
              </div>
            </section>

            {/* Instructor (not for self-hire) */}
            {product.kind !== "self_hire" && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                  <UserIcon className="h-4 w-4" /> Instructor
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(instructors ?? []).map((i) => (
                    <button
                      type="button"
                      key={i.id}
                      onClick={() => setInstructorId(i.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        instructorId === i.id
                          ? "border-[oklch(0.55_0.22_270)] bg-[oklch(0.55_0.22_270)]/15"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <p className="font-bold">{i.name}</p>
                      {i.role && <p className="text-xs text-white/50">{i.role}</p>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Date + slot */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                <CalendarIcon className="h-4 w-4" /> Date & time
              </h2>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {dayList.map((d) => {
                  const info = dayDisplay(d);
                  const has = daysWithAvailability.includes(d);
                  const active = selectedDate === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedSlot(null);
                      }}
                      className={`flex min-w-[68px] flex-col items-center rounded-xl border px-3 py-2 transition-all ${
                        active
                          ? "border-[oklch(0.55_0.22_270)] bg-[oklch(0.55_0.22_270)]/15"
                          : has
                          ? "border-white/10 bg-white/5 hover:border-white/20"
                          : "border-white/5 bg-white/0 text-white/30"
                      }`}
                    >
                      <span className="text-[10px] uppercase">{info.weekday}</span>
                      <span className="text-lg font-bold">{info.day}</span>
                      <span className="text-[10px]">{info.month}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                {slotsLoading ? (
                  <p className="text-sm text-white/40">Loading times…</p>
                ) : (
                  <div data-testid="slot-grid" className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {(slotsByDate[selectedDate] ?? []).map((s) => (
                      <button
                        type="button"
                        key={s.start}
                        disabled={!s.available}
                        onClick={() => setSelectedSlot(s.start)}
                        title={s.reason}
                        className={`rounded-lg border px-2 py-2 text-sm font-medium transition-all ${
                          selectedSlot === s.start
                            ? "border-[oklch(0.55_0.22_270)] bg-[oklch(0.55_0.22_270)]/20"
                            : s.available
                            ? "border-white/10 bg-white/5 hover:border-white/20"
                            : "border-white/5 bg-white/0 text-white/20 line-through"
                        }`}
                      >
                        {fmtTime(s.start)}
                      </button>
                    ))}
                    {(slotsByDate[selectedDate] ?? []).length === 0 && (
                      <p className="col-span-full text-sm text-white/40">No slots on this day.</p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Recurring block bookings section */}
            {product.kind === "lesson" && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                  <CalendarIcon className="h-4 w-4" /> Block Booking
                </h2>
                <div className="space-y-3">
                  <p className="text-xs text-white/50 leading-relaxed">
                    Reserve your preferred instructor and aircraft slot in advance for future lessons. 
                    You pay only for the first lesson now; future slots will be billed individually.
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">Schedule Pattern</label>
                      <select
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as any)}
                        className="w-full rounded-lg border border-white/10 bg-[oklch(0.13_0.03_270)] px-3 py-2 text-sm text-white"
                      >
                        <option value="none">One-off booking</option>
                        <option value="weekly">Repeat weekly</option>
                        <option value="fortnightly">Repeat bi-weekly</option>
                      </select>
                    </div>

                    {recurrence !== "none" && (
                      <div>
                        <label className="mb-1 block text-xs text-white/50">Number of Lessons</label>
                        <select
                          value={occurrences}
                          onChange={(e) => setOccurrences(Number(e.target.value))}
                          className="w-full rounded-lg border border-white/10 bg-[oklch(0.13_0.03_270)] px-3 py-2 text-sm text-white"
                        >
                          {[2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                            <option key={num} value={num}>
                              {num} Lessons total
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {recurrence !== "none" && projectedSlots.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-white/2 p-4 space-y-2">
                      <p className="text-xs font-bold text-white/70">Projected Future Lesson Slots:</p>
                      <div className="divide-y divide-white/5 text-xs text-white/50 max-h-48 overflow-y-auto pr-1">
                        <div className="py-1.5 flex justify-between">
                          <span>Lesson 1 (Secure & pay now)</span>
                          <span className="font-semibold text-white/80">
                            {selectedSlot ? new Date(selectedSlot).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                        </div>
                        {projectedSlots.map((date, idx) => (
                          <div key={idx} className="py-1.5 flex justify-between">
                            <span>Lesson {idx + 2} (Slot reserved)</span>
                            <span className="font-semibold text-white/80">
                              {date.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Customer details */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                <UserIcon className="h-4 w-4" /> Your details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-white/50">Full name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Phone (optional)</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-white/50">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right column: summary */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/60">
                <CreditCard className="h-4 w-4" /> Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/50">Product</dt>
                  <dd className="font-medium">{product.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">Duration</dt>
                  <dd className="font-medium">{product.duration_minutes} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">Aircraft</dt>
                  <dd className="font-medium">{selectedAircraft?.registration ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">When</dt>
                  <dd className="font-medium">{selectedSlot ? new Date(selectedSlot).toLocaleString("en-GB") : "—"}</dd>
                </div>
                <div className="my-3 border-t border-white/10" />
                {pricePreview && (
                  <>
                    {pricePreview.discountCents > 0 && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-white/50">Subtotal</dt>
                          <dd className="font-medium">{money(pricePreview.base)}</dd>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <dt className="flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {promoInput.toUpperCase()}
                          </dt>
                          <dd className="font-semibold">−{money(pricePreview.discountCents)}</dd>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-white/50">Total</dt>
                      <dd className="font-bold">{money(pricePreview.total)}</dd>
                    </div>
                    {product.payment_mode === "deposit" && (
                      <div className="flex justify-between text-[oklch(0.75_0.18_270)]">
                        <dt>Deposit due</dt>
                        <dd className="font-bold">{money(pricePreview.deposit)}</dd>
                      </div>
                    )}
                    {product.payment_mode === "invoice" && (
                      <p className="text-xs text-white/40">Invoice — no card required at booking.</p>
                    )}
                  </>
                )}
              </dl>

              {/* Promo code */}
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle"); setPromoDiscount(null); }}
                    placeholder="ENTER CODE"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white placeholder-white/20 focus:border-[oklch(0.65_0.22_270)] outline-none"
                  />
                  <button
                    type="button"
                    disabled={promoStatus === "checking" || !promoInput}
                    onClick={async () => {
                      if (!promoInput || !product) return;
                      setPromoStatus("checking");
                      try {
                        const res = await applyPromo({ data: { code: promoInput, productKind: product.kind } });
                        if (res.valid) {
                          setPromoStatus("valid");
                          setPromoMessage(res.discountType === "percentage" ? `${res.discountValue}% off applied!` : `£${(res.discountValue / 100).toFixed(2)} off applied!`);
                          setPromoDiscount({ discountType: res.discountType, discountValue: res.discountValue });
                        } else {
                          setPromoStatus("invalid");
                          setPromoMessage(res.reason ?? "Invalid code.");
                          setPromoDiscount(null);
                        }
                      } catch {
                        setPromoStatus("invalid");
                        setPromoMessage("Could not validate code.");
                        setPromoDiscount(null);
                      }
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-40 transition-all"
                  >
                    {promoStatus === "checking" ? "…" : "Apply"}
                  </button>
                </div>
                {promoStatus === "valid" && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {promoMessage}
                  </p>
                )}
                {promoStatus === "invalid" && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> {promoMessage}
                  </p>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || needsLogin || !!needsSelfHireApproval || !selectedSlot}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] py-3 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/20 transition-all hover:bg-[oklch(0.60_0.22_270)] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {product.payment_mode === "invoice" ? "Request booking" : "Continue"}
              </button>
              <p className="mt-3 text-xs text-white/40">
                {product.requires_approval
                  ? "This booking will be reviewed by staff before it's confirmed."
                  : "You'll receive an email confirmation."}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}