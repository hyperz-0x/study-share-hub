import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Search, User, LogOut, LayoutDashboard, Sparkles, Brain, CalendarCheck, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, role, signOut, isTeacher, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isTeacher) return "/teacher";
    if (isStudent) return "/student";
    return "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LN-StudyHub Logo" className="h-[4.5rem] w-auto" />
          <span className="font-display text-xl font-bold text-foreground">LN-StudyHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/subjects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Subjects
          </Link>
          <Link to="/materials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Materials
          </Link>
          {user && (
            <Link to="/doubt-solver" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />AI Doubts
            </Link>
          )}
          {user && (
            <Link to="/quiz" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />Quiz
            </Link>
          )}
          {isStudent && (
            <Link to="/student" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              My Dashboard
            </Link>
          )}
          {isTeacher && (
            <Link to="/teacher" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{profile?.full_name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <DropdownMenuSeparator />
                {(isTeacher || isAdmin || isStudent) && (
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" className="border-border hover:bg-secondary">
                  Log In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-hero hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </>
          )}
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
            <Link to="/subjects" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Subjects</Link>
            <Link to="/materials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Materials</Link>
            {user && (
              <Link to="/doubt-solver" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                <Sparkles className="h-3.5 w-3.5" />AI Doubt Solver
              </Link>
            )}
            {user && (
              <Link to="/quiz" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                <Brain className="h-3.5 w-3.5" />AI Quiz
              </Link>
            )}
            {isStudent && (
              <Link to="/student" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
            )}
            {isTeacher && (
              <Link to="/teacher" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Admin</Link>
            )}
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-border">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-hero">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
