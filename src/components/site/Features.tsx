import {
  Route,
  GraduationCap,
  Wrench,
  Layers,
  Headphones,
  Compass,
  Users,
  BadgeDollarSign,
  Infinity as InfIcon,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const feats = [
  { icon: Route, title: "Personalized learning path", desc: "Tailored courses for your goals" },
  {
    icon: GraduationCap,
    title: "Industry expert trainers",
    desc: "Learn from real-world professionals",
  },
  { icon: Wrench, title: "Hands-on, practical learning", desc: "Real projects, real experience" },
  { icon: Layers, title: "Flexible & bite-sized content", desc: "Learn anytime, anywhere, easily" },
  { icon: Headphones, title: "24/7 Support", desc: "Guidance whenever you need it" },
  { icon: Compass, title: "Career Coaching", desc: "Personalized career growth plans" },
  { icon: Users, title: "Community Access", desc: "Connect, collaborate & grow" },
  { icon: BadgeDollarSign, title: "Transparent pricing", desc: "Clear, budget-friendly plans" },
  { icon: InfIcon, title: "Lifetime Access", desc: "Learn once, access forever" },
];

export function Features() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">Our Best Features</h2>
          <p className="mt-3 text-muted-foreground">
            From personalized learning paths to lifetime access, explore features designed to
            empower your growth — anytime, anywhere.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--brand-gold)]/50 hover:shadow-[var(--shadow-card)]">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center text-primary transition-all duration-300 group-hover:bg-[image:var(--gradient-primary)] group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
