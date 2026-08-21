import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { blogPosts } from "@/lib/blogPosts";
import { getBlogImage } from "@/lib/blogImages";

export function Blog() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
              Our Blog
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
              Recent articles & latest posts
            </h2>
          </div>
          <Link to="/blogs" className="group text-sm font-semibold text-primary hover:underline">
            View all posts{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100}>
              <Link to="/blogs/$slug" params={{ slug: p.slug }}>
                <article className="group h-full rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-card)]">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getBlogImage(p.slug)}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                      {p.category}
                    </div>
                    <h3 className="mt-2 font-serif font-semibold leading-snug line-clamp-3 min-h-[4.5rem] transition-colors group-hover:text-[color:var(--brand-gold-foreground)]">
                      {p.title}
                    </h3>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {p.views.toLocaleString()} views · 7 months ago
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
