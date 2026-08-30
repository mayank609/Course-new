import { Sparkles, Star, Play, Award, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { useState, useEffect } from "react";

const companies = [
  { name: "MIQ", logo: "/logos/miq.png" },
  { name: "Siemens", logo: "/logos/siemens.svg" },
  { name: "TCS", logo: "/logos/tcs.svg" },
  { name: "Tech Mahindra", logo: "/logos/tech-mahindra.svg" },
  { name: "Infosys", logo: "/logos/infosys.svg" },
  { name: "Accenture", logo: "/logos/accenture.svg" },
  { name: "Wipro", logo: "/logos/wipro.svg" },
  { name: "Cognizant", logo: "/logos/cognizant.svg" },
  { name: "Capgemini", logo: "/logos/capgemini.svg" },
  { name: "HCLTech", logo: "/logos/hcltech.svg" },
];

export function Hero() {
  const [liveCount, setLiveCount] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(89, Math.max(28, prev + delta));
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-[#f8fafc] py-12 sm:py-16 lg:py-20 relative overflow-hidden border-b border-border/30">
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full bg-purple-600/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 relative">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="space-y-6 text-left">
            <Reveal className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                <Award className="h-3.5 w-3.5" />
                An Elite IIT Alumni & Expert-Led Initiative
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 bg-red-50 border border-red-200/50 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                </span>
                Live · {liveCount} learning
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900 tracking-tight">
                Master MS Office & AI Skills With{" "}
                <span className="inline-block bg-[#f3e8ff] text-[#6b21a8] px-4 py-1.5 rounded-3xl font-extrabold shadow-sm border border-purple-200/40 transform hover:scale-102 transition-transform">
                  Expert
                </span>{" "}
                Mentorship & Internships
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                Advance your career, build real projects, and earn industry-recognized certifications. Learn from corporate experts.
              </p>
            </Reveal>

            {/* Google Stars Rating Row */}
            <Reveal delay={0.25} className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-full py-1.5 px-3">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs font-bold text-slate-700">4.9/5 Google Rating</span>
              </div>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </Reveal>

            {/* CTA Buttons */}
            <Reveal delay={0.3} className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-[#6b21a8] text-white hover:bg-[#581c87] shadow-lg shadow-purple-600/20 px-8 py-6 text-base font-bold transition-all hover:-translate-y-0.5"
              >
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </Reveal>
          </div>

          {/* Right Column: Centered collage with flexbox to prevent overlapping */}
          <Reveal delay={0.2} className="relative w-full h-[380px] min-[360px]:h-[450px] sm:h-[520px] flex items-center justify-center lg:justify-end">
            <div className="relative w-[280px] min-[360px]:w-[320px] min-[400px]:w-[350px] sm:w-[420px] md:w-[460px] h-[300px] min-[360px]:h-[340px] min-[400px]:h-[375px] sm:h-[420px] md:h-[460px] flex gap-3 sm:gap-6 items-center">
              
              {/* Left Card (Student) */}
              <div className="w-1/2 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-lg border-4 border-white bg-white -translate-y-6 sm:-translate-y-8 hover:scale-[1.02] transition-all duration-300 shrink-0">
                <img
                  src="/hero-student-1.webp"
                  alt="Happy student giving a thumbs up while holding course folders"
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              </div>

              {/* Right Card (Student) */}
              <div className="w-1/2 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-lg border-4 border-white bg-white translate-y-6 sm:translate-y-8 hover:scale-[1.02] transition-all duration-300 shrink-0">
                <img
                  src="/hero-student-2.webp"
                  alt="Student smiling with backpack and notebooks"
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              </div>

              {/* Floating Pill Overlays */}
              {/* Lifetime Access */}
              <div className="absolute -top-[5%] left-[2%] bg-white border border-slate-100 shadow-md rounded-2xl py-2 px-3.5 flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform duration-200 z-20">
                <span className="text-[10px] sm:text-xs font-bold text-purple-800 flex items-center gap-1">
                  <span>✨</span> Lifetime Access
                </span>
              </div>

              {/* Instant doubt support */}
              <div className="absolute top-[10%] right-2 sm:-right-[10%] bg-white border border-slate-100 shadow-md rounded-2xl py-2 px-3.5 flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform duration-200 z-20">
                <span className="text-[10px] sm:text-xs font-bold text-amber-700 flex items-center gap-1">
                  <span>💬</span> Instant doubt support
                </span>
              </div>

              {/* Internship Opportunities */}
              <div className="absolute bottom-[20%] -left-[2%] bg-white border border-slate-100 shadow-md rounded-2xl py-2 px-3.5 flex items-center gap-1.5 hover:-translate-y-0.5 transition-transform duration-200 z-20">
                <span className="text-[10px] sm:text-xs font-bold text-[#065f46] flex items-center gap-1">
                  <span>💼</span> Internship Opportunities
                </span>
              </div>

              {/* Google reviews overlay bottom right */}
              <div className="absolute -bottom-[8%] right-[2%] bg-white border border-slate-100 shadow-md rounded-3xl py-2.5 px-4 flex flex-col gap-0.5 z-20 hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Google Reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-800">4.9/5</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>

        {/* Corporate Placement Logos Marquee */}
        <div className="mt-16 rounded-3xl bg-white border border-slate-100 shadow-sm py-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Our Alumni Work at Leading Companies</p>
          <div className="flex w-max marquee-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex items-center gap-12 pr-12 shrink-0"
              >
                {companies.map((c) => (
                  <img
                    key={`${copy}-${c.name}`}
                    src={c.logo}
                    alt={c.name}
                    title={c.name}
                    className="h-6 sm:h-7 w-auto max-w-[110px] object-contain shrink-0 opacity-85 hover:opacity-100 hover:scale-[1.03] transition-all duration-300"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
