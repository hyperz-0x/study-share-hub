import { Link } from "react-router-dom";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">StudyHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your digital learning platform for accessing and sharing quality study materials.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                <Linkedin className="h-5 w-5" />
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

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
