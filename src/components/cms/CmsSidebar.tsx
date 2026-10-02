import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Crown,
  UserPlus,
  Plane,
  GraduationCap,
  CalendarClock,
  CalendarDays,
  PackageOpen,
  ClipboardList,
  KeyRound,
  CloudSun,
  CalendarX,
  Ban,
  CirclePoundSterling,
  Shield,
  Tag,
  BadgeCheck,
  Search,
  Mail,
  Inbox,
  ClipboardCheck,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

interface CmsSidebarProps {
  isSuperAdmin?: boolean;
}

export function CmsSidebar({ isSuperAdmin: propSuperAdmin }: CmsSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");

  const isSuperAdmin =
    propSuperAdmin ??
    (typeof window !== "undefined" &&
      (window.localStorage.getItem("pfa_dev_role") === "admin" ||
        document.cookie.includes("pfa_dev_role=admin")));

  async function handleSignOut() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("pfa_dev_role");
      window.localStorage.removeItem("pfa_dev_email");
      document.cookie = "pfa_dev_role=; path=/; max-age=0";
    }
    await supabase.auth.signOut().catch(() => {});
    navigate({ to: "/login" });
  }

  const navSections: NavSection[] = [
    {
      title: "Flight Operations",
      items: [
        {
          to: "/cms",
          icon: LayoutDashboard,
          label: "Overview",
          exact: true,
          superOnly: false,
        },
        { to: "/cms/day-sheet", icon: ClipboardCheck, label: "Day Sheet", superOnly: false },
        { to: "/cms/bookings", icon: ClipboardList, label: "Bookings", superOnly: false },
        {
          to: "/admin/bookings",
          icon: CirclePoundSterling,
          label: "Payments & Balances",
          superOnly: false,
        },
        { to: "/cms/enquiries", icon: Inbox, label: "Enquiries & Leads", superOnly: false },
        { to: "/cms/flying-status", icon: CloudSun, label: "Airfield Status", superOnly: false },
        {
          to: "/cms/instructor-hours",
          icon: CalendarCheck,
          label: "Instructor Hours",
          superOnly: false,
        },
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
        { to: "/cms/emails", icon: Mail, label: "Emails", superOnly: false },
      ],
    },
    {
      title: "System Administration",
      items: [
        { to: "/cms/content", icon: FileText, label: "Content Editor", superOnly: true },
        { to: "/cms/team", icon: Users, label: "Team & Instructors", superOnly: true },
        { to: "/cms/users", icon: UserPlus, label: "User Management", superOnly: true },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-surface-navy">
      {/* Header Branding */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
          {isSuperAdmin ? (
            <Crown className="h-4.5 w-4.5 text-primary-foreground" />
          ) : (
            <Shield className="h-4.5 w-4.5 text-primary-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <span className="block text-sm font-bold text-white tracking-tight truncate">
            CMS Editor & Operations
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
            placeholder="Filter menu..."
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
  );
}
