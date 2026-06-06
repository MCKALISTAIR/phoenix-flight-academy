import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect, isRedirect } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Crown,
  UserPlus,
  Plane,
  Activity,
  GraduationCap,
  CalendarClock,
  CalendarDays,
  PackageOpen,
  ClipboardList,
  KeyRound,
  CreditCard,
  CloudSun,
  CalendarX,
  Ban,
  Shield,
  Tag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms")({
  beforeLoad: async ({ location }) => {
    try {
      const { roles } = await requireAdmin(location.href);
      return { cmsRoles: roles };
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CmsLayout,
  head: () => ({
    meta: [{ title: "CMS Editor | Phoenix Flight Training" }],
  }),
});

function CmsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cmsRoles } = Route.useRouteContext();
  const isSuperAdmin = (cmsRoles ?? []).includes("super_admin");

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const allNavItems = [
    { to: "/cms", icon: LayoutDashboard, label: "Overview", exact: true, superOnly: false },
    { to: "/cms/content", icon: FileText, label: "Content Editor", superOnly: true },
    { to: "/cms/team", icon: Users, label: "Team & Instructors", superOnly: true },
    { to: "/cms/fleet", icon: Plane, label: "Fleet & Aircraft", superOnly: true },
    { to: "/cms/students", icon: GraduationCap, label: "Students & Logbook", superOnly: false },
    { to: "/cms/expiries", icon: CalendarClock, label: "Expiries", superOnly: false },
    { to: "/cms/bookings", icon: ClipboardList, label: "Bookings", superOnly: false },
    { to: "/cms/booking-products", icon: PackageOpen, label: "Booking Products", superOnly: true },
    { to: "/cms/calendar-settings", icon: CalendarDays, label: "Calendar Settings", superOnly: true },
    { to: "/cms/closed-dates", icon: CalendarX, label: "Closed Dates", superOnly: false },
    { to: "/cms/resource-blocks", icon: Ban, label: "Resource Blocks", superOnly: false },
    { to: "/cms/flying-status", icon: CloudSun, label: "Airfield Status", superOnly: false },
    { to: "/cms/self-hire-approvals", icon: KeyRound, label: "Self-Hire Approvals", superOnly: false },
    { to: "/cms/mock-payments", icon: CreditCard, label: "Mock Payments", superOnly: false },
    { to: "/cms/promotions", icon: Tag, label: "Promotions", superOnly: true },
    { to: "/cms/users", icon: UserPlus, label: "User Management", superOnly: true },
    { to: "/cms/analytics", icon: Activity, label: "System Analytics", superOnly: true },
  ];
  const navItems = allNavItems.filter((i) => !i.superOnly || isSuperAdmin);

  return (
    <div className="flex min-h-screen bg-[oklch(0.13_0.03_270)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-[oklch(0.10_0.04_270)]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.55_0.22_270)]">
            {isSuperAdmin ? <Crown className="h-4 w-4 text-white" /> : <Shield className="h-4 w-4 text-white" />}
          </div>
          <div>
            <span className="block text-sm font-bold text-white">CMS Editor</span>
            <span className="block text-xs text-white/40">{isSuperAdmin ? "Super Admin" : "Admin"}</span>
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
            onClick={handleSignOut}
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
