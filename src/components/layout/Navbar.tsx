import { Link } from "@tanstack/react-router";
import { PlaneTakeoff, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
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
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
            >
              About
            </Link>
            <div className="group relative">
              <span className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Flying
              </span>
              <div className="absolute left-1/2 mt-2 w-48 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to="/flying/experience"
                  className="block rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary"
                >
                  Experience Flights
                </Link>
                <Link
                  to="/flying/learn-to-fly"
                  className="block rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary"
                >
                  Learn to Fly
                </Link>
                <Link
                  to="/flying/self-hire"
                  className="block rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:text-primary"
                >
                  Self Hire
                </Link>
              </div>
            </div>
            <Link
              to="/fleet"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
            >
              Our Fleet
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-primary"
            >
              Contact
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Link
              to="/booking"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              to="/about"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/flying/experience"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Experience Flights
            </Link>
            <Link
              to="/flying/learn-to-fly"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Learn to Fly
            </Link>
            <Link
              to="/flying/self-hire"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Self Hire
            </Link>
            <Link
              to="/fleet"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Fleet
            </Link>
            <Link
              to="/contact"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/booking"
              className="mt-4 block w-full rounded-md bg-primary px-3 py-2 text-center text-base font-medium text-primary-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
