import { createFileRoute, Link, redirect, isRedirect } from "@tanstack/react-router";
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ShieldAlert,
  Plane,
  Wrench,
  Activity,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
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
    { label: "Editable Sections", value: "6", icon: FileText, color: "text-primary" },
    { label: "Instructor Profiles", value: "3", icon: Users, color: "text-primary" },
    { label: "Registered Fleet", value: "3", icon: Plane, color: "text-primary" },
    { label: "Active Portal Users", value: "6", icon: UserPlus, color: "text-primary" },
  ];

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">CMS Overview</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage all publicly-visible content, control user access roles, and monitor flight school
          aircraft status.
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
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {stat.label}
                </span>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className={`mt-3 text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Access Control Quick Card & Content Blocks Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2/3 for content sections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Content Sections</h2>
            <Link to="/cms/content" className="text-xs font-semibold text-primary hover:underline">
              Edit all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-primary/40 hover:bg-white/8 backdrop-blur-sm"
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
                    className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/20"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1/3 for quick user access & fleet tools */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">System Controls</h2>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 space-y-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">User Access & Roles</h3>
                <p className="mt-1 text-xs text-white/40 leading-relaxed">
                  Configure access control for flight school staff, senior instructors, students,
                  and self-hire pilots. Issue invitation keys to new team members.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Link
                  to="/cms/users"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:scale-[1.02] hover:bg-primary"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Manage User Access
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 space-y-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Fleet & Maintenance</h3>
                <p className="mt-1 text-xs text-white/40 leading-relaxed">
                  Track Hobbs/Tacho hours, toggle flight serviceability, ground aircraft (AOG) due
                  to inspection thresholds, and adjust solo wet hire hourly rates.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Link
                  to="/cms/fleet"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10"
                >
                  <Wrench className="h-3.5 w-3.5 text-white/40" />
                  Open Hangar Logs
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 space-y-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <Activity className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">System Health & Traffic</h3>
                <p className="mt-1 text-xs text-white/40 leading-relaxed">
                  Monitor live active pageviews, route conversion percentages, and real-time backend
                  PostgreSQL or client API bundle load exceptions.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Link
                  to="/cms/analytics"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-white transition-all hover:bg-white/10"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-white/40" />
                  View Live Health Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-yellow-300">Supabase Integration Pending</p>
          <p className="mt-1 text-xs text-yellow-400/70">
            Content changes, role configurations, and aircraft status adjustments are currently
            stored in local component state. Once Supabase is wired in, saving here will write
            directly to the{" "}
            <code className="font-mono bg-yellow-500/10 px-1 rounded">cms_content</code> and
            user/aircraft schemas.
          </p>
        </div>
      </div>
    </div>
  );
}
