import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Plane,
  PlaneTakeoff,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Calendar,
  Compass,
  BookOpen,
  Award,
  Shield,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth, useRoles } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasAnyRole, hasRole } = useRoles();

  const isAdmin = hasAnyRole(["super_admin", "admin"]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll-aware background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pilot";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? "border-border/80 bg-background/95 backdrop-blur-md shadow-xs"
          : "border-border/40 bg-background/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border p-1.5 shadow-xs transition-transform duration-200 group-hover:scale-105 dark:bg-slate-950 dark:border-white/10">
              <img
                src="/logo.png"
                alt="Phoenix Flight Academy Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Phoenix Flight
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                  EGPG
                </span>
              </div>
              <span className="hidden sm:block text-[11px] text-muted-foreground font-medium -mt-0.5">
                Cumbernauld Airport
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-7">
            <NavLink to="/about">About</NavLink>

            {/* Flying Accessible Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground cursor-pointer">
                <span>Flying</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 p-2 shadow-lg border border-border"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/flying/experience"
                    className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                      <Compass className="h-4 w-4 text-primary shrink-0" />
                      Experience Flights
                    </div>
                    <span className="text-xs text-muted-foreground pl-6 leading-relaxed">
                      First-time trial lessons & gift vouchers
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/flying/learn-to-fly"
                    className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      Learn to Fly
                    </div>
                    <span className="text-xs text-muted-foreground pl-6 leading-relaxed">
                      PPL & LAPL syllabus from zero hours
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/flying/self-hire"
                    className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                      <Plane className="h-4 w-4 text-primary shrink-0" />
                      Aircraft Self-Hire
                    </div>
                    <span className="text-xs text-muted-foreground pl-6 leading-relaxed">
                      Club fleet rental for qualified pilots
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink to="/fleet">Our Fleet</NavLink>
            <NavLink to="/contact">Contact</NavLink>

            {/* Right Action / Auth Controls */}
            <div className="flex items-center gap-3.5 pl-1">
              <Link
                to="/booking"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg border border-primary/30 bg-primary/10 px-4 text-xs font-bold text-primary transition-all active:scale-[0.98] hover:bg-primary/20"
              >
                Book a Flight
              </Link>

              {authLoading ? (
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-border bg-card p-1 pr-2.5 text-sm font-medium transition-colors hover:bg-accent focus:outline-none cursor-pointer">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground font-mono">
                      {initials}
                    </div>
                    <span className="max-w-[120px] truncate text-xs font-semibold text-foreground">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-1.5 shadow-xl border border-border"
                  >
                    <DropdownMenuLabel className="px-2 py-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Ops Administrator
                        </span>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        to="/booking/dashboard"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-md hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Flight Deck / Dashboard
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          to="/cms"
                          className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-md hover:bg-accent text-amber-500"
                        >
                          <Shield className="h-4 w-4" />
                          Ops Console (CMS)
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link
                        to="/account"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium cursor-pointer rounded-md hover:bg-accent"
                      >
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Qualifications & Documents
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer rounded-md"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4.5 text-xs font-bold text-primary-foreground shadow-xs transition-all active:scale-[0.98] hover:bg-primary/90"
                >
                  Portal Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-5 space-y-4">
          <div className="space-y-1">
            <MobileLink to="/about">About Phoenix</MobileLink>
            <MobileLink to="/flying/experience">Experience Flights</MobileLink>
            <MobileLink to="/flying/learn-to-fly">Learn to Fly (PPL)</MobileLink>
            <MobileLink to="/flying/self-hire">Aircraft Self-Hire</MobileLink>
            <MobileLink to="/fleet">Our Fleet</MobileLink>
            <MobileLink to="/contact">Contact & Location</MobileLink>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <Link
              to="/booking"
              className="flex w-full items-center justify-center rounded-lg border border-primary/30 bg-primary/10 py-2.5 text-sm font-bold text-primary"
            >
              Book a Flight
            </Link>

            {user ? (
              <div className="space-y-2 pt-2">
                <div className="px-1">
                  <p className="text-xs font-bold text-foreground">{displayName}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{user.email}</p>
                </div>
                <Link
                  to="/booking/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Flight Deck Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/cms"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-bold text-amber-500"
                  >
                    <Shield className="h-4 w-4" />
                    Ops Console (CMS)
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 py-2 text-xs font-semibold text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground"
              >
                Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary group py-1"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary rounded-full transition-all duration-200 group-hover:w-full [.active_&]:w-full" />
    </Link>
  );
}

function MobileLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent [&.active]:text-primary [&.active]:bg-primary/10 transition-colors"
    >
      {children}
    </Link>
  );
}
