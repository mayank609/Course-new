import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, TrendingUp } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdviserModal } from "@/components/site/AdviserModal";
import { fetchCourses } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { sampleCourses } from "@/lib/sampleCourses";
import { toDisplayCourses, sampleToDisplayCourses } from "@/lib/displayCourse";

export const Route = createFileRoute("/courses/")({
  validateSearch: z.object({ category: z.string().optional() }),
  component: CoursesPage,
});

function CoursesPage() {
  const { open: openAdviser } = useAdviserModal();
  const { category: initialCategory } = Route.useSearch();
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);

  useEffect(() => {
    setCategory(initialCategory ?? null);
  }, [initialCategory]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const source =
    courses && courses.length > 0
      ? toDisplayCourses(courses)
      : sampleToDisplayCourses(sampleCourses);
  const categories = Array.from(new Set(source.map((c) => c.category)));
  const visible = category ? source.filter((c) => c.category === category) : source;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
              Full Catalog
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              All Courses
            </h1>
            <p className="mt-2 text-muted-foreground">Browse every certification we offer.</p>
          </div>

          {categories.length > 0 && (
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCategory(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all hover:-translate-y-0.5 ${!category ? "bg-[image:var(--gradient-primary)] text-white border-transparent shadow-[var(--shadow-card)]" : "bg-white text-foreground border-border hover:border-[color:var(--brand-gold)]/50"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all hover:-translate-y-0.5 ${category === c ? "bg-[image:var(--gradient-primary)] text-white border-transparent shadow-[var(--shadow-card)]" : "bg-white text-foreground border-border hover:border-[color:var(--brand-gold)]/50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            {!isLoading &&
              visible.map((c) => {
                return (
                  <article
                    key={c.key}
                    className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-elegant)]"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={getCourseImage(c.category, c.imageUrl)}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent gap-1 rounded-full">
                          <TrendingUp className="h-3 w-3" />
                          {c.tag}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          Online
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-serif font-semibold text-base leading-snug min-h-[3rem] line-clamp-2 transition-colors group-hover:text-primary">
                        {c.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {c.enrolledCount.toLocaleString()} Enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {c.durationHours} hrs
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full border-primary/30 text-primary hover:-translate-y-0.5 transition-transform"
                        >
                          {c.slug ? (
                            <Link to="/courses/$slug" params={{ slug: c.slug }}>
                              Know More
                            </Link>
                          ) : (
                            <Link to="/courses">Know More</Link>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openAdviser(c.title)}
                          className="shine flex-1 rounded-full bg-[image:var(--gradient-primary)] text-white hover:-translate-y-0.5 transition-transform"
                        >
                          Enquire
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
