import { Sparkles, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";

const companies = [
  "MIQ",
  "SIEMENS",
  "TCS",
  "Tech Mahindra",
  "Infosys",
  "Accenture",
  "Wipro",
  "Cognizant",
  "Capgemini",
  "HCLTech",
];

export function Hero() {
  return (
    <section className="px-4 pt-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[image:var(--gradient-hero)] px-6 sm:px-10 py-10 lg:py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl animate-float" />
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal className="min-w-0">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <Sparkles className="h-4 w-4 text-[color:var(--brand-gold-foreground)] animate-float-sm" />
              Build Job-Ready MS Office & AI Skills
            </div>
            <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-[color:var(--brand-dark)]">
              Learn MS Office + AI from Experts & Become Job-Ready.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              A complete learning ecosystem — Excel Basic to Advanced, Word, PowerPoint, AI with ChatGPT & Copilot, and Career Skills. Built for freshers, job seekers, and working professionals by Shubham Verma.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="shine rounded-full bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Link to="/courses">Explore Courses</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-[color:var(--brand-gold)]/50 text-[color:var(--brand-gold-foreground)] hover:bg-[color:var(--brand-gold)]/10 hover:-translate-y-0.5 transition-all"
              >
                <Link to="/about">About Shubham</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white bg-[image:var(--gradient-primary)] transition-transform hover:-translate-y-1 hover:scale-110 hover:z-10"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 text-[color:var(--brand-gold)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="text-muted-foreground">
                  Trusted by over <b className="text-foreground">4,000+</b> Students
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-white/70 border border-white shadow-[var(--shadow-card)] py-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max marquee-track">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="flex items-center gap-10 pr-10 text-sm font-bold text-muted-foreground/70 shrink-0"
                  >
                    {companies.map((c) => (
                      <span
                        key={`${copy}-${c}`}
                        className="whitespace-nowrap transition-colors hover:text-[color:var(--brand-gold-foreground)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-primary/20 blur-2xl animate-float-sm" />
            <div className="absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-[color:var(--brand-gold)]/30 blur-2xl animate-float" />
            <img
              src="/instructor.jpeg"
              alt="Shubham Verma — Trainer"
              width={1024}
              height={1024}
              className="relative w-full h-auto rounded-[32px] shadow-[var(--shadow-elegant)] object-cover aspect-square ring-4 ring-white/50 animate-float transition-transform duration-500 hover:scale-[1.02]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
