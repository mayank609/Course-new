import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, TrendingUp, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { useAdviserModal } from "@/components/site/AdviserModal";
import { fetchCourses, fetchCategories } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { sampleCourses } from "@/lib/sampleCourses";
import { toDisplayCourses, sampleToDisplayCourses } from "@/lib/displayCourse";

export function CoursesSection() {
  const { open: openAdviser } = useAdviserModal();
  const [category, setCategory] = useState<string | null>(null);
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const source =
    courses && courses.length > 0
      ? toDisplayCourses(courses)
      : sampleToDisplayCourses(sampleCourses);

  const categoriesFromCourses = source.map((c) => c.category);
  const categoriesFromDb = dbCategories ? dbCategories.map((cat) => cat.name) : [];
  const categories = Array.from(new Set([...categoriesFromDb, ...categoriesFromCourses]));
  const visible = (category ? source.filter((c) => c.category === category) : source).slice(0, 8);

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
            Curated For You
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Our Featured Training Programs
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore our expert-led Microsoft Office and AI courses designed to accelerate your career.
          </p>
        </Reveal>

        {categories.length > 0 && (
          <Reveal delay={80} className="mt-8 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategory(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all hover:-translate-y-0.5 ${!category ? "bg-[image:var(--gradient-primary)] text-white border-transparent shadow-[var(--shadow-card)]" : "bg-white text-foreground border-border hover:border-[color:var(--brand-gold)]/50 hover:shadow-[var(--shadow-card)]"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all hover:-translate-y-0.5 ${category === c ? "bg-[image:var(--gradient-primary)] text-white border-transparent shadow-[var(--shadow-card)]" : "bg-white text-foreground border-border hover:border-[color:var(--brand-gold)]/50 hover:shadow-[var(--shadow-card)]"}`}
              >
                {c}
              </button>
            ))}
          </Reveal>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          {!isLoading &&
            visible.map((c, i) => {
              return (
                <Reveal key={c.key} delay={(i % 4) * 90}>
                  <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={getCourseImage(c.category, c.imageUrl)}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent gap-1 rounded-full transition-transform group-hover:scale-105">
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
                          {Math.max(50, c.enrolledCount).toLocaleString()} Enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {c.durationHours} hrs
                        </span>
                      </div>
                      
                      {/* Pricing Info */}
                      <div className="mt-3.5 font-serif text-lg font-bold text-primary">
                        {c.price > 0 ? `₹${c.price}` : "Free"}
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full border-primary/30 text-primary hover:-translate-y-0.5 transition-transform text-xs"
                        >
                          {c.slug ? (
                            <Link to="/courses/$slug" params={{ slug: c.slug }}>
                              Details
                            </Link>
                          ) : (
                            <Link to="/courses">Details</Link>
                          )}
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="shine flex-1 rounded-full bg-[image:var(--gradient-primary)] text-white hover:-translate-y-0.5 transition-transform text-xs"
                        >
                          <Link to={c.slug ? `/checkout/${c.slug}` : "/courses"}>
                            Buy Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group rounded-full gap-2 border-primary/30 text-primary hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] transition-all"
          >
            <Link to="/courses">
              View all courses{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
