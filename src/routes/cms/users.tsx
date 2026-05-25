import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import {
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminRequests, reviewAdminRequest } from "@/lib/admin-requests.functions";

export const Route = createFileRoute("/cms/users")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: UserManager,
});

type Role = "super_admin" | "admin" | "instructor" | "student" | "pilot";
type Status = "active" | "pending" | "suspended";

type AppUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string;
  avatar?: string;
};

const ROLES: { value: Role; label: string; desc: string; color: string }[] = [
  {
    value: "super_admin",
    label: "Super Admin",
    desc: "Full CMS + Ops access",
    color: "text-[oklch(0.70_0.18_270)] bg-[oklch(0.55_0.22_270)]/15 border-[oklch(0.55_0.22_270)]/30",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Ops dashboard — bookings & fleet",
    color: "text-primary bg-primary/10 border-primary/20",
  },
  {
    value: "instructor",
    label: "Instructor",
    desc: "View own schedule & student logs",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
  {
    value: "student",
    label: "Student Pilot",
    desc: "Training progress & bookings",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: "pilot",
    label: "Qualified Pilot",
    desc: "Self-hire booking access",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

const INITIAL_USERS: AppUser[] = [
  {
    id: 1,
    name: "Alistair McKay",
    email: "cms@phoenixflight.co.uk",
    role: "super_admin",
    status: "active",
    lastActive: "Just now",
    avatar: "AM",
  },
  {
    id: 2,
    name: "Captain Andrew McKay",
    email: "andrew@phoenixflight.co.uk",
    role: "instructor",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "AMK",
  },
  {
    id: 3,
    name: "Captain Sarah Jenkins",
    email: "sarah@phoenixflight.co.uk",
    role: "instructor",
    status: "active",
    lastActive: "Yesterday",
    avatar: "SJ",
  },
  {
    id: 4,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "student",
    status: "active",
    lastActive: "3 days ago",
    avatar: "JD",
  },
  {
    id: 5,
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "pilot",
    status: "active",
    lastActive: "1 week ago",
    avatar: "SW",
  },
  {
    id: 6,
    name: "Invited User",
    email: "pending.invite@example.com",
    role: "student",
    status: "pending",
    lastActive: "Never",
    avatar: "?",
  },
];

function RoleBadge({ role }: { role: Role }) {
  const def = ROLES.find((r) => r.value === role)!;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${def.color}`}
    >
      {role === "super_admin" && <ShieldCheck className="h-3 w-3" />}
      {role === "admin" && <Shield className="h-3 w-3" />}
      {role === "instructor" && <ShieldAlert className="h-3 w-3" />}
      {(role === "student" || role === "pilot") && <User className="h-3 w-3" />}
      {def.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "active")
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Active
      </span>
    );
  if (status === "pending")
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
        <Clock className="h-3 w-3" />
        Invite Pending
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
      <XCircle className="h-3 w-3" />
      Suspended
    </span>
  );
}

function UserManager() {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("student");
  const [inviteLink, setInviteLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [openRoleMenu, setOpenRoleMenu] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [nextId, setNextId] = useState(7);

  function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    // Mock invite link — will be Supabase inviteUserByEmail() later
    const token = Math.random().toString(36).substring(2, 14);
    const link = `https://phoenixflighttraining.co.uk/join?token=${token}`;
    setInviteLink(link);

    const nameParts = inviteEmail.split("@")[0].split(".");
    const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    setUsers((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        email: inviteEmail,
        role: inviteRole,
        status: "pending",
        lastActive: "Never",
        avatar: name.split(" ").map((n) => n[0]).join("").slice(0, 2),
      },
    ]);
    setNextId((n) => n + 1);
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function changeRole(id: number, role: Role) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    setOpenRoleMenu(null);
  }

  function toggleSuspend(id: number) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
          : u
      )
    );
  }

  function removeUser(id: number) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  const filtered =
    filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">User Management</h2>
          <p className="mt-1 text-xs text-white/40">
            Invite users, assign roles, and manage portal access. Changes will sync with Supabase Auth when connected.
          </p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteLink(""); setInviteEmail(""); }}
          className="flex items-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/20 transition-all hover:scale-[1.02] hover:bg-[oklch(0.60_0.22_270)]"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <AdminRequestsPanel />

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {ROLES.map((r) => {
          const count = users.filter((u) => u.role === r.value).length;
          return (
            <button
              key={r.value}
              onClick={() => setFilterRole(filterRole === r.value ? "all" : r.value)}
              className={`rounded-2xl border p-4 text-left transition-all hover:scale-[1.01] ${
                filterRole === r.value
                  ? r.color + " opacity-100"
                  : "border-white/10 bg-white/5 text-white/50 hover:bg-white/8"
              }`}
            >
              <span className="text-2xl font-black">{count}</span>
              <span className="mt-1 block text-xs font-semibold">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {filterRole !== "all" && (
          <button
            onClick={() => setFilterRole("all")}
            className="text-xs font-semibold text-white/40 hover:text-white/70 underline underline-offset-2"
          >
            ← Show all
          </button>
        )}
      </div>

      {/* User table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold text-white">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
            {filterRole !== "all" && (
              <span className="ml-2 text-white/40 font-normal">
                filtered by {ROLES.find((r) => r.value === filterRole)?.label}
              </span>
            )}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-5 px-6 py-4 transition-colors hover:bg-white/3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.22_270)]/20 text-xs font-bold text-[oklch(0.70_0.18_270)] border border-[oklch(0.55_0.22_270)]/20">
                {user.avatar}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white truncate">{user.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
              </div>

              {/* Role selector */}
              <div className="relative">
                <button
                  onClick={() => setOpenRoleMenu(openRoleMenu === user.id ? null : user.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs transition-all hover:bg-white/10"
                >
                  <RoleBadge role={user.role} />
                  <ChevronDown className="h-3 w-3 text-white/30" />
                </button>
                {openRoleMenu === user.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-white/10 bg-[oklch(0.12_0.04_270)] shadow-2xl overflow-hidden">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => changeRole(user.id, r.value)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left text-xs transition-colors hover:bg-white/5 ${
                          user.role === r.value ? "bg-white/5" : ""
                        }`}
                      >
                        <div className="pt-0.5">
                          {user.role === r.value ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.70_0.18_270)]" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-white/20" />
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-white">{r.label}</span>
                          <span className="text-white/40">{r.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="w-28 shrink-0">
                <StatusBadge status={user.status} />
                <span className="mt-0.5 block text-xs text-white/25">{user.lastActive}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSuspend(user.id)}
                  title={user.status === "suspended" ? "Reinstate access" : "Suspend access"}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    user.status === "suspended"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border-white/10 bg-white/5 text-white/40 hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400"
                  }`}
                >
                  {user.status === "suspended" ? "Reinstate" : "Suspend"}
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  title="Remove user"
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/30 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[oklch(0.10_0.04_270)] shadow-2xl overflow-hidden">
            <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Invite a User</h3>
                <p className="mt-0.5 text-xs text-white/40">An invite link will be generated for their email address.</p>
              </div>
              <button
                onClick={() => { setShowInvite(false); setInviteLink(""); }}
                className="text-white/30 hover:text-white/60 text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {!inviteLink ? (
              <form onSubmit={sendInvite} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="pilot@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                    Assign Role
                  </label>
                  <div className="space-y-2">
                    {ROLES.map((r) => (
                      <label
                        key={r.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                          inviteRole === r.value
                            ? "border-[oklch(0.55_0.22_270)]/40 bg-[oklch(0.55_0.22_270)]/10"
                            : "border-white/5 bg-white/3 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={inviteRole === r.value}
                          onChange={() => setInviteRole(r.value)}
                          className="accent-[oklch(0.55_0.22_270)]"
                        />
                        <div>
                          <span className="block text-sm font-bold text-white">{r.label}</span>
                          <span className="text-xs text-white/40">{r.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.55_0.22_270)] py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:bg-[oklch(0.60_0.22_270)]"
                >
                  <Send className="h-4 w-4" />
                  Generate Invite Link
                </button>
              </form>
            ) : (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-center flex-col gap-3 py-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-white">Invite Created</p>
                  <p className="text-xs text-white/40 text-center">
                    Share this link with <span className="text-white/70">{inviteEmail}</span>. It will expire in 72 hours.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                  <span className="flex-1 text-xs text-white/50 font-mono break-all">{inviteLink}</span>
                  <button
                    onClick={copyLink}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/70 transition-all hover:bg-white/20"
                  >
                    {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied!" : "Copy"}
                  </button>
                </div>

                <button
                  onClick={() => { setShowInvite(false); setInviteLink(""); setInviteEmail(""); }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white/60 transition-all hover:bg-white/10"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminRequestsPanel() {
  const fetchRequests = useServerFn(listAdminRequests);
  const reviewFn = useServerFn(reviewAdminRequest);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin_requests"],
    queryFn: () => fetchRequests(),
  });

  const review = useMutation({
    mutationFn: (vars: { id: string; action: "approve" | "reject" }) =>
      reviewFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_requests"] }),
  });

  const pending = (data?.requests ?? []).filter((r) => r.status === "pending");
  const recent = (data?.requests ?? []).filter((r) => r.status !== "pending").slice(0, 5);

  return (
    <div className="rounded-2xl border border-[oklch(0.55_0.22_270)]/25 bg-[oklch(0.55_0.22_270)]/[0.05] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-[oklch(0.75_0.18_270)]" />
            Pending super-admin requests
          </h3>
          <p className="mt-0.5 text-xs text-white/40">
            Submitted via the public <code className="rounded bg-white/10 px-1">/request-admin</code> form.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-bold text-white/70">
          {pending.length} pending
        </span>
      </div>

      {isLoading && <p className="text-xs text-white/40">Loading…</p>}
      {error && (
        <p className="text-xs text-red-400">
          {error instanceof Error ? error.message : "Failed to load requests."}
        </p>
      )}

      {!isLoading && pending.length === 0 && (
        <p className="text-xs text-white/40">No pending requests.</p>
      )}

      <ul className="space-y-2">
        {pending.map((r) => (
          <li
            key={r.id}
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-white/40" />
                <span className="text-sm font-semibold text-white">{r.email}</span>
                {!r.requested_user_id && (
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                    no account yet
                  </span>
                )}
              </div>
              {r.message && (
                <p className="mt-1.5 text-xs text-white/60 line-clamp-3">{r.message}</p>
              )}
              <p className="mt-1 text-[11px] text-white/30">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                disabled={review.isPending}
                onClick={() => review.mutate({ id: r.id, action: "approve" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                disabled={review.isPending}
                onClick={() => review.mutate({ id: r.id, action: "reject" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>

      {review.error && (
        <p className="mt-3 text-xs text-red-400">
          {review.error instanceof Error ? review.error.message : "Action failed."}
        </p>
      )}

      {recent.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-semibold text-white/40 hover:text-white/70">
            Recently reviewed ({recent.length})
          </summary>
          <ul className="mt-2 space-y-1.5">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span className="text-white/60">{r.email}</span>
                <span
                  className={
                    r.status === "approved"
                      ? "font-bold text-emerald-400"
                      : "font-bold text-white/40"
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
