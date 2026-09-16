import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/components/site/MetaPixel";
import { Clock, Users, CheckCircle2, ArrowLeft, Award, Flame, Sparkles, TrendingUp, ChevronDown, PlayCircle, Lock, BookOpen, Zap, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadForm } from "@/components/site/LeadForm";
import { Button } from "@/components/ui/button";
import { useAdviserModal } from "@/components/site/AdviserModal";
import { fetchCourse } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { getCourseModules, flattenLessons } from "@/lib/courseModules";
import { getCoursePricing } from "@/lib/coursePricing";
import { trackCartEvent } from "@/lib/cartTracking";
import { RecommendedCourses } from "@/components/site/RecommendedCourses";

export function getTagBadge(tag: string) {
  const t = tag.toLowerCase().replace(/[^a-z0-9]+/g, "");
  switch (t) {
    case "bestseller":
      return {
        className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/30",
        icon: <Award className="h-3.5 w-3.5 text-amber-600" />,
      };
    case "trending":
      return {
        className: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border-rose-500/30",
        icon: <TrendingUp className="h-3.5 w-3.5 text-rose-600" />,
      };
    case "popular":
      return {
        className: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30",
        icon: <Flame className="h-3.5 w-3.5 text-emerald-600" />,
      };
    case "recommended":
      return {
        className: "bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-500/30",
        icon: <Sparkles className="h-3.5 w-3.5 text-indigo-600" />,
      };
    default:
      return {
        className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30",
        icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
      };
  }
}

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

  useEffect(() => {
    if (course) {
      trackMetaEvent("ViewContent", {
        content_name: course.title,
        content_category: course.category,
        content_ids: [course._id],
        content_type: "product",
        value: course.price,
        currency: "INR",
      });
    }
  }, [course]);

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
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="mt-6 flex items-center gap-2">
                  {(() => {
                    const badgeData = getTagBadge(course.tag);
                    return (
                      <Badge className={`${badgeData.className} gap-1 rounded-full border shadow-none`}>
                        {badgeData.icon}
                        {course.tag}
                      </Badge>
                    );
                  })()}
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

                <CourseCurriculum course={course} hasPurchased={hasPurchased} />
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sticky top-24 space-y-5">
                {(() => {
                  const pricing = getCoursePricing(course.price, course.originalPrice);
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Course Fee
                        </span>
                        {pricing.hasDiscount && (
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                            {pricing.discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-3 mt-2">
                        <div className="font-serif text-3xl sm:text-4xl font-extrabold text-primary">
                          {pricing.price > 0 ? `₹${pricing.price.toLocaleString()}` : "Free"}
                        </div>
                        {pricing.hasDiscount && (
                          <div className="text-lg text-muted-foreground line-through font-semibold">
                            ₹{pricing.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                      {pricing.hasDiscount && (
                        <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                          <span>✓</span>
                          <span>You save ₹{pricing.savings.toLocaleString()} (Special Offer Applied)</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {hasPurchased ? (
                  <Button
                    asChild
                    className="w-full rounded-full py-6 font-semibold"
                  >
                    <Link to="/dashboard">Go to Student Dashboard</Link>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {/* Primary: Buy Now */}
                    <Button
                      asChild
                      className="shine w-full rounded-full py-6 font-bold text-base bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Link 
                        to={`/checkout/${course.slug}`}
                        onClick={() => {
                          trackMetaEvent("InitiateCheckout", {
                            content_name: course.title,
                            content_category: course.category,
                            content_ids: [course._id],
                            content_type: "product",
                            value: course.price,
                            currency: "INR",
                          });
                        }}
                      >
                        <Zap className="h-4 w-4 fill-current" />
                        Buy Now
                      </Link>
                    </Button>

                    {/* Secondary: Add to Cart */}
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full py-6 font-bold text-sm border-2 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <Link
                        to={`/checkout/${course.slug}`}
                        onClick={() => {
                          toast.success("Course added to cart! Proceeding to checkout...");
                          trackMetaEvent("AddToCart", {
                            content_name: course.title,
                            content_category: course.category,
                            content_ids: [course._id],
                            content_type: "product",
                            value: course.price,
                            currency: "INR",
                          });
                          trackCartEvent("add_to_cart", {
                            courseSlug: course.slug,
                            courseTitle: course.title,
                            amount: course.price,
                          });
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Link>
                    </Button>
                  </div>
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

          {course && course.recommendedCourseDetails && course.recommendedCourseDetails.length > 0 && (
            <RecommendedCourses courses={course.recommendedCourseDetails} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Public curriculum outline. Module and lesson titles are visible to everyone so
 * a visitor can judge the course before buying; the API strips the underlying
 * links for anyone who has not purchased, so nothing here can leak content.
 */
function CourseCurriculum({
  course,
  hasPurchased,
}: {
  course: Parameters<typeof getCourseModules>[0];
  hasPurchased: boolean;
}) {
  const modules = getCourseModules(course);
  const totalLessons = flattenLessons(modules).length;
  // First module open by default — shows the shape of the course without a click.
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));

  if (modules.length === 0) return null;

  const toggle = (i: number) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const allOpen = openModules.size === modules.length;

  return (
    <div className="mt-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-xl font-bold">Course curriculum</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {modules.length} {modules.length === 1 ? "module" : "modules"} · {totalLessons}{" "}
            {totalLessons === 1 ? "lesson" : "lessons"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModules(allOpen ? new Set() : new Set(modules.map((_, i) => i)))}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="mt-4 divide-y divide-border rounded-2xl border border-border overflow-hidden bg-card">
        {modules.map((mod, i) => {
          const isOpen = openModules.has(i);
          return (
            <div key={`${mod.title}-${i}`}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <span className="flex-grow font-semibold text-sm">{mod.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {mod.lessons.length} {mod.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <ul className="pb-2 bg-muted/20">
                  {mod.lessons.map((lesson, li) => (
                    <li
                      key={`${lesson.title}-${li}`}
                      className="flex items-center gap-3 pl-11 pr-4 py-2 text-sm"
                    >
                      {hasPurchased ? (
                        <PlayCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={hasPurchased ? "" : "text-muted-foreground"}>
                        {lesson.title}
                      </span>
                    </li>
                  ))}
                  {mod.lessons.length === 0 && (
                    <li className="pl-11 pr-4 py-2 text-sm text-muted-foreground">
                      Lessons coming soon
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {!hasPurchased && (
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Enrol to unlock all {totalLessons} lessons, quizzes and assignments.
        </p>
      )}
    </div>
  );
}
