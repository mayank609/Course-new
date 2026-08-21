import { createFileRoute } from "@tanstack/react-router";
import { Award, User, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CountUp } from "@/components/site/CountUp";

const stats = [
  { value: 4000, decimals: 0, suffix: "+", l: "Students Trained" },
  { value: 12, decimals: 0, suffix: "+ Yrs", l: "Experience" },
  { value: 140, decimals: 0, suffix: "+", l: "Video Lessons" },
  { value: 100, decimals: 0, suffix: "+ Hrs", l: "Content" },
];

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="px-4 py-16 sm:py-20 bg-[oklch(0.975_0.008_90)]">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
                About Sarvpratham Analytics
              </p>
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Empowering learners with <span className="text-primary">Job-Ready Skills</span>
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Sarvpratham Analytics was founded by Shubham Verma, a Microsoft Certified Trainer with over a decade of industry expertise. We focus on bridging the gap between theoretical knowledge and practical, real-world execution. Our courses are built around live case studies, assignments, and practical challenges so that you are fully prepared for the workplace.
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Award,
                    title: "Microsoft Certified",
                    desc: "Industry-standard curriculum",
                  },
                  {
                    icon: Sparkles,
                    title: "Practical AI Training",
                    desc: "Leverage ChatGPT & Copilot for speed",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl bg-white p-5 border border-border shadow-[var(--shadow-card)]"
                  >
                    <f.icon className="h-6 w-6 text-primary" />
                    <div className="mt-3 font-bold text-sm sm:text-base">{f.title}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Instructor Photo and Card */}
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-elegant)] bg-card grid sm:grid-cols-[1.1fr_1fr] gap-6 p-6">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img src="/instructor.jpeg" alt="Shubham Verma" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-between py-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Our Mission</h2>
                  <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
                    To make world-class, career-relevant training in Microsoft Excel, PowerPoint, Word, and AI tools accessible and affordable to every student and professional, helping them save time, automate repetitive work, and advance in their careers.
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary">
                  — Shubham Verma, Founder
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Counter Stats Section */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-7xl rounded-3xl bg-[image:var(--gradient-hero)] border border-[color:var(--brand-gold)]/20 p-8 sm:p-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="font-serif text-3xl sm:text-4xl font-bold text-primary">
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground font-medium">{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
