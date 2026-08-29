import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users, TrendingUp, Search, Award, Flame, Sparkles } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdviserModal } from "@/components/site/AdviserModal";
import { fetchCourses, fetchCategories } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { sampleCourses } from "@/lib/sampleCourses";
import { toDisplayCourses, sampleToDisplayCourses } from "@/lib/displayCourse";

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

export const Route = createFileRoute("/courses/")({
  validateSearch: z.object({ category: z.string().optional() }),
  component: CoursesPage,
});

function CoursesPage() {
  const { open: openAdviser } = useAdviserModal();
  const { category: initialCategory } = Route.useSearch();
  const [category, setCategory] = useState<string | null>(initialCategory ?? null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCategory(initialCategory ?? null);
  }, [initialCategory]);

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
  
  let visible = category ? source.filter((c) => c.category === category) : source;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    visible = visible.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q))
    );
  }

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

          <div className="mt-8 mx-auto max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses or syllabus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-full border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all text-foreground"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
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
                    className="relative group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-elegant)]"
                  >
                    {c.slug ? (
                      <Link
                        to="/courses/$slug"
                        params={{ slug: c.slug }}
                        className="absolute inset-0 z-10 cursor-pointer"
                        aria-label={`View details of ${c.title}`}
                      />
                    ) : (
                      <Link
                        to="/courses"
                        className="absolute inset-0 z-10 cursor-pointer"
                        aria-label="View courses"
                      />
                    )}
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={getCourseImage(c.category, c.imageUrl)}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const badgeData = getTagBadge(c.tag);
                          return (
                            <Badge className={`${badgeData.className} gap-1 rounded-full border shadow-none`}>
                              {badgeData.icon}
                              {c.tag}
                            </Badge>
                          );
                        })()}
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
                      <div className="mt-4 flex gap-2 relative z-20">
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
                          asChild
                          size="sm"
                          className="shine flex-1 rounded-full bg-[image:var(--gradient-primary)] text-white hover:-translate-y-0.5 transition-transform text-xs"
                        >
                          <Link to={c.slug ? `/checkout/${c.slug}` : "/courses"}>
                            Add to Cart
                          </Link>
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
