import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { blogPosts } from "@/lib/blogPosts";
import { getBlogImage } from "@/lib/blogImages";

export const Route = createFileRoute("/blogs/")({
  component: BlogsPage,
});

function BlogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
              Our Blog
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
              Recent articles & latest posts
            </h1>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((p) => (
              <Link key={p.slug} to="/blogs/$slug" params={{ slug: p.slug }}>
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
                    <h2 className="mt-2 font-serif font-semibold leading-snug line-clamp-3 min-h-[4.5rem] transition-colors group-hover:text-[color:var(--brand-gold-foreground)]">
                      {p.title}
                    </h2>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {p.views.toLocaleString()} views
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
