import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Save, User, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cms/team")({
  component: TeamEditor,
});

type Instructor = {
  id: number;
  name: string;
  role: string;
  hours: string;
  bio: string;
  image_url: string;
};

const INITIAL_TEAM: Instructor[] = [
  {
    id: 1,
    name: "Captain Andrew McKay",
    role: "CFI • Chief Flying Instructor",
    hours: "4,500+ Hours",
    bio: "Ex-commercial pilot with over 15 years teaching at Cumbernauld Airport. Andrew specialises in high-latitude cross-country navigation and advanced pilot training checkout safety.",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Captain Sarah Jenkins",
    role: "Senior Flight Instructor",
    hours: "2,800+ Hours",
    bio: "Sarah is a specialist in solo-flight preparation, PPL ground-school instruction, and confidence-building training blocks. Her deep background is in flight deck meteorology.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Captain David Smith",
    role: "Line Flight Instructor",
    hours: "1,200+ Hours",
    bio: "An expert on Piper low-wing ratings, cockpit avionics mapping, and trial lessons. David brings an enthusiastic, energetic, and checklist-driven approach to every flight hour.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop&crop=face",
  },
];

function InstructorCard({
  instructor,
  onUpdate,
  onDelete,
}: {
  instructor: Instructor;
  onUpdate: (id: number, field: keyof Instructor, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm transition-all hover:border-[oklch(0.55_0.22_270)]/30">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/3 px-6 py-4">
        <div className="flex items-center gap-3">
          {instructor.image_url ? (
            <img
              src={instructor.image_url}
              alt={instructor.name}
              className="h-9 w-9 rounded-full object-cover object-top border border-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.70_0.18_270)]">
              <User className="h-4 w-4" />
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-white">{instructor.name || "New Instructor"}</span>
            <span className="block text-xs text-white/40">{instructor.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-[oklch(0.55_0.22_270)] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[oklch(0.60_0.22_270)]"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
          <button
            onClick={() => onDelete(instructor.id)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editable fields */}
      <div className="p-6 grid grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Full Name</label>
          <input
            type="text"
            value={instructor.name}
            onChange={(e) => onUpdate(instructor.id, "name", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Role / Title</label>
          <input
            type="text"
            value={instructor.role}
            onChange={(e) => onUpdate(instructor.id, "role", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Flight Hours Badge</label>
          <input
            type="text"
            value={instructor.hours}
            onChange={(e) => onUpdate(instructor.id, "hours", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Photo URL</label>
          <input
            type="text"
            value={instructor.image_url}
            onChange={(e) => onUpdate(instructor.id, "image_url", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all font-mono text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Bio</label>
          <textarea
            rows={3}
            value={instructor.bio}
            onChange={(e) => onUpdate(instructor.id, "bio", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function TeamEditor() {
  const [team, setTeam] = useState<Instructor[]>(INITIAL_TEAM);
  const [nextId, setNextId] = useState(4);

  function updateInstructor(id: number, field: keyof Instructor, value: string) {
    setTeam((prev) =>
      prev.map((ins) => (ins.id === id ? { ...ins, [field]: value } : ins))
    );
  }

  function deleteInstructor(id: number) {
    setTeam((prev) => prev.filter((ins) => ins.id !== id));
  }

  function addInstructor() {
    setTeam((prev) => [
      ...prev,
      {
        id: nextId,
        name: "",
        role: "Line Flight Instructor",
        hours: "0 Hours",
        bio: "",
        image_url: "",
      },
    ]);
    setNextId((n) => n + 1);
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Team & Instructors</h2>
          <p className="mt-1 text-xs text-white/40">
            Manage instructor profiles displayed on the About page. Changes here reflect live once Supabase is connected.
          </p>
        </div>
        <button
          onClick={addInstructor}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/20 transition-all hover:scale-[1.02] hover:bg-[oklch(0.60_0.22_270)]"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </button>
      </div>

      {/* Instructor count badge */}
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[oklch(0.55_0.22_270)]/30 bg-[oklch(0.55_0.22_270)]/10 px-3 py-1 text-xs font-bold text-[oklch(0.70_0.18_270)]">
          {team.length} instructor{team.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-white/30">Displayed as profile cards on the About page</span>
      </div>

      {/* Instructor cards */}
      <div className="space-y-6">
        {team.map((instructor) => (
          <InstructorCard
            key={instructor.id}
            instructor={instructor}
            onUpdate={updateInstructor}
            onDelete={deleteInstructor}
          />
        ))}

        {team.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <User className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm font-semibold text-white/40">No instructors yet</p>
            <button
              onClick={addInstructor}
              className="mt-4 text-xs font-semibold text-[oklch(0.70_0.18_270)] hover:underline"
            >
              + Add your first instructor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
