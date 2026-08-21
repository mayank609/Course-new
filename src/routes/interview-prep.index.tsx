import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Users2, FileCheck, MessageSquare, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeadForm } from "@/components/site/LeadForm";
import { bootcamps } from "@/lib/bootcamps";

const roadmap = [
  {
    i: FileCheck,
    t: "Resume & profile review",
    d: "Tailored feedback to get you shortlisted at top companies.",
  },
  {
    i: Target,
    t: "Role-specific mock practice",
    d: "Practice real scenario-based rounds with expert feedback.",
  },
  {
    i: MessageSquare,
    t: "Behavioral & technical coaching",
    d: "Sharpen your answers for both soft-skill and domain questions.",
  },
  {
    i: Users2,
    t: "1:1 career mentorship",
    d: "Ongoing guidance from professionals who've done the hiring.",
  },
];

export const Route = createFileRoute("/interview-prep/")({
  component: InterviewPrepPage,
});

function InterviewPrepPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="px-4 py-16 sm:py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
              BootCamps
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
              Train hard, walk in ready to win
            </h1>
            <p className="mt-4 text-muted-foreground">
              Hands-on training, mock practice rounds, resume reviews, and a step-by-step roadmap
              built by people who've hired for the roles you're targeting.
            </p>
          </div>
        </section>

        <section className="px-4 py-4">
          <div className="mx-auto max-w-7xl grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roadmap.map((r) => (
              <div key={r.t} className="rounded-2xl border border-border bg-card p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <r.i className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{r.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
                Role-Specific Bootcamps
              </p>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold">
                Pick the bootcamp built for your next role
              </h2>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bootcamps.map((b) => (
                <Link
                  key={b.slug}
                  to="/interview-prep/$slug"
                  params={{ slug: b.slug }}
                  className="group h-full rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-elegant)]"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif font-semibold leading-snug transition-colors group-hover:text-primary">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Explore bootcamp{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
            <h2 className="font-serif text-xl font-bold text-center">
              Get a free BootCamp session
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Tell us where you're headed and we'll match you with the right coach.
            </p>
            <div className="mt-6">
              <LeadForm source="interview-prep" submitLabel="Book My Free Session" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
