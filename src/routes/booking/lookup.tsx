import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search,
  Calendar,
  Clock,
  Plane,
  MapPin,
  AlertCircle,
  Phone,
  Mail,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Compass,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { lookupBookingForGuest } from "@/lib/bookings.functions";

export const Route = createFileRoute("/booking/lookup")({
  component: BookingLookupPage,
  head: () => ({
    meta: [
      { title: "Manage Booking & Voucher Lookup | Phoenix Flight Training" },
      {
        name: "description",
        content:
          "Look up your trial flying lesson, flight training session, or gift voucher booking at Cumbernauld Airport.",
      },
    ],
  }),
});

function BookingLookupPage() {
  const lookupFn = useServerFn(lookupBookingForGuest);

  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setBooking(null);

    const cleanRef = bookingRef.trim();
    const cleanEmail = email.trim();

    if (!cleanRef || !cleanEmail) {
      setErrorMsg("Please enter both your Booking Reference and email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await lookupFn({
        data: {
          bookingId: cleanRef,
          email: cleanEmail,
        },
      });
      setBooking(res);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to find a booking with those details. Please check your reference ID.",
      );
    } finally {
      setLoading(false);
    }
  }

  const product = booking?.booking_products;
  const aircraft = booking?.aircraft;
  const instructor = booking?.instructors;
  const total = booking?.price_total_cents ?? 0;
  const paid = booking?.amount_paid_cents ?? 0;
  const balance = Math.max(0, total - paid);

  return (
    <div className="min-h-screen flex flex-col bg-muted/10 pb-20">
      {/* Header Banner */}
      <div className="bg-[oklch(0.12_0.04_250)] py-16 text-white sm:py-24 border-b border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Self-Service Flight Desk • EGPG
          </span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
            Manage Your Flight Booking
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Look up your trial flight or training lesson details, arrival directions for Cumbernauld Airport, and pre-flight briefing.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 max-w-4xl">
        {/* Lookup Search Box */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Booking Reference ID
                </label>
                <input
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. 8a7c2b... (from your receipt email)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.co.uk"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Locating Flight Record...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Look Up Booking
                </>
              )}
            </button>
          </form>
        </div>

        {/* Booking Details Card */}
        {booking && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  Confirmed Flight Record
                </span>
                <h2 className="text-2xl font-black text-foreground mt-1">
                  {product?.name || "Flight Training Session"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Booked for: <strong className="text-foreground">{booking.customer_name}</strong> • Ref:{" "}
                  <span className="font-mono text-xs">{booking.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    booking.status === "confirmed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : booking.status === "completed"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Flight Timetable & Aircraft */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-mono">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Scheduled Time</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {new Date(booking.starts_at).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs font-mono font-semibold text-primary">
                  {new Date(booking.starts_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  BST (Off-Blocks)
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-mono">
                  <Plane className="h-4 w-4 text-primary" />
                  <span>Dedicated Aircraft</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {aircraft?.registration || "G-EGPG"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Piper PA-28 Archer III (Dual Controls)
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-mono">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Payment Status</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  £{(paid / 100).toFixed(2)} Paid
                </p>
                {balance > 0 ? (
                  <p className="text-xs font-semibold text-amber-500">
                    Remaining £{(balance / 100).toFixed(2)} due at desk
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-emerald-500">✓ Fully paid online</p>
                )}
              </div>
            </div>

            {/* Aerodrome & Pre-Flight Arrival Instructions */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Clock className="h-5 w-5" />
                Pre-Flight Arrival: Arrive 30 Minutes Before Off-Blocks
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please ensure you arrive at the <strong>Cumbernauld Airport Terminal Building</strong> at least 30 minutes prior to your flight time. This allows for security check-in, aerodrome passenger logging, and your pre-flight safety &amp; route briefing with your instructor.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <strong className="text-foreground block">What to bring:</strong>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>Government-issued photo ID (Passport / Driving Licence)</li>
                    <li>Sunglasses (essential for cockpit vision)</li>
                    <li>Comfortable flat, thin-soled shoes</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <strong className="text-foreground block">Aerodrome Location:</strong>
                  <p className="text-muted-foreground">
                    Phoenix Flight Training<br />
                    Main Terminal, Cumbernauld Airport<br />
                    G68 0PR (Free Parking Outside)
                  </p>
                </div>
              </div>
            </div>

            {/* Weather & Change Policy */}
            <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground block">Weather &amp; Reschedule Policy:</strong>
                Flights are weather-dependent. If cloud base or winds are outside safety limits, flights are rescheduled at zero cost. Cancellations require 48 hours notice.
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="tel:07769690041"
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent flex items-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Call Flight Ops
                </a>
                <a
                  href="mailto:info@phoenixflighttraining.co.uk"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 flex items-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email Operations
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
