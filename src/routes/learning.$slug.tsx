import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomVideoPlayer } from "@/components/site/CustomVideoPlayer";
import { fetchCourse } from "@/lib/api";
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  ClipboardList,
  HelpCircle,
  Award,
  BookOpen,
  ChevronRight,
  ListVideo
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/learning/$slug")({
  component: LearningClassroomPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      lesson: search.lesson ? Number(search.lesson) : undefined,
    };
  },
});

function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return ytMatch[1];
  }
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return url;
  }
  return null;
}

function LearningClassroomPage() {
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  const { lesson } = Route.useSearch();

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"info" | "classworks" | "assignments" | "quizzes">("info");

  // Fetch Student Profile (to verify authentication and purchase)
  const { data: student, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const res = await fetch("/api/student/me");
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json() as Promise<{ id: string; name: string; email: string; purchasedCourses: string[] }>;
    },
    retry: false,
  });

  // Fetch Course details
  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => fetchCourse(slug),
  });

  // Synchronize index with search param
  useEffect(() => {
    if (lesson && lesson > 0 && course && course.videos && lesson <= course.videos.length) {
      setActiveVideoIndex(lesson - 1);
    }
  }, [lesson, course]);

  // Redirect to login if unauthorized
  useEffect(() => {
    if (isProfileError) {
      toast.error("Please log in to access the classroom");
      navigate({ to: "/login", search: { redirect: `/learning/${slug}` } });
    }
  }, [isProfileError, navigate, slug]);

  // Redirect to details if the student hasn't purchased the course
  useEffect(() => {
    if (student && !student.purchasedCourses.includes(slug)) {
      toast.error("You do not have access to this course. Please purchase it first.");
      navigate({ to: `/courses/${slug}` });
    }
  }, [student, slug, navigate]);

  const isLoading = isProfileLoading || isCourseLoading;
  const hasAccess = student && student.purchasedCourses.includes(slug);

  if (isProfileError || (student && !hasAccess)) {
    return null; // Will redirect in useEffect
  }

  const videos = course?.videos || [];
  const currentVideo = videos[activeVideoIndex];
  const ytVideoId = currentVideo?.link ? getYoutubeVideoId(currentVideo.link) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {isLoading ? (
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="w-full max-w-6xl grid md:grid-cols-[300px_1fr] gap-8 h-[600px]">
            <Skeleton className="h-full w-full rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-[360px] w-full rounded-3xl" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      ) : isCourseError || !course ? (
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">Failed to load course classroom.</p>
            <Button asChild rounded-full>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      ) : (
        <main className="flex-grow flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
          
          {/* Left Column: Scrollable Video Playlist */}
          <aside className="border-r border-border bg-card flex flex-col h-auto md:h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-5 border-b border-border space-y-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Dashboard
              </Link>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                  {course.category}
                </span>
                <h2 className="font-serif text-lg font-bold tracking-tight line-clamp-1">{course.title}</h2>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2 max-h-[300px] md:max-h-none">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                <ListVideo className="h-4 w-4" /> Lesson Playlist ({videos.length})
              </div>
              
              {videos.length === 0 ? (
                <div className="text-center p-6 text-sm text-muted-foreground italic bg-muted/20 rounded-2xl">
                  No video lessons uploaded yet.
                </div>
              ) : (
                videos.map((vid, idx) => {
                  const isActive = idx === activeVideoIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveVideoIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-2xl flex gap-3 transition-all duration-200 group relative border outline-none ${
                        isActive
                          ? "bg-primary/5 border-primary/20 shadow-sm"
                          : "bg-transparent border-transparent hover:bg-muted/30"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
                      )}
                      
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold transition-colors ${
                        isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15"
                      }`}>
                        {idx + 1}
                      </div>
                      
                      <div className="min-w-0 flex-grow py-0.5">
                        <p className={`text-sm font-semibold line-clamp-2 leading-snug transition-colors ${
                          isActive ? "text-primary font-bold" : "text-foreground"
                        }`}>
                          {vid.title}
                        </p>
                      </div>

                      <ChevronRight className={`h-4 w-4 shrink-0 self-center transition-all ${
                        isActive ? "text-primary translate-x-0.5 opacity-100" : "text-muted-foreground/30 opacity-0 group-hover:opacity-100"
                      }`} />
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Area: Main Video Playback and Tabs */}
          <section className="bg-muted/10 p-6 md:p-8 h-auto md:h-[calc(100vh-64px)] overflow-y-auto flex flex-col gap-6">
            
            {/* Active Video Screen Box */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
              <div className="aspect-video w-full bg-black relative">
                {videos.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                    <PlayCircle className="h-14 w-14 text-muted-foreground mb-3 animate-pulse" />
                    <h3 className="font-semibold text-lg">No lessons available</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      Check back shortly. The course contents and lessons are currently being updated.
                    </p>
                  </div>
                ) : ytVideoId ? (
                  <CustomVideoPlayer videoId={ytVideoId} key={ytVideoId} />
                ) : currentVideo?.link ? (
                  <video
                    src={currentVideo.link}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-muted/30">
                    <PlayCircle className="h-14 w-14 text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-lg">Video link missing</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-1">
                      This lesson does not have a valid media link configured.
                    </p>
                  </div>
                )}
              </div>

              {/* Title Bar */}
              {currentVideo && (
                <div className="p-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      Now playing — Lesson {activeVideoIndex + 1}
                    </span>
                    <h1 className="font-serif text-xl font-bold tracking-tight text-foreground">
                      {currentVideo.title}
                    </h1>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" /> Enrolled: Lifetime Access
                  </div>
                </div>
              )}
            </div>

            {/* Material & Resources Tabs */}
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-border pb-px overflow-x-auto gap-6 text-sm font-semibold scrollbar-none">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`pb-3 border-b-2 transition-all outline-none whitespace-nowrap ${
                    activeTab === "info"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Course Info
                </button>
                <button
                  onClick={() => setActiveTab("classworks")}
                  className={`pb-3 border-b-2 transition-all outline-none whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "classworks"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-4 w-4" /> Classworks ({(course.classworks || []).length})
                </button>
                <button
                  onClick={() => setActiveTab("assignments")}
                  className={`pb-3 border-b-2 transition-all outline-none whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "assignments"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" /> Assignments ({(course.assignments || []).length})
                </button>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className={`pb-3 border-b-2 transition-all outline-none whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "quizzes"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" /> Quizzes ({(course.quizzes || []).length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-sm)]">
                
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold font-serif mb-1">About this course</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Duration</span>
                        <span className="text-sm font-semibold">{course.durationHours} hours</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Level</span>
                        <span className="text-sm font-semibold capitalize">{course.level}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Category</span>
                        <span className="text-sm font-semibold">{course.category}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Syllabus</span>
                        {course.syllabusUrl ? (
                          <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                            Download PDF
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "classworks" && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold font-serif mb-2">Classworks & Reference Sheets</h3>
                    {!course.classworks || course.classworks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No classwork sheets uploaded yet.</p>
                    ) : (
                      <div className="grid gap-2">
                        {course.classworks.map((cw, idx) => (
                          <div key={idx} className="p-3 bg-muted/20 hover:bg-muted/30 border border-border/60 rounded-2xl flex items-center justify-between transition-colors">
                            <span className="text-sm font-medium">{cw.title}</span>
                            {cw.link ? (
                              <Button asChild size="sm" rounded-full>
                                <a href={cw.link} target="_blank" rel="noopener noreferrer">Download</a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Reference only</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "assignments" && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold font-serif mb-2">Practice Assignments</h3>
                    {!course.assignments || course.assignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No assignments uploaded yet.</p>
                    ) : (
                      <div className="grid gap-2">
                        {course.assignments.map((as, idx) => (
                          <div key={idx} className="p-3 bg-muted/20 hover:bg-muted/30 border border-border/60 rounded-2xl flex items-center justify-between transition-colors">
                            <span className="text-sm font-medium">{as.title}</span>
                            {as.link ? (
                              <Button asChild size="sm" rounded-full>
                                <a href={as.link} target="_blank" rel="noopener noreferrer">Open Assignment</a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Reference only</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "quizzes" && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold font-serif mb-2">Course Quizzes & Assessments</h3>
                    {!course.quizzes || course.quizzes.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No quizzes uploaded yet.</p>
                    ) : (
                      <div className="grid gap-2">
                        {course.quizzes.map((qz, idx) => (
                          <div key={idx} className="p-3 bg-muted/20 hover:bg-muted/30 border border-border/60 rounded-2xl flex items-center justify-between transition-colors">
                            <span className="text-sm font-medium">{qz.title}</span>
                            {qz.link ? (
                              <Button asChild size="sm" rounded-full>
                                <a href={qz.link} target="_blank" rel="noopener noreferrer">Start Quiz</a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Reference only</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </section>

        </main>
      )}

      <Footer />
    </div>
  );
}
