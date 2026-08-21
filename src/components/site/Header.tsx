import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch student session status
  const { data: student } = useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const res = await fetch("/api/student/me");
      if (!res.ok) throw new Error("Not logged in");
      return res.json() as Promise<{ id: string; name: string; email: string; purchasedCourses: string[] }>;
    },
    retry: false,
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/student/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      queryClient.invalidateQueries({ queryKey: ["student-me"] });
      queryClient.invalidateQueries({ queryKey: ["student-courses"] });
      navigate({ to: "/" });
    },
  });

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "All Courses", to: "/courses" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src="/sarvpratham-logo.png"
            alt="Sarvpratham Analytics"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative py-1 text-foreground/80 hover:text-primary transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {student ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="rounded-full gap-2 font-medium" size="sm">
                <Link to="/dashboard">
                  <User className="h-4 w-4" /> My Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="rounded-full font-medium" size="sm">
                <Link to="/login">Student Login</Link>
              </Button>
              <Button asChild className="rounded-full font-medium shadow-[var(--shadow-card)]" size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger menu */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white shadow-xl animate-in slide-in-from-top duration-200">
          <div className="px-5 py-6 space-y-5">
            <nav className="flex flex-col gap-4">
              {navLinks.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold py-1 text-foreground/95 hover:text-primary transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-4">
              {student ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Logged in as {student.name}</p>
                  <Button asChild className="w-full rounded-full gap-2 font-medium" onClick={() => setOpen(false)}>
                    <Link to="/dashboard">
                      <User className="h-4 w-4" /> My Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      logoutMutation.mutate();
                    }}
                    className="w-full rounded-full border-destructive/20 text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="rounded-full font-medium" onClick={() => setOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="rounded-full font-medium" onClick={() => setOpen(false)}>
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
