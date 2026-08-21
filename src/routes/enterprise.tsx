import { createFileRoute } from "@tanstack/react-router";
import { Building2, Shield, Users, Rocket, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LeadForm } from "@/components/site/LeadForm";

const bullets = [
  "Customized corporate learning paths",
  "Live expert-led workshops",
  "Outcome & data driven",
  "Social learning",
  "Enterprise-grade security",
  "Personal account manager",
  "White-label branded portals",
  "Globally accredited body",
];

const stats = [
  { i: Rocket, n: "20+", l: "Trending technologies" },
  { i: Building2, n: "1000+", l: "Companies transformed" },
  { i: Users, n: "200+", l: "Global associations" },
  { i: Shield, n: "100%", l: "Data security" },
];

export const Route = createFileRoute("/enterprise")({
  component: EnterprisePage,
});

function EnterprisePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
                For Corporate
              </p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
                Upskill your teams with Sarvpratham Analytics Enterprise
              </h1>
              <p className="mt-4 text-muted-foreground max-w-lg">
                Give your workforce structured, outcome-driven training that shows up in real
                performance metrics — backed by a dedicated account manager and globally accredited
                certifications.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.l} className="rounded-2xl border border-border bg-card p-4">
                    <s.i className="h-5 w-5 text-primary" />
                    <div className="mt-2 font-serif text-2xl font-bold">{s.n}</div>
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              <ul className="mt-8 grid sm:grid-cols-2 gap-3">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
              <h2 className="font-serif text-xl font-bold">
                Arrange a callback from a senior consultant
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Corporate Enquiry</p>
              <div className="mt-6">
                <LeadForm source="enterprise" showCompany submitLabel="Request a Call Back" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
