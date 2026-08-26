import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { CoursesSection } from "@/components/site/CoursesSection";
import { Vision } from "@/components/site/Vision";
import { CertificateSection } from "@/components/site/CertificateSection";
import { Stats } from "@/components/site/Stats";
import { Testimonials } from "@/components/site/Testimonials";
import { Faq } from "@/components/site/Faq";
import { CommunityCTA } from "@/components/site/CommunityCTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Stats />
        <CoursesSection />
        <Vision />
        <CertificateSection />
        <Testimonials />
        <Faq />
        <CommunityCTA />
      </main>
      <Footer />
    </div>
  );
}
