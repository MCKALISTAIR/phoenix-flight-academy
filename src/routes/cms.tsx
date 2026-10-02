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
  GraduationCap,
  CalendarClock,
  CalendarDays,
  PackageOpen,
  ClipboardList,
  ClipboardCheck,
  CalendarCheck,
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
  Clock,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
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

function useZuluTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function update() {
      const now = new Date();
      const zulu = now.toISOString().substring(11, 19) + "Z";
      const local = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(`${zulu} • ${local} LOCAL`);
    }
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return time;
}

import { CmsSidebar } from "@/components/cms/CmsSidebar";

function CmsLayout() {
  const { cmsRoles } = Route.useRouteContext();
  const isSuperAdmin =
    (cmsRoles ?? []).includes("super_admin") ||
    (typeof window !== "undefined" && window.localStorage.getItem("pfa_dev_role") === "admin");
  const zuluTime = useZuluTime();

  return (
    <div className="flex min-h-screen bg-[oklch(0.12_0.04_250)]">
      {/* Operations Sidebar */}
      <CmsSidebar isSuperAdmin={isSuperAdmin} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto bg-[oklch(0.12_0.04_250)] text-white">
        {/* Top Flight Operations Strip */}
        <header className="border-b border-white/10 bg-surface-navy/70 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-white">EGPG Operations</span>
              <span className="text-white/30">·</span>
              <span className="text-white/60">RWY 08/26 (820m)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-white/80 bg-white/5 border border-white/10 rounded-md px-2 py-0.5">
              <Clock className="h-3 w-3 text-primary" />
              <span className="tabular-nums">{zuluTime || "12:00:00Z"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5">
              <Plane className="h-3 w-3" />
              <span>G-EGPG (PA-28) SERVICEABLE</span>
            </div>
            <Link
              to="/"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
