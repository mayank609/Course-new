import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getBlogPost } from "@/lib/blogPosts";
import { getBlogImage } from "@/lib/blogImages";

export const Route = createFileRoute("/blogs/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const post = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all posts
          </Link>
          <div className="mt-6 text-xs font-semibold text-primary uppercase tracking-wide">
            {post.category}
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            {post.title}
          </h1>
          <div className="mt-3 text-sm text-muted-foreground">
            {post.views.toLocaleString()} views
          </div>
          <img
            src={getBlogImage(post.slug)}
            alt={post.title}
            className="mt-8 aspect-video w-full rounded-2xl object-cover"
          />
          <div className="mt-8 space-y-5 text-foreground/90 leading-relaxed">
            {post.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
