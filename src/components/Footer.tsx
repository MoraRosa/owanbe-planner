import { Link } from "react-router-dom";
import { Sparkles, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-primary">
                Owanbe
              </span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed">
              Bringing the spirit of Nigerian celebrations to your events. 
              From weddings to owambe, we make every occasion unforgettable.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/70 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: "/events", label: "Browse Events" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/admin", label: "Event Planners" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Types */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary">Event Types</h4>
            <ul className="space-y-3">
              {["Weddings", "Owambe Parties", "Naming Ceremonies", "Corporate Events", "Birthday Celebrations"].map((type) => (
                <li key={type}>
                  <span className="text-sidebar-foreground/70 text-sm">{type}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sidebar-foreground/70 text-sm">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-sidebar-foreground/70 text-sm">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-sidebar-foreground/70 text-sm">
                <Mail className="w-4 h-4 text-secondary" />
                <span>hello@owanbe.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sidebar-foreground/50 text-sm">
            © {new Date().getFullYear()} Owanbe Events. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="#" className="text-sidebar-foreground/50 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-sidebar-foreground/50 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
