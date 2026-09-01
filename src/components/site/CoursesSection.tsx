import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Users, Flame, Award, TrendingUp, Sparkles, BookOpen, Laptop, Code2, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { fetchCourses, fetchCategories } from "@/lib/api";
import { sampleCourses } from "@/lib/sampleCourses";
import { toDisplayCourses, sampleToDisplayCourses } from "@/lib/displayCourse";
import { trackMetaEvent } from "@/components/site/MetaPixel";
import { toDirectImageUrl } from "@/lib/imageUrl";

function getDefaultCourseIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("excel")) return "/excel-3d-icon.jpg";
  if (t.includes("word") || t.includes("document")) return "/word-3d-icon.jpg";
  if (t.includes("powerpoint") || t.includes("ppt") || t.includes("presentation")) return "/powerpoint-3d-icon.jpg";
  return "/ai-3d-icon.jpg";
}

function getCourseCardMedia(title: string, imageUrl?: string) {
  const customImage = toDirectImageUrl(imageUrl);

  if (customImage) {
    return (
      <div className="w-full aspect-video overflow-hidden relative z-0">
        <img
          src={customImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="my-6 flex items-center justify-center relative z-20">
      <div className="relative group/icon h-24 w-24 rounded-3xl overflow-hidden shadow-lg border border-slate-100/50 bg-white transition-transform duration-300 group-hover:scale-105">
        <img src={getDefaultCourseIcon(title)} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export function getTagBadge(tag: string) {
  const t = tag.toLowerCase().replace(/[^a-z0-9]+/g, "");
  switch (t) {
    case "bestseller":
      return {
        className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/30",
        icon: <Award className="h-3 w-3 text-amber-600" />,
      };
    case "trending":
      return {
        className: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 border-rose-500/30",
        icon: <TrendingUp className="h-3 w-3 text-rose-600" />,
      };
    case "popular":
      return {
        className: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30",
        icon: <Flame className="h-3 w-3 text-emerald-600" />,
      };
    default:
      return {
        className: "bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 border-indigo-500/30",
        icon: <Sparkles className="h-3 w-3 text-indigo-600" />,
      };
  }
}

export function CoursesSection() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      sliderRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (search.trim()) {
      const handler = setTimeout(() => {
        trackMetaEvent("Search", {
          search_string: search.trim(),
        });
      }, 800);
      return () => clearTimeout(handler);
    }
  }, [search]);

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

  const filtered = source.filter((c) => {
    const matchesCategory = category ? c.category === category : true;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="courses" className="px-4 py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl">
        
        {/* Title Header */}
        <Reveal className="text-center">
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
            Courses Created by Industry Experts
          </h2>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">
            Explore elite self-paced training programs with direct doubt resolution and structured learning.
          </p>
        </Reveal>

        {/* Search Input Bar */}
        <Reveal delay={50} className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. MS Excel, PowerPoint, AI"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-full pl-6 pr-12 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-slate-800 placeholder-slate-400"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#6b21a8] text-white">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </Reveal>

        {/* Category Filters Bar */}
        {categories.length > 0 && (
          <Reveal delay={80} className="mt-8 flex flex-wrap gap-2 justify-center pb-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold border transition-all ${
                !category
                  ? "bg-[#6b21a8] text-white border-transparent shadow-md shadow-purple-600/10"
                  : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold border transition-all ${
                  category === c
                    ? "bg-[#6b21a8] text-white border-transparent shadow-md shadow-purple-600/10"
                    : "bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:text-purple-700"
                }`}
              >
                {c}
              </button>
            ))}
          </Reveal>
        )}

        {/* Courses Cards Slider */}
        <div className="relative group/slider mt-10">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-md flex items-center justify-center text-slate-600 hover:text-[#6b21a8] hover:border-purple-300 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Slider Scroll Track */}
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 pr-4 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-96 shrink-0 snap-start w-[290px] sm:w-[325px] lg:w-[calc(25%-18px)] rounded-[32px]" />
              ))}
            {!isLoading &&
              filtered.map((c, i) => {
                const media = getCourseCardMedia(c.title, c.imageUrl);
                return (
                  <Reveal key={c.key} delay={(i % 4) * 90} className="shrink-0 snap-start w-[290px] sm:w-[325px] lg:w-[calc(25%-18px)] flex flex-col">
                    <article className="relative group h-full overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 flex flex-col items-center text-center">

                      {/* Floating redirect click zone */}
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

                      {/* Course thumbnail: full-width banner if a real image was uploaded, small 3D icon otherwise */}
                      {media}

                      <div className="w-full space-y-3 flex-grow flex flex-col px-6 pb-6 pt-5">
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          {c.tag && (
                            <Badge className={`${getTagBadge(c.tag).className} gap-1 rounded-full border shadow-none font-bold text-[10px] uppercase`}>
                              {getTagBadge(c.tag).icon}
                              {c.tag}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="rounded-full font-bold text-[10px] uppercase tracking-wider text-slate-500 bg-slate-100 border-none">
                            Online
                          </Badge>
                        </div>

                        <h3 className="font-sans font-extrabold text-[#1e1b4b] text-base leading-snug min-h-[2.8rem] line-clamp-2 transition-colors group-hover:text-[#6b21a8]">
                          {c.title}
                        </h3>

                        {/* Course Metadata Stats */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {Math.max(50, c.enrolledCount || 0).toLocaleString()} Learners
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {c.durationHours || 0} hrs
                          </span>
                        </div>

                        {/* Action trigger footer */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto w-full relative z-20 gap-3">
                          <div className="text-left shrink-0">
                            <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Price</span>
                            <span className="text-lg font-extrabold text-[#6b21a8]">
                              ₹{(c.price || 499).toLocaleString()}
                            </span>
                          </div>
                          
                          <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-[#6b21a8] text-white hover:bg-[#581c87] shadow-md shadow-purple-600/10 font-bold px-4 py-2.5 text-xs transition-transform hover:-translate-y-0.5"
                          >
                            <Link 
                              to={c.slug ? `/checkout/${c.slug}` : "/courses"}
                              onClick={() => {
                                if (c.slug) {
                                  trackMetaEvent("AddToCart", {
                                    content_name: c.title,
                                    content_category: c.category,
                                    content_ids: [c.key],
                                    content_type: "product",
                                    value: c.price || 499,
                                    currency: "INR",
                                  });
                                }
                              }}
                            >
                              Add to Cart
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-md flex items-center justify-center text-slate-600 hover:text-[#6b21a8] hover:border-purple-300 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
