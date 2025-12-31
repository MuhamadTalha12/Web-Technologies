import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                L
              </div>
              <span className="font-display text-xl font-bold">
                Local<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting skilled service providers with customers in your locality. Find the perfect professional for any job.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-background/70 hover:text-primary transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/signup?role=provider" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services?category=web_development" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services?category=ui_ux_design" className="text-background/70 hover:text-primary transition-colors text-sm">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/services?category=digital_marketing" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link to="/services?category=consulting" className="text-background/70 hover:text-primary transition-colors text-sm">
                  Consulting
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="h-4 w-4 text-primary" />
                support@localconnect.com
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="h-4 w-4 text-primary" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                123 Market Street, San Francisco, CA 94105
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} LocalConnect. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-background/50 hover:text-background text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/50 hover:text-background text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
