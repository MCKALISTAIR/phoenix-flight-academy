import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Users, CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/cms/")({
  component: CmsDashboard,
});

function CmsDashboard() {
  const sections = [
    {
      label: "Home Page",
      fields: 4,
      lastEdited: "Never",
      status: "default" as const,
    },
    {
      label: "About / School",
      fields: 3,
      lastEdited: "Never",
      status: "default" as const,
    },
    {
      label: "Fleet Specs",
      fields: 12,
      lastEdited: "Never",
      status: "default" as const,
    },
    {
      label: "Pricing",
      fields: 6,
      lastEdited: "Never",
      status: "default" as const,
    },
    {
      label: "Experience Packages",
      fields: 9,
      lastEdited: "Never",
      status: "default" as const,
    },
    {
      label: "Contact Details",
      fields: 3,
      lastEdited: "Never",
      status: "default" as const,
    },
  ];

  const stats = [
    { label: "Editable Sections", value: "6", icon: FileText, color: "text-[oklch(0.70_0.18_270)]" },
    { label: "Instructor Profiles", value: "3", icon: Users, color: "text-[oklch(0.70_0.18_270)]" },
    { label: "Pending Changes", value: "0", icon: Clock, color: "text-yellow-400" },
    { label: "Published", value: "Live", icon: TrendingUp, color: "text-green-400" },
  ];

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">CMS Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage all publicly-visible content across the Phoenix Flight Training website.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`mt-3 text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Content Blocks Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Content Sections</h2>
          <Link
            to="/cms/content"
            className="text-xs font-semibold text-[oklch(0.70_0.18_270)] hover:underline"
          >
            Edit all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[oklch(0.55_0.22_270)]/40 hover:bg-white/8 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-bold text-white">{section.label}</span>
                  <p className="mt-1 text-xs text-white/40">{section.fields} editable fields</p>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white/20" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-white/30">Last edited: {section.lastEdited}</span>
                <Link
                  to="/cms/content"
                  className="rounded-lg border border-[oklch(0.55_0.22_270)]/30 bg-[oklch(0.55_0.22_270)]/10 px-3 py-1 text-xs font-semibold text-[oklch(0.70_0.18_270)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[oklch(0.55_0.22_270)]/20"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-300">Supabase Integration Pending</p>
          <p className="mt-1 text-xs text-yellow-400/70">
            Content changes are currently stored in local component state. Once Supabase is wired in, saving here will write directly to the <code className="font-mono bg-yellow-500/10 px-1 rounded">cms_content</code> table and reflect live on the public site.
          </p>
        </div>
      </div>
    </div>
  );
}
