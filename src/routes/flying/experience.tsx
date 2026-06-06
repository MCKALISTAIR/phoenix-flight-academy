import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Sparkles, Navigation, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/flying/experience")({
  component: ExperiencePage,
  head: () => ({
    meta: [
      { title: "Experience Flight Vouchers & Trial Lessons | Phoenix Flight" },
      { name: "description", content: "Take the controls over Cumbernauld and Scotland. Buy an experience flight voucher or book your trial lesson today." }
    ],
  }),
});

const faqs = [
  {
    q: "What should I wear for my flight?",
    a: "Dress comfortably — no special clothing is required. Flat-soled shoes are recommended for rudder pedal control. Sunglasses can help in bright conditions. We provide headsets."
  },
  {
    q: "Can I bring passengers?",
    a: "Yes! One passenger can sit in the rear of the Cessna 172 at no extra cost. They'll enjoy the same stunning views. Additional passengers may be possible depending on weight limits."
  },
  {
    q: "What happens if the weather is bad?",
    a: "Safety is our priority. If conditions are unsuitable for flying, we'll reschedule your flight at no extra charge. All vouchers include flexible rebooking and are valid for 12 months."
  },
  {
    q: "Do I need any experience or medical?",
    a: "None at all. Experience flights require no pilot license or medical certificate. You just need to be in reasonable health and over 14 years old (under-16s need parental consent)."
  },
  {
    q: "Can this count towards my PPL?",
    a: "Absolutely. Every trial lesson is logged as an official instructional flight. If you decide to pursue your PPL, these hours count towards your total required training time."
  },
];

function ExperiencePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const packages = [
    {
      title: "30-Minute Trial Lesson",
      price: "£125",
      desc: "Perfect introduction to pilot training. Includes pre-flight brief, 30 minutes in the air, and hands-on control time.",
      image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop",
      features: ["Pre-flight cockpit briefing", "Take the controls", "Signed training log entries"]
    },
    {
      title: "60-Minute Scenic Cruiser",
      price: "£215",
      desc: "Spend a full hour flying over Cumbernauld, Glasgow, and the spectacular Scottish Lochs. Plenty of time to build basic handling confidence.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      features: ["Full 60-minute duration", "Scenery photo opportunities", "CofC flight certificate"]
    },
    {
      title: "Land-Away Highland Tour",
      price: "£395",
      desc: "An ultimate flying adventure. Pilot the aircraft from Cumbernauld, land away at a scenic Scottish airfield for lunch, and fly back.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
      features: ["Dual destination flying", "Lunch at local airclub", "Complete navigation log prep"]
    }
  ];

  return (
    <div className="flex flex-col bg-muted/10 pb-20">
      {/* Hero Block */}
      <div className="bg-[oklch(0.12_0.04_250)] py-20 text-white sm:py-28 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop"
            alt="Scenic flight landscape"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_250)] via-[oklch(0.12_0.04_250)]/60 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Gift Vouchers</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Experience Flights
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-white/85 leading-relaxed">
            Take the controls of a light aircraft for the first time. The perfect gift or introduction to the soaring world of flight training.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Intro Grid */}
        <div className="grid gap-12 lg:grid-cols-2 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground">What to Expect</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every experience flight voucher operates as a fully certified initial trial flight lesson. You'll be paired with a professional, friendly instructor who will guide you from the ground up.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Pre-Flight Briefing</h4>
                  <p className="text-sm text-muted-foreground mt-1">Learn how aerodynamic flight surfaces control the plane in three dimensions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">Hands-on Control Time</h4>
                  <p className="text-sm text-muted-foreground mt-1">Once established in straight and level flight, you take the controls to fly yourself.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-border">
            <img
              src="https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=800&auto=format&fit=crop"
              alt="Takeoff over landscape"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold text-slate-100 border border-white/10 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Cumbernauld Departure Skies
            </div>
          </div>
        </div>

        {/* Experience Packages */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Flight Packages</span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">Choose Your Flying Experience</h2>
            <p className="mt-4 text-sm text-muted-foreground">Select a voucher package below. Vouchers are valid for 12 months with flexible booking dates.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 pt-6">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20 ${
                  idx === 1 ? "border-primary/40 ring-2 ring-primary/10" : "border-border"
                }`}
              >
                {/* Most Popular badge */}
                {idx === 1 && (
                  <div className="absolute top-4 left-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                  <img src={pkg.image} alt={pkg.title} className="h-full w-full object-cover" />
                  <div className="absolute top-4 right-4 rounded-full bg-primary px-3.5 py-1.5 text-sm font-black text-primary-foreground shadow-sm">
                    {pkg.price}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{pkg.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{pkg.desc}</p>
                    <hr className="border-border !my-4" />
                    <ul className="space-y-2">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/booking"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
                  >
                    Buy Voucher / Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Common Questions</span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    openFaq === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
