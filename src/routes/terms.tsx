import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

const sections = [
  {
    h: "Using our services",
    p: "By accessing Sarvpratham Analytics' website or enrolling in a course, you agree to use the platform only for lawful purposes and in accordance with these terms. You're responsible for keeping your account credentials secure.",
  },
  {
    h: "Course access & content",
    p: "Enrolling in a course grants you a personal, non-transferable license to access that content for your own learning. Course materials, videos, and assessments may not be redistributed, resold, or shared outside your account.",
  },
  {
    h: "Payments",
    p: "Prices for courses and enterprise packages are listed at checkout in the currency shown. Payments are processed securely through our payment partners; we do not store your full card details.",
  },
  {
    h: "Certifications",
    p: "Certificates of completion are issued once you meet the course's completion requirements. Certification bodies referenced on this site set their own eligibility and exam requirements, which are separate from Sarvpratham Analytics' training programs.",
  },
  {
    h: "Intellectual property",
    p: "All course content, branding, and site materials are the property of Sarvpratham Analytics or its licensors and are protected by applicable intellectual property laws.",
  },
  {
    h: "Limitation of liability",
    p: "Sarvpratham Analytics provides training and career-preparation resources in good faith but does not guarantee specific employment, salary, or exam outcomes. Our liability is limited to the amount paid for the relevant service.",
  },
  {
    h: "Changes to these terms",
    p: "We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.",
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
            Legal
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: July 2026</p>
          <p className="mt-6 text-muted-foreground">
            These terms govern your use of the Sarvpratham Analytics website, courses, and enterprise
            services. Please read them carefully before enrolling.
          </p>
          <div className="mt-10 space-y-8">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-serif text-xl font-bold">{s.h}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-muted-foreground">
            Questions about these terms? Reach out via our{" "}
            <a href="/contact" className="text-primary underline">
              contact page
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
