import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BootcampLandingPage } from "@/components/site/BootcampLandingPage";
import { getBootcamp } from "@/lib/bootcamps";

export const Route = createFileRoute("/interview-prep/$slug")({
  component: BootcampPage,
});

function BootcampPage() {
  const { slug } = Route.useParams();
  const bootcamp = getBootcamp(slug);

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn't find this bootcamp. It may have been removed —{" "}
            <Link to="/interview-prep" className="text-primary underline">
              browse all bootcamp programs
            </Link>
            .
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <BootcampLandingPage
      eyebrow={bootcamp.eyebrow}
      title={bootcamp.title}
      description={bootcamp.description}
      highlights={bootcamp.highlights}
      roadmap={bootcamp.roadmap}
      formHeading={bootcamp.formHeading}
      formSubheading={bootcamp.formSubheading}
    />
  );
}
