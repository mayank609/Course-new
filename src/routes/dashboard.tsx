import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BookOpen, User, Phone, Mail, Award, ArrowRight, LogOut, FileText, ClipboardList, HelpCircle, ChevronDown, ChevronUp, PlayCircle, X } from "lucide-react";
import { Course } from "@/lib/api";
import { getCourseModules, flattenLessons } from "@/lib/courseModules";
import { getCourseImage } from "@/lib/courseImages";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedLessonModules, setExpandedLessonModules] = useState<Set<string>>(new Set());

  const toggleExpand = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const toggleLessonModule = (key: string) => {
    setExpandedLessonModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Fetch Student Profile
  const { data: student, isLoading: isProfileLoading, isError: isProfileQueryError, isFetching: isProfileFetching } = useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const res = await fetch("/api/student/me");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      return res.json() as Promise<{ id: string; name: string; email: string; phone?: string; purchasedCourses: string[] }>;
    },
    retry: false,
  });

  // A stale cached error (from before login) is refetched on mount; wait for
  // that fetch rather than showing the log in / register screen meanwhile.
  const isProfileError = isProfileQueryError && !isProfileFetching;

  // Fetch Student Purchased Courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["student-courses"],
    queryFn: async () => {
      const res = await fetch("/api/student/courses");
      if (!res.ok) {
        throw new Error("Failed to fetch purchased courses");
      }
      return res.json() as Promise<Course[]>;
    },
    enabled: !!student,
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/student/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Successfully logged out");
      queryClient.invalidateQueries({ queryKey: ["student-me"] });
      queryClient.invalidateQueries({ queryKey: ["student-courses"] });
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  if (isProfileError) {
    // If not logged in, redirect to login page
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 text-center shadow-[var(--shadow-card)]">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold">Please log in</h1>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              You need to sign in to access your student dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild rounded-full>
                <Link to="/login" search={{ redirect: "/dashboard" }}>
                  Log In
                </Link>
              </Button>
              <Button asChild variant="outline" rounded-full>
                <Link to="/register" search={{ redirect: "/dashboard" }}>
                  Register
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = isProfileLoading || (isProfileFetching && !student) || isCoursesLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-1/3" />
              <div className="grid md:grid-cols-[1fr_2.5fr] gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : (
            student && (
              <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                  <div>
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                      Student Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Welcome back, <span className="font-semibold text-foreground">{student.name}</span>!
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <button
                          className="h-10 w-10 grid place-items-center rounded-full border border-border bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                          aria-label="View profile details"
                        >
                          <User className="h-5 w-5" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent align="end" className="w-72 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="font-serif text-base font-bold truncate">{student.name}</h2>
                            <p className="text-xs text-muted-foreground">Your account details</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm mt-4">
                          <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="truncate text-foreground">{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center gap-2.5 text-muted-foreground">
                              <Phone className="h-4 w-4 shrink-0" />
                              <span className="text-foreground">{student.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 text-muted-foreground border-t border-border pt-3">
                            <BookOpen className="h-4 w-4 shrink-0" />
                            <span className="text-foreground font-semibold">
                              {student.purchasedCourses.length} Courses Purchased
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <Button
                      variant="outline"
                      onClick={() => logoutMutation.mutate()}
                      className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </Button>
                  </div>
                </div>

                <div className="max-w-3xl">
                  {/* My Courses Section */}
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl font-bold">My Purchased Courses</h2>

                    {!courses || courses.length === 0 ? (
                      <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-[var(--shadow-card)]">
                        <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-semibold text-lg">No courses yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                          You haven't purchased any courses yet. Browse our list and start learning today!
                        </p>
                        <Button asChild rounded-full>
                          <Link to="/courses">Browse Courses</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {courses.map((course) => {
                          const isExpanded = expandedCourses.has(course._id);
                          return (
                            <div
                              key={course._id}
                              className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-card)] flex flex-col gap-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full">
                                <div className="flex flex-col sm:flex-row items-start gap-5 max-w-xl">
                                  <Link
                                    to={`/learning/${course.slug}`}
                                    className="w-full sm:w-40 shrink-0 aspect-video rounded-2xl overflow-hidden border border-border bg-muted"
                                  >
                                    <img
                                      src={getCourseImage(course.category, course.imageUrl)}
                                      alt={course.title}
                                      loading="lazy"
                                      className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-300"
                                    />
                                  </Link>
                                  <div className="space-y-1.5">
                                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                    {course.category}
                                  </span>
                                  <h3 className="font-serif text-xl font-bold tracking-tight">
                                    {course.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {course.shortDescription}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                    <span>{course.durationHours} hrs of content</span>
                                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                      <Award className="h-3.5 w-3.5" /> Full Access
                                    </span>
                                  </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
                                  <Button
                                    variant="outline"
                                    rounded-full
                                    onClick={() => toggleExpand(course._id)}
                                    className="flex items-center gap-1.5"
                                  >
                                    {isExpanded ? (
                                      <>Hide Materials <ChevronUp className="h-4 w-4" /></>
                                    ) : (
                                      <>View Materials <ChevronDown className="h-4 w-4" /></>
                                    )}
                                  </Button>
                                  <Button asChild rounded-full className="shrink-0 group font-bold">
                                    <Link to={`/learning/${course.slug}`}>
                                      Start Learning{" "}
                                      <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="pt-6 border-t border-border w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {/* Video Lessons */}
                                  <div className="space-y-3">
                                    {(() => {
                                      const modules = getCourseModules(course);
                                      const lessons = flattenLessons(modules);
                                      let cursor = 0;
                                      return (
                                        <>
                                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                                            <PlayCircle className="h-3.5 w-3.5 text-red-600 animate-pulse" /> Video Lessons ({lessons.length})
                                          </h4>
                                          {lessons.length > 0 ? (
                                            <div className="space-y-2">
                                              {modules.map((mod, modIdx) => {
                                                const startIdx = cursor;
                                                cursor += mod.lessons.length;
                                                const moduleKey = `${course._id}-${modIdx}`;
                                                const isModuleOpen = expandedLessonModules.has(moduleKey);
                                                return (
                                                  <div key={modIdx}>
                                                    {modules.length > 1 ? (
                                                      <button
                                                        type="button"
                                                        onClick={() => toggleLessonModule(moduleKey)}
                                                        className="w-full flex items-center gap-1.5 text-left"
                                                      >
                                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide truncate flex-grow">
                                                          {mod.title}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                                          {mod.lessons.length}
                                                        </span>
                                                        {isModuleOpen ? (
                                                          <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        ) : (
                                                          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        )}
                                                      </button>
                                                    ) : null}
                                                    {(modules.length === 1 || isModuleOpen) && (
                                                      <ul className="space-y-2 mt-1.5">
                                                        {mod.lessons.map((vid, lessonIdx) => {
                                                          const idx = startIdx + lessonIdx;
                                                          return (
                                                            <li key={idx} className="text-sm">
                                                              {vid.link ? (
                                                                <Link
                                                                  to={`/learning/${course.slug}`}
                                                                  search={{ lesson: idx + 1 }}
                                                                  className="text-foreground hover:text-primary text-left transition-colors hover:underline flex items-center gap-1.5 group/vid w-full"
                                                                >
                                                                  <PlayCircle className="h-4 w-4 text-red-500 shrink-0 group-hover/vid:text-red-600" />
                                                                  <span className="truncate">{vid.title}</span>
                                                                </Link>
                                                              ) : (
                                                                <span className="text-muted-foreground flex items-center gap-1">• {vid.title}</span>
                                                              )}
                                                            </li>
                                                          );
                                                        })}
                                                      </ul>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-muted-foreground italic">No videos yet</p>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>

                                  {/* Classwork */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-primary" /> Classworks ({course.classworks?.length || 0})
                                    </h4>
                                    {course.classworks && course.classworks.length > 0 ? (
                                      <ul className="space-y-2">
                                        {course.classworks.map((cw, idx) => (
                                          <li key={idx} className="text-sm">
                                            {cw.link ? (
                                              <a href={cw.link} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1">
                                                • {cw.title}
                                              </a>
                                            ) : (
                                              <span className="text-muted-foreground flex items-center gap-1">• {cw.title}</span>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">No classworks yet</p>
                                    )}
                                  </div>

                                  {/* Assignments */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                                      <ClipboardList className="h-3.5 w-3.5 text-amber-600" /> Assignments ({course.assignments?.length || 0})
                                    </h4>
                                    {course.assignments && course.assignments.length > 0 ? (
                                      <ul className="space-y-2">
                                        {course.assignments.map((as, idx) => (
                                          <li key={idx} className="text-sm">
                                            {as.link ? (
                                              <a href={as.link} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1">
                                                • {as.title}
                                              </a>
                                            ) : (
                                              <span className="text-muted-foreground flex items-center gap-1">• {as.title}</span>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">No assignments yet</p>
                                    )}
                                  </div>

                                  {/* Quizzes */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                                      <HelpCircle className="h-3.5 w-3.5 text-emerald-600" /> Quizzes ({course.quizzes?.length || 0})
                                    </h4>
                                    {course.quizzes && course.quizzes.length > 0 ? (
                                      <ul className="space-y-2">
                                        {course.quizzes.map((qz, idx) => (
                                          <li key={idx} className="text-sm">
                                            {qz.link ? (
                                              <a href={qz.link} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors hover:underline flex items-center gap-1">
                                                • {qz.title}
                                              </a>
                                            ) : (
                                              <span className="text-muted-foreground flex items-center gap-1">• {qz.title}</span>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-xs text-muted-foreground italic">No quizzes yet</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>


      <Footer />
    </div>
  );
}
