import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, type LucideIcon } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/site/LeadForm";
import { useAdviserModal } from "@/components/site/AdviserModal";

export type BootcampRoadmapStep = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function BootcampLandingPage({
  eyebrow,
  title,
  description,
  highlights,
  roadmap,
  formHeading,
  formSubheading,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  roadmap: BootcampRoadmapStep[];
  formHeading: string;
  formSubheading: string;
}) {
  const { open: openAdviser } = useAdviserModal();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="px-4 py-16 sm:py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/interview-prep"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All BootCamp programs
            </Link>
            <p className="mt-4 text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">{title}</h1>
            <p className="mt-4 text-muted-foreground">{description}</p>
            <Button
              onClick={() => openAdviser(title)}
              className="shine mt-6 rounded-full bg-[image:var(--gradient-primary)] text-white hover:-translate-y-0.5 transition-transform"
            >
              Talk to an adviser
            </Button>
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="mx-auto max-w-7xl grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{r.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {highlights.length > 0 && (
          <section className="px-4 py-14">
            <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 sm:p-10">
              <h2 className="font-serif text-xl font-bold text-center">
                What's included in this bootcamp
              </h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-bold text-center">{formHeading}</h2>
            <p className="mt-1 text-sm text-muted-foreground text-center">{formSubheading}</p>
            <div className="mt-6">
              <LeadForm
                source="interview-prep"
                courseTitle={title}
                submitLabel="Book My Free Session"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
