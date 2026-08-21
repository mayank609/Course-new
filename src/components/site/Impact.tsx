import { Reveal } from "@/components/site/Reveal";

const items = [
  {
    title: "4,000+ Career Transformations",
    desc: "Join a network of professionals who advanced careers with Sarvpratham Analytics.",
  },
  {
    title: "Alumni at Top Fortune Companies",
    desc: "Sarvpratham Analytics trained professionals are in demand across top employers.",
  },
  {
    title: "Average Salary Increase of 35%",
    desc: "Certified professionals unlock new opportunities and salary hikes.",
  },
  {
    title: "22% Boost in Workplace Performance",
    desc: "Proven productivity increase for certified professionals.",
  },
];

export function Impact() {
  return (
    <section className="relative px-4 py-16 sm:py-20 bg-[color:var(--brand-dark)] text-white overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[color:var(--brand-gold)]/10 blur-3xl animate-float-slow" />
      <div className="mx-auto max-w-7xl relative">
        <Reveal>
          <p className="text-[color:var(--brand-gold)] uppercase tracking-[0.2em] text-xs font-semibold">
            Highest Satisfaction
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold max-w-3xl">
            Transforming Careers, Empowering Organizations
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 100}>
              <div className="group h-full rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/40 hover:bg-white/10">
                <div className="font-serif font-semibold leading-snug transition-colors group-hover:text-[color:var(--brand-gold)]">
                  {it.title}
                </div>
                <p className="mt-2 text-sm text-white/70">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
