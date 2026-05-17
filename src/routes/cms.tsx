import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Crown,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Plane,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cms")({
  component: CmsLayout,
  head: () => ({
    meta: [{ title: "CMS Editor | Phoenix Flight Training" }],
  }),
});

function CmsLayout() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  // Mock super-admin credentials — replace with Supabase Auth
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email === "cms@phoenixflight.co.uk" && password === "superadmin") {
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid credentials. Access restricted to Super Admins only.");
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.12_0.04_270)] px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[oklch(0.45_0.2_270)]/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[oklch(0.55_0.22_300)]/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-2xl">
            {/* Logo mark */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.55_0.22_270)] shadow-lg shadow-[oklch(0.55_0.22_270)]/30">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold text-white">CMS Editor</h1>
              <p className="mt-1 text-sm text-white/50">Super Admin access only</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cms@phoenixflight.co.uk"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-[oklch(0.65_0.22_270)] focus:ring-1 focus:ring-[oklch(0.65_0.22_270)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <Lock className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[oklch(0.55_0.22_270)] py-3 text-sm font-bold text-white shadow-lg shadow-[oklch(0.55_0.22_270)]/30 transition-all hover:scale-[1.01] hover:bg-[oklch(0.60_0.22_270)] focus:outline-none"
              >
                Access CMS Editor
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/30">
              Restricted area — Phoenix Flight Training internal use only
            </p>

            {/* Dev hint */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3 text-center text-xs text-white/20">
              Demo: <span className="font-mono text-white/40">cms@phoenixflight.co.uk</span> / <span className="font-mono text-white/40">superadmin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: "/cms", icon: LayoutDashboard, label: "Overview", exact: true },
    { to: "/cms/content", icon: FileText, label: "Content Editor" },
    { to: "/cms/team", icon: Users, label: "Team & Instructors" },
    { to: "/cms/fleet", icon: Plane, label: "Fleet & Aircraft" },
    { to: "/cms/users", icon: UserPlus, label: "User Management" },
  ];

  return (
    <div className="flex min-h-screen bg-[oklch(0.13_0.03_270)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-[oklch(0.10_0.04_270)]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.55_0.22_270)]">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="block text-sm font-bold text-white">CMS Editor</span>
            <span className="block text-xs text-white/40">Super Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && item.to !== "/cms";
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[oklch(0.55_0.22_270)]/20 text-[oklch(0.75_0.18_270)] border border-[oklch(0.55_0.22_270)]/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            to="/booking/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Ops Admin
          </Link>
          <button
            onClick={() => setAuthed(false)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
