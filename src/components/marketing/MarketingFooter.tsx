import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-4 w-4" />
            </span>
            Skyline
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            The operations platform built for flight schools. Bookings, fleet,
            students, instructors and compliance — in one place.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/marketing/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/marketing/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/marketing/for-schools" className="hover:text-foreground">For schools</Link></li>
            <li><Link to="/marketing/blog" className="hover:text-foreground">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/marketing/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/marketing/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/marketing/legal/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link to="/marketing/legal/privacy" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Skyline. All rights reserved.</span>
          <span>Built for the flight training community.</span>
        </div>
      </div>
    </footer>
  );
}