import { Link } from "@tanstack/react-router";
import { PlaneTakeoff, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.12_0.04_250)] text-white border-t border-white/5">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          
          {/* Brand & Intro */}
          <div className="space-y-6 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PlaneTakeoff className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Phoenix Flight</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60">
              Start your aviation journey with friendly instructors and unforgettable experiences at Cumbernauld Airport.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/phoenixflighttraining"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Phoenix Flight Training on Facebook"
                className="text-white/60 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/phoenixflighttraining"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Phoenix Flight Training on Instagram"
                className="text-white/60 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Explore</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="text-sm text-white/60 hover:text-white transition-colors">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link to="/flying/experience" className="text-sm text-white/60 hover:text-white transition-colors">
                  Experience Flights
                </Link>
              </li>
              <li>
                <Link to="/flying/learn-to-fly" className="text-sm text-white/60 hover:text-white transition-colors">
                  Learn to Fly
                </Link>
              </li>
              <li>
                <Link to="/flying/self-hire" className="text-sm text-white/60 hover:text-white transition-colors">
                  Self Hire
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact — clickable tel/mailto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href="tel:07769690041"
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors group"
                >
                  <Phone className="h-5 w-5 shrink-0 text-primary" />
                  <span>07769 690041</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@phoenixflighttraining.co.uk"
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span>info@phoenixflighttraining.co.uk</span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=Cumbernauld+Airport+G68+0PR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span>
                    Cumbernauld Airport<br />G68 0PR
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Hours</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex justify-between text-sm text-white/60">
                <span>Mon – Fri</span>
                <span>09:00 – 17:00</span>
              </li>
              <li className="flex justify-between text-sm text-white/60">
                <span>Sat – Sun</span>
                <span>10:00 – 16:00</span>
              </li>
              <li className="mt-6">
                <Link
                  to="/booking"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02]"
                >
                  Book a Flight →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Phoenix Flight Training. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <Link to="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-white/40 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
