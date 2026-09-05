import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  redirect,
  isRedirect,
} from "@tanstack/react-router";
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
  BadgeCheck,
  Search,
} from "lucide-react";
import { useState } from "react";
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
    meta: [{ title: "Flight Operations & CMS Console | Phoenix Flight Training" }],
  }),
});

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
  superOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function CmsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cmsRoles } = Route.useRouteContext();
  const isSuperAdmin = (cmsRoles ?? []).includes("super_admin");
  const [navSearch, setNavSearch] = useState("");

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const navSections: NavSection[] = [
    {
      title: "Flight Operations",
      items: [
        {
          to: "/cms",
          icon: LayoutDashboard,
          label: "Console Overview",
          exact: true,
          superOnly: false,
        },
        { to: "/cms/bookings", icon: ClipboardList, label: "Bookings", superOnly: false },
        { to: "/cms/flying-status", icon: CloudSun, label: "Airfield Status", superOnly: false },
        { to: "/cms/resource-blocks", icon: Ban, label: "Resource Blocks", superOnly: false },
        { to: "/cms/closed-dates", icon: CalendarX, label: "Closed Dates", superOnly: false },
      ],
    },
    {
      title: "Training & Students",
      items: [
        { to: "/cms/students", icon: GraduationCap, label: "Students & Logbook", superOnly: false },
        { to: "/cms/expiries", icon: CalendarClock, label: "Expiries", superOnly: false },
        {
          to: "/cms/self-hire-approvals",
          icon: KeyRound,
          label: "Self-Hire Approvals",
          superOnly: false,
        },
        {
          to: "/cms/pilot-verifications",
          icon: BadgeCheck,
          label: "Pilot Verifications",
          superOnly: false,
        },
      ],
    },
    {
      title: "Fleet & Asset Pricing",
      items: [
        { to: "/cms/fleet", icon: Plane, label: "Fleet & Aircraft", superOnly: true },
        {
          to: "/cms/booking-products",
          icon: PackageOpen,
          label: "Booking Products",
          superOnly: true,
        },
        {
          to: "/cms/calendar-settings",
          icon: CalendarDays,
          label: "Calendar Settings",
          superOnly: true,
        },
        { to: "/cms/promotions", icon: Tag, label: "Promotions", superOnly: true },
        { to: "/cms/mock-payments", icon: CreditCard, label: "Mock Payments", superOnly: false },
      ],
    },
    {
      title: "System Administration",
      items: [
        { to: "/cms/content", icon: FileText, label: "Content Editor", superOnly: true },
        { to: "/cms/team", icon: Users, label: "Team & Instructors", superOnly: true },
        { to: "/cms/users", icon: UserPlus, label: "User Management", superOnly: true },
        { to: "/cms/analytics", icon: Activity, label: "System Analytics", superOnly: true },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[oklch(0.12_0.04_250)]">
      {/* Operations Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-surface-navy">
        {/* Header Branding */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            {isSuperAdmin ? (
              <Crown className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Shield className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-sm font-bold text-white tracking-tight truncate">
              CMS Editor
            </span>
            <span className="block text-[10px] font-mono text-white/50 uppercase tracking-wider">
              {isSuperAdmin ? "Chief Admin • EGPG" : "Flight Ops • EGPG"}
            </span>
          </div>
        </div>

        {/* Quick Search Jump */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Quick jump..."
              className="w-full rounded-md border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Nav Sections Scroll Area */}
        <nav className="flex-1 space-y-5 px-3 py-3 overflow-y-auto">
          {navSections.map((section) => {
            const visibleItems = section.items
              .filter((i) => !i.superOnly || isSuperAdmin)
              .filter((i) =>
                navSearch.trim() ? i.label.toLowerCase().includes(navSearch.toLowerCase()) : true,
              );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <span className="px-2 block text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to) && item.to !== "/cms";
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 p-3 space-y-1.5 bg-black/10">
          <Link
            to="/booking/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/50 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
