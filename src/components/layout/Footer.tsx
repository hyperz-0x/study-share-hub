import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="LN-StudyHub Logo" className="h-[4.5rem] w-auto" />
              <span className="font-display text-xl font-bold text-foreground">LN-StudyHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your digital learning platform for accessing and sharing quality study materials.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/lncolg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://wa.me/918369916551" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/subjects" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Browse Subjects
                </Link>
              </li>
              <li>
                <Link to="/materials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Upload Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">For Users</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/student" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Students
                </Link>
              </li>
              <li>
                <Link to="/teacher" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Teachers
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Administrators
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="mailto:hellolncollege@gmail.com" className="hover:text-foreground transition-colors">
                  hellolncollege@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <a href="tel:+919137781252" className="hover:text-foreground transition-colors">
                  +91 91377 81252
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>LN College, Suman Education Society Campus, Borivali, Mumbai - 400066</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LN-StudyHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
