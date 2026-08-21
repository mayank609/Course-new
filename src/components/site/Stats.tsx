import { Reveal } from "@/components/site/Reveal";
import { CountUp } from "@/components/site/CountUp";

const stats = [
  { value: 4000, decimals: 0, suffix: "+", l: "Students Trained" },
  { value: 12, decimals: 0, suffix: "+ Yrs", l: "Experience" },
  { value: 140, decimals: 0, suffix: "+", l: "Video Lessons" },
  { value: 100, decimals: 0, suffix: "+ Hrs", l: "Content" },
];

export function Stats() {
  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[image:var(--gradient-hero)] border border-[color:var(--brand-gold)]/20 p-8 sm:p-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 100} className="group cursor-default">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
              <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground font-medium">{s.l}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
