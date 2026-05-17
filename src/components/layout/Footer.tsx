import { Link } from "@tanstack/react-router";
import { PlaneTakeoff, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          
          {/* Brand & Intro */}
          <div className="space-y-6 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PlaneTakeoff className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Phoenix Flight</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground opacity-80">
              Start your aviation journey with friendly instructors and unforgettable experiences at Cumbernauld Airport.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground opacity-80 hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground opacity-80 hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Explore</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground opacity-80 hover:text-background transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/fleet" className="text-sm text-muted-foreground opacity-80 hover:text-background transition-colors">Our Fleet</Link>
              </li>
              <li>
                <Link to="/flying/experience" className="text-sm text-muted-foreground opacity-80 hover:text-background transition-colors">Experience Flights</Link>
              </li>
              <li>
                <Link to="/flying/learn-to-fly" className="text-sm text-muted-foreground opacity-80 hover:text-background transition-colors">Learn to Fly</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground opacity-80">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span>07769 690041</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground opacity-80">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span>info@phoenixflighttraining.co.uk</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground opacity-80">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>Cumbernauld Airport<br />G68 0PR</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Hours</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex justify-between text-sm text-muted-foreground opacity-80">
                <span>Mon - Fri</span>
                <span>09:00 - 17:00</span>
              </li>
              <li className="flex justify-between text-sm text-muted-foreground opacity-80">
                <span>Sat - Sun</span>
                <span>10:00 - 16:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-border/20 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground opacity-80">
            &copy; {new Date().getFullYear()} Phoenix Flight Training. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <Link to="/" className="text-xs text-muted-foreground opacity-80 hover:text-background transition-colors">Privacy Policy</Link>
            <Link to="/" className="text-xs text-muted-foreground opacity-80 hover:text-background transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
