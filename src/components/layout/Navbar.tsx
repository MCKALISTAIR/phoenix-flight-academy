import { Link, useLocation } from "@tanstack/react-router";
import { PlaneTakeoff, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll-aware background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? "border-border/80 bg-background/95 shadow-sm"
          : "border-border/30 bg-background/70"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-border p-1.5 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 dark:bg-slate-950 dark:border-white/10">
                <img
                  src="/logo.png"
                  alt="Phoenix Flight Academy Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Phoenix Flight
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <NavLink to="/about">About</NavLink>
            <div className="group relative">
              <span className="cursor-pointer flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Flying
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </span>
              <div className="absolute left-1/2 mt-2 w-52 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <Link
                  to="/flying/experience"
                  className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary transition-colors"
                >
                  Experience Flights
                </Link>
                <Link
                  to="/flying/learn-to-fly"
                  className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary transition-colors"
                >
                  Learn to Fly
                </Link>
                <Link
                  to="/flying/self-hire"
                  className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary transition-colors"
                >
                  Self Hire
                </Link>
              </div>
            </div>
            <NavLink to="/fleet">Our Fleet</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Link
              to="/booking"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-primary/30 bg-primary/10 px-5 text-sm font-semibold text-primary transition-all hover:bg-primary/15"
            >
              Book a Flight
            </Link>
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Portal Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — animated slide-down */}
      <div
        className={`md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-4 pb-3 pt-2">
          <MobileLink to="/about">About</MobileLink>
          <MobileLink to="/flying/experience">Experience Flights</MobileLink>
          <MobileLink to="/flying/learn-to-fly">Learn to Fly</MobileLink>
          <MobileLink to="/flying/self-hire">Self Hire</MobileLink>
          <MobileLink to="/fleet">Our Fleet</MobileLink>
          <MobileLink to="/contact">Contact</MobileLink>
          <MobileLink to="/booking">Book a Flight</MobileLink>
          <Link
            to="/login"
            className="mt-4 block w-full rounded-md bg-primary px-3 py-2 text-center text-base font-medium text-primary-foreground"
          >
            Portal Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Desktop nav link with animated active underline
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary rounded-full transition-all duration-300 group-hover:w-full [.active_&]:w-full" />
    </Link>
  );
}

// Mobile nav link
function MobileLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent [&.active]:text-primary [&.active]:bg-primary/10 transition-colors"
    >
      {children}
    </Link>
  );
}
