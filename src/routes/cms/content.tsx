import { createFileRoute } from "@tanstack/react-router";
import { Save, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/cms/content")({
  component: ContentEditor,
});

type SectionKey = "home" | "about" | "fleet_c172" | "fleet_pa28" | "pricing" | "experience" | "contact";

const INITIAL_CONTENT = {
  home: {
    hero_headline: "Learn to fly at\nCumbernauld Airport",
    hero_subtext: "Start your aviation journey with friendly instructors and unforgettable experiences. Explore the breathtaking skies of Scotland from your local flying school.",
    cta_primary: "Access Flight Portal",
    cta_secondary: "Discover Syllabus",
  },
  about: {
    school_description: "Professional general aviation mentorship based at Cumbernauld Airport, committed to forging confident, skilled, and safe pilots.",
    value_1_title: "Safety First",
    value_1_desc: "Our primary, non-negotiable metric. We train pilots to be risk-aware, checklist-focused, and operationally rigorous.",
    value_2_title: "Patience & Empathy",
    value_2_desc: "Flight training is highly demanding. We believe that learning flows from supportive, constructive flight deck instruction.",
    value_3_title: "Cumbernauld Focus",
    value_3_desc: "Based at Cumbernauld, we leverage local Scottish terrain, coastal winds, and uncontrolled airspace to build resilient airmen.",
  },
  fleet_c172: {
    registration: "G-PHNX",
    tagline: "The World's Most Trusted Flight Trainer",
    description: "The Cessna 172 is the gold standard of flight education. Incredibly stable, forgiving, and predictable.",
    engine: "Lycoming O-320 (160 HP)",
    cruise_speed: "105 kts (120 mph)",
    fuel_burn: "Approx. 30L / hour",
    image_url: "https://images.unsplash.com/photo-1555513220-410a69a03bc7?q=80&w=900&auto=format&fit=crop",
  },
  fleet_pa28: {
    registration: "G-BCDF",
    tagline: "High-Performance Low-Wing Cruiser",
    description: "A low-wing alternative providing fantastic cruising visibility and responsive handling.",
    engine: "Lycoming O-360 (180 HP)",
    cruise_speed: "115 kts (132 mph)",
    fuel_burn: "Approx. 34L / hour",
    image_url: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=900&auto=format&fit=crop",
  },
  pricing: {
    c172_dual: "£210",
    pa28_dual: "£210",
    c172_solo: "£175",
    pa28_solo: "£175",
    ground_exam: "£45",
    membership: "£120",
    checkout_flight: "£60",
    budget_range: "£9,450 – £11,200",
  },
  experience: {
    pkg1_title: "30-Minute Trial Lesson",
    pkg1_price: "£125",
    pkg1_desc: "Perfect introduction to pilot training. Includes pre-flight brief, 30 minutes in the air, and hands-on control time.",
    pkg2_title: "60-Minute Scenic Cruiser",
    pkg2_price: "£215",
    pkg2_desc: "Spend a full hour flying over Cumbernauld, Glasgow, and the spectacular Scottish Lochs.",
    pkg3_title: "Land-Away Highland Tour",
    pkg3_price: "£395",
    pkg3_desc: "An ultimate flying adventure. Pilot the aircraft from Cumbernauld, land away at a scenic Scottish airfield for lunch, and fly back.",
  },
  contact: {
    phone: "07769 690041",
    email: "info@phoenixflighttraining.co.uk",
    address: "Phoenix Flight Training, Main Runway Terminal Building, Cumbernauld Airport, G68 0PR",
  },
};

const SECTION_LABELS: Record<SectionKey, string> = {
  home: "Home Page",
  about: "About / School Values",
  fleet_c172: "Fleet — Cessna 172",
  fleet_pa28: "Fleet — Piper PA28",
  pricing: "Pricing & Rates",
  experience: "Experience Packages",
  contact: "Contact Details",
};

function FieldRow({
  label,
  value,
  onChange,
  multiline = false,
  isUrl = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  isUrl?: boolean;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 py-4 border-b border-white/5 last:border-0">
      <div className="pt-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
          />
        )}
        {isUrl && value && (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
            <img src={value} alt="Preview" className="h-16 w-24 rounded-lg object-cover shrink-0 border border-white/10" />
            <span className="text-xs text-white/30 break-all font-mono">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentEditor() {
  const [activeSection, setActiveSection] = useState<SectionKey>("home");
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [savedSections, setSavedSections] = useState<SectionKey[]>([]);
  const [dirtySections, setDirtySections] = useState<SectionKey[]>([]);
  const [saveToast, setSaveToast] = useState(false);

  const updateField = useCallback(
    (section: SectionKey, field: string, value: string) => {
      setContent((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
      setDirtySections((prev) => [...new Set([...prev, section])]);
      setSavedSections((prev) => prev.filter((s) => s !== section));
    },
    []
  );

  function handleSave() {
    setSavedSections((prev) => [...new Set([...prev, activeSection])]);
    setDirtySections((prev) => prev.filter((s) => s !== activeSection));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  function handleReset() {
    setContent((prev) => ({ ...prev, [activeSection]: INITIAL_CONTENT[activeSection] }));
    setDirtySections((prev) => prev.filter((s) => s !== activeSection));
    setSavedSections((prev) => prev.filter((s) => s !== activeSection));
  }

  const currentFields = content[activeSection];
  const isDirty = dirtySections.includes(activeSection);
  const isSaved = savedSections.includes(activeSection);

  return (
    <div className="flex h-full min-h-screen">
      {/* Section sidebar */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-black/20 p-4 space-y-1">
        <p className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-white/30">Sections</p>
        {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => {
          const dirty = dirtySections.includes(key);
          const saved = savedSections.includes(key);
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                activeSection === key
                  ? "bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.75_0.18_270)] border border-[oklch(0.55_0.22_270)]/30"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <span>{SECTION_LABELS[key]}</span>
              {dirty && <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />}
              {saved && !dirty && <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />}
            </button>
          );
        })}
      </aside>

      {/* Editor panel */}
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* Panel header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">{SECTION_LABELS[activeSection]}</h2>
            <p className="mt-0.5 text-xs text-white/40">
              {Object.keys(currentFields).length} fields in this section
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Unsaved changes
              </div>
            )}
            {isSaved && !isDirty && (
              <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/50 transition-all hover:bg-white/10 hover:text-white/80"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/20 transition-all hover:scale-[1.02] hover:bg-[oklch(0.60_0.22_270)]"
            >
              <Save className="h-4 w-4" />
              Save Section
            </button>
          </div>
        </div>

        {/* Field editor */}
        <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 backdrop-blur-sm overflow-hidden">
          {Object.entries(currentFields).map(([field, value]) => {
            const label = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const isUrl = field.includes("url") || field.includes("image");
            const isMultiline =
              field.includes("desc") ||
              field.includes("text") ||
              field.includes("headline") ||
              field.includes("address") ||
              field.includes("bio");

            return (
              <div key={field} className="px-6">
                <FieldRow
                  label={label}
                  value={value as string}
                  onChange={(v) => updateField(activeSection, field, v)}
                  multiline={isMultiline}
                  isUrl={isUrl}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save toast */}
      {saveToast && (
        <div className="fixed bottom-8 right-8 flex items-center gap-2 rounded-2xl border border-green-500/20 bg-[oklch(0.12_0.04_270)] px-5 py-3.5 shadow-xl backdrop-blur-xl text-sm font-semibold text-green-300 z-50">
          <CheckCircle2 className="h-5 w-5" />
          Section saved successfully
        </div>
      )}
    </div>
  );
}
