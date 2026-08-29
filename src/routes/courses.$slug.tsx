import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, CheckCircle2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadForm } from "@/components/site/LeadForm";
import { Button } from "@/components/ui/button";
import { useAdviserModal } from "@/components/site/AdviserModal";
import { fetchCourse } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";

export const Route = createFileRoute("/courses/$slug")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { open: openAdviser } = useAdviserModal();
  const { slug } = Route.useParams();

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

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => fetchCourse(slug),
  });

  const hasPurchased = student?.purchasedCourses?.includes(slug) ?? false;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all courses
          </Link>

          {isLoading && (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {isError && (
            <p className="mt-10 text-sm text-muted-foreground">
              We couldn't find this course. It may have been removed —{" "}
              <Link to="/courses" className="text-primary underline">
                browse all courses
              </Link>
              .
            </p>
          )}

          {course && (
            <div className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-10 items-start">
              <div>
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <img
                    src={getCourseImage(course.category, course.imageUrl)}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Badge className="bg-accent text-accent-foreground rounded-full">
                    {course.tag}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {course.category}
                  </Badge>
                </div>
                <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                  {course.title}
                </h1>
                <p className="mt-3 text-muted-foreground">{course.shortDescription}</p>
                <div className="mt-5 flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {Math.max(50, course.enrolledCount).toLocaleString()} enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {course.durationHours} hrs
                  </span>
                  <span>{course.level}</span>
                </div>

                <p className="mt-8 text-foreground/90 leading-relaxed">{course.description}</p>

                {course.highlights.length > 0 && (
                  <div className="mt-8">
                    <h2 className="font-serif text-xl font-bold">What you'll get</h2>
                    <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                      {course.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sticky top-24 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Course Fee
                  </div>
                  <div className="font-serif text-3xl font-bold text-primary mt-1">
                    {course.price > 0 ? `₹${course.price}` : "Free"}
                  </div>
                </div>

                {hasPurchased ? (
                  <Button
                    asChild
                    className="w-full rounded-full py-6 font-semibold"
                  >
                    <Link to="/dashboard">Go to Student Dashboard</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full rounded-full py-6 font-semibold shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-transform"
                  >
                    <Link to={`/checkout/${course.slug}`}>Buy Course Now</Link>
                  </Button>
                )}

                {course.syllabusUrl && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full py-6 font-semibold border-primary/30 text-primary hover:-translate-y-0.5 transition-transform"
                  >
                    <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer">
                      Download Syllabus
                    </a>
                  </Button>
                )}

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">
                    Have questions? Submit an enquiry
                  </p>
                  <LeadForm
                    source="course-enquiry"
                    courseTitle={course.title}
                    showMessage={false}
                    submitLabel="Send Enquiry"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
