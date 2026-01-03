import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Search } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">StudyHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/subjects"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Subjects
          </Link>
          <Link
            to="/materials"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Materials
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="border-border hover:bg-secondary">
            Log In
          </Button>
          <Button className="bg-gradient-hero hover:opacity-90">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-4 px-4 py-4">
            <Link
              to="/subjects"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Subjects
            </Link>
            <Link
              to="/materials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Materials
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full border-border">
                Log In
              </Button>
              <Button className="w-full bg-gradient-hero">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
