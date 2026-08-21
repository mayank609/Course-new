import { Award, TrendingUp, Infinity as InfIcon, Headphones } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const services = [
  {
    i: Award,
    t: "Global Certification Portfolio",
    d: "Choose the certification program that fits your career path.",
  },
  {
    i: TrendingUp,
    t: "Career Acceleration Services",
    d: "Expert guidance to grow faster in your profession.",
  },
  { i: InfIcon, t: "Perpetual Learning Access", d: "E-Learning, community and platform, forever." },
  { i: Headphones, t: "Round-the-Clock Assistance", d: "Connect with us for immediate help." },
];

export function Services() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-[oklch(0.975_0.008_90)]">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="text-[color:var(--brand-gold-foreground)] uppercase tracking-[0.2em] text-xs font-semibold">
            Our Services
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold">
            Accelerate your career with our expert services
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.t} delay={i * 100}>
              <div className="group h-full rounded-2xl bg-white p-6 border border-border transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:shadow-[var(--shadow-elegant)]">
                <div className="h-12 w-12 rounded-2xl bg-[image:var(--gradient-primary)] ring-1 ring-[color:var(--brand-gold)]/30 grid place-items-center text-[color:var(--brand-gold)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <s.i className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
