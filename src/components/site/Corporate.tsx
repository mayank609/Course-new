import { Building2, Shield, Users, Rocket, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
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

export function Corporate() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
            For Corporate
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
            Why corporates prefer Sarvpratham Analytics to upskill their teams
          </h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { i: Rocket, n: "20+", l: "Trending technologies" },
              { i: Building2, n: "1000+", l: "Companies transformed" },
              { i: Users, n: "200+", l: "Global associations" },
              { i: Rocket, n: "20+", l: "Efficiency increase" },
              { i: Shield, n: "100%", l: "Data security" },
            ].map((s) => (
              <div
                key={s.l}
                className="group rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-card)]"
              >
                <s.i className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="mt-2 font-serif text-2xl font-bold">{s.n}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal
          delay={140}
          className="rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elegant)]"
        >
          <h3 className="font-serif text-xl font-bold">
            Arrange a callback from a senior consultant
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Corporate Enquiry</p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-sm transition-colors hover:text-primary"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <LeadForm
              source="corporate"
              showCompany
              showMessage={false}
              submitLabel="Request a Call Back"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
