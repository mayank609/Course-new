import { Star } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const testimonials = [
  {
    name: "Neha Kapoor",
    role: "MIS Executive",
    company: "HDFC Life",
    rating: 5,
    text: "Shubham sir's Excel training completely changed how I work. I went from knowing nothing to confidently building pivot reports for my entire department. Got promoted within 4 months.",
  },
  {
    name: "Rahul Sinha",
    role: "Operations Analyst",
    company: "Infosys",
    rating: 5,
    text: "The way he explains complex topics in simple language is unlike any other trainer. I had failed to learn Excel from 3 other courses. Here I understood everything — and landed my first job.",
  },
  {
    name: "Megha Patil",
    role: "Business Analyst",
    company: "TCS",
    rating: 5,
    text: "The AI module was a revelation. I now use Copilot every single day. The bonus Job Skills section helped me crack 3 interviews back to back. This is genuinely the most practical training I've done.",
  },
  {
    name: "Riya Sharma",
    role: "Team Lead - MIS",
    company: "Sarvpratham Alum",
    rating: 5,
    text: "This course has been a game-changer for me. The content is engaging, informative, and relevant to my career goals. I highly recommend it!",
  },
];

export function Testimonials() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
            Student Stories
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Real Results, Real Transformations
          </h2>
          <p className="mt-2 text-muted-foreground">
            See how our graduates are advancing in their careers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, idx) => (
            <Reveal
              key={t.name}
              delay={idx * 80}
              className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-card)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.role}, <span className="font-semibold text-primary/80">{t.company}</span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
