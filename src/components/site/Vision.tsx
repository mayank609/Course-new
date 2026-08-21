import { Award, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { Link } from "@tanstack/react-router";

export function Vision() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-[oklch(0.975_0.008_90)]">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
            Meet Your Instructor
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Shubham Verma <span className="text-primary font-sans text-lg block sm:inline font-medium text-muted-foreground sm:ml-2">— Microsoft Certified Trainer</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Shubham brings over a decade of real-world industry experience, helping professionals leverage Microsoft Office tools combined with cutting-edge AI (ChatGPT, Copilot) for automation, dynamic data analysis, and dashboard creation. His practical, task-focused teaching style simplifies complex workflows and makes you instantly job-ready.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Award,
                title: "Microsoft Certified",
                desc: "Expert-led training modules",
              },
              { 
                icon: Sparkles, 
                title: "AI Integration Specialist", 
                desc: "Learn ChatGPT & Copilot for productivity" 
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl bg-white p-5 border border-border shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-gold)]/40"
              >
                <f.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                <div className="mt-3 font-bold text-sm sm:text-base">{f.title}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
        
        <Reveal
          delay={140}
          className="relative rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-elegant)] grid sm:grid-cols-[1fr_1.2fr] gap-6 bg-card p-6"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src="/instructor.jpeg" alt="Shubham Verma" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-between py-1">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Learn From The Best
              </h3>
              <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                Get practical knowledge directly from an industry veteran. Our classes focus on live case studies, assignments, and real-life tasks.
              </p>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-primary/5 p-2 border border-primary/10">
                  <div className="font-serif text-lg font-bold text-primary">4,000+</div>
                  <div className="text-[10px] text-muted-foreground">Students Trained</div>
                </div>
                <div className="rounded-xl bg-primary/5 p-2 border border-primary/10">
                  <div className="font-serif text-lg font-bold text-primary">100+ Hrs</div>
                  <div className="text-[10px] text-muted-foreground">Actionable Training</div>
                </div>
              </div>
              
              <Button
                asChild
                size="sm"
                className="w-full rounded-full font-semibold"
              >
                <Link to="/about">More About Shubham</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
