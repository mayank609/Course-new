import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ChevronDown, User, LogOut, Search } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Header() {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 300); // 300ms grace delay
  };
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  
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

  // Fetch categories list for dropdown
  const { data: categories } = useQuery<{ _id: string; name: string }[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      return res.json();
    },
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src="/sarvpratham-logo-transparent.png"
            alt="Sarvpratham Analytics"
            className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className="relative py-1 text-foreground/80 hover:text-primary transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>

          {/* Courses Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate({ to: "/courses" })}
              className="flex items-center gap-1 py-1 text-foreground/80 hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              <span>Courses</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-1 w-56 rounded-2xl border border-border bg-white p-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="space-y-1">
                  <Link
                    to="/courses"
                    onClick={() => setShowDropdown(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                  >
                    All Courses
                  </Link>
                  <div className="h-px bg-border my-1" />
                  {categories && categories.length > 0 ? (
                    categories.map((c) => (
                      <Link
                        key={c._id}
                        to="/courses"
                        search={{ category: c.name }}
                        onClick={() => setShowDropdown(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                      Microsoft Office
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/about"
            className="relative py-1 text-foreground/80 hover:text-primary transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="relative py-1 text-foreground/80 hover:text-primary transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (headerSearch.trim()) {
                navigate({ to: "/courses", search: { search: headerSearch.trim() } });
                setHeaderSearch("");
              }
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search courses..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200/80 rounded-full pl-4 pr-10 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-all text-slate-800 placeholder-slate-400 w-36 focus:w-48"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors">
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate({ to: "/courses", search: { search: headerSearch.trim() } });
                  setHeaderSearch("");
                  setOpen(false);
                }
              }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search courses..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-full pl-4 pr-10 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 text-slate-800 placeholder-slate-400"
              />
              <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="text-base font-semibold py-1 text-foreground/95 hover:text-primary transition-colors"
              >
                Home
              </Link>
              
              <div>
                <button
                  onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                  className="flex items-center justify-between w-full text-base font-semibold py-1 text-foreground/95 hover:text-primary transition-colors focus:outline-none"
                >
                  <span>Courses</span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileCoursesOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileCoursesOpen && (
                  <div className="mt-2 pl-4 border-l border-border flex flex-col gap-2.5">
                    <Link
                      to="/courses"
                      onClick={() => setOpen(false)}
                      className="text-sm py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      All Courses
                    </Link>
                    {categories && categories.map((c) => (
                      <Link
                        key={c._id}
                        to="/courses"
                        search={{ category: c.name }}
                        onClick={() => setOpen(false)}
                        className="text-sm py-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="text-base font-semibold py-1 text-foreground/95 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="text-base font-semibold py-1 text-foreground/95 hover:text-primary transition-colors"
              >
                Contact
              </Link>
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
