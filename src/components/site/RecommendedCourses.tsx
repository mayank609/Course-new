import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getCourseImage } from "@/lib/courseImages";
import { getCoursePricing } from "@/lib/coursePricing";
import { trackCartEvent } from "@/lib/cartTracking";
import { trackMetaEvent } from "@/components/site/MetaPixel";
import { ShoppingCart, Sparkles } from "lucide-react";
import type { Course } from "@/lib/api";

// Amazon/Flipkart-style upsell rail: a horizontal-scroll row on every screen
// size (grid on sm+ via CSS, but still swipeable by touch on mobile) so it
// reads as one noticeable section instead of a small checkbox list.
export function RecommendedCourses({
  courses,
  heading = "You May Also Like",
}: {
  courses: Course[];
  heading?: string;
}) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold">{heading}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {courses.map((c) => {
          const pricing = getCoursePricing(c.price, c.originalPrice);
          return (
            <div
              key={c.slug}
              className="shrink-0 w-[260px] sm:w-auto snap-start bg-card border border-border rounded-2xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col"
            >
              <Link to={`/courses/${c.slug}`} className="block aspect-video overflow-hidden">
                <img
                  src={getCourseImage(c.category, c.imageUrl)}
                  alt={c.title}
                  className="h-full w-full object-cover object-top hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 flex flex-col flex-grow gap-2">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{c.category}</span>
                <Link to={`/courses/${c.slug}`}>
                  <h3 className="font-serif text-sm font-bold leading-snug line-clamp-2 hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                </Link>
                {c.shortDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.shortDescription}</p>
                )}
                <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                  <span className="text-lg font-extrabold text-primary">₹{pricing.price.toLocaleString()}</span>
                  {pricing.hasDiscount && (
                    <>
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{pricing.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {pricing.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-auto pt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 rounded-full text-xs">
                    <Link to={`/courses/${c.slug}`}>View Course</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 rounded-full text-xs">
                    <Link
                      to={`/checkout/${c.slug}`}
                      onClick={() => {
                        trackMetaEvent("AddToCart", {
                          content_name: c.title,
                          content_category: c.category,
                          content_ids: [c._id],
                          content_type: "product",
                          value: c.price,
                          currency: "INR",
                        });
                        trackCartEvent("add_to_cart", { courseSlug: c.slug, courseTitle: c.title, amount: c.price });
                      }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
