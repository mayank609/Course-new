import { Sparkles, Star, ChevronLeft, ChevronRight, Award, TrendingUp, CheckCircle } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liveCount, setLiveCount] = useState(42);

  const slides = [
    {
      badge: "Build Corporate Analytics Skills",
      title: "Learn MS Office + AI from Experts & Become Job-Ready.",
      description: "A complete learning ecosystem — Excel Basic to Advanced, Word, PowerPoint, AI with ChatGPT & Copilot, and Career Skills. Built for freshers, job seekers, and working professionals by Shubham Verma.",
      image: "/instructor.jpeg",
      primaryCta: { label: "Explore Courses", to: "/courses" },
      secondaryCta: { label: "About Shubham", to: "/about" },
      imageType: "trainer"
    },
    {
      badge: "Direct Career Guidance",
      title: "Unlock Top Corporate Jobs & Career Advancements.",
      description: "Join over 4,000+ students who have successfully upskilled. Get 1-on-1 mock interviews, personalized resume evaluations, and direct access to 300+ hiring partners with an average salary hike of 57%.",
      image: "",
      primaryCta: { label: "Join Placements", to: "/courses" },
      secondaryCta: { label: "Trainer Bio", to: "/about" },
      imageType: "stats",
      stats: [
        { val: "57%", label: "Average Salary Hike" },
        { val: "300+", label: "Hiring Partners" },
        { val: "1-on-1", label: "Mock Interviews" }
      ]
    },
    {
      badge: "Industry Accredited Program",
      title: "Earn Prestigious Dual Certificates & Credentials.",
      description: "Validate your newly acquired Microsoft Office and AI automation skills. Showcase your verified completion badge directly on your LinkedIn profile and attract leading corporate recruiters.",
      image: "/Cert1.webp",
      primaryCta: { label: "Get Certified", to: "/courses" },
      secondaryCta: { label: "View Courses", to: "/courses" },
      imageType: "certificate"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    <section className="px-4 pt-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[image:var(--gradient-hero)] px-6 sm:px-10 py-10 lg:py-16 relative overflow-hidden">
        {/* Glow ornaments */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl" />
        
        {/* Carousel slide content viewport */}
        <div className="relative grid">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={idx}
                className={`col-start-1 row-start-1 w-full grid lg:grid-cols-2 gap-10 items-center transition-all duration-700 ease-in-out ${
                  isActive ? "opacity-100 scale-100 translate-x-0 pointer-events-auto z-10" : "opacity-0 scale-95 translate-x-12 pointer-events-none z-0"
                }`}
              >
                {/* Left Side: Content */}
                <div className="space-y-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary/95 bg-primary/5 border border-primary/10 px-3.5 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-[color:var(--brand-gold-foreground)]" />
                      {slide.badge}
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
                      </span>
                      Live · {liveCount} students online
                    </div>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-[color:var(--brand-dark)]">
                    {slide.title}
                  </h1>
                  
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="shine rounded-full bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 hover:shadow-xl transition-all"
                    >
                      <Link to={slide.primaryCta.to as "/"}>{slide.primaryCta.label}</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-[color:var(--brand-gold)]/50 text-[color:var(--brand-gold-foreground)] hover:bg-[color:var(--brand-gold)]/10 hover:-translate-y-0.5 transition-all"
                    >
                      <Link to={slide.secondaryCta.to as "/"}>{slide.secondaryCta.label}</Link>
                    </Button>
                  </div>
                </div>

                {/* Right Side: Graphic/Image */}
                <div className="relative flex justify-center items-center">
                  
                  {/* Trainer Image */}
                  {slide.imageType === "trainer" && (
                    <div className="relative group max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-300 hover:scale-[1.02]">
                      <img
                        src="/instructor.jpeg"
                        alt="Shubham Verma — Trainer"
                        className="w-full h-auto object-cover aspect-[4/5]"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                        <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">Lead Instructor</p>
                        <h4 className="font-serif text-lg font-bold">Shubham Verma</h4>
                        <p className="text-xs text-white/80">Corporate MS Office & AI Automations Coach</p>
                      </div>
                    </div>
                  )}

                  {/* Certificate Mockup */}
                  {slide.imageType === "certificate" && (
                    <div className="relative group max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border transition-all duration-300 hover:scale-[1.02] bg-white p-2">
                      <img
                        src="/Cert1.webp"
                        alt="Sarvpratham Certificate of Completion"
                        className="w-full h-auto object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
                    </div>
                  )}

                  {/* Stats Grid */}
                  {slide.imageType === "stats" && (
                    <div className="w-full max-w-sm bg-white/90 border border-white backdrop-blur rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="flex gap-3 items-center">
                        <TrendingUp className="h-10 w-10 text-[color:var(--brand-gold-foreground)]" />
                        <h3 className="font-serif text-xl font-bold text-[color:var(--brand-dark)]">Upskilling Milestones</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {slide.stats?.map((st, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 bg-primary/5 rounded-2xl border border-primary/10 transition-colors hover:bg-primary/10">
                            <span className="text-sm font-semibold text-muted-foreground">{st.label}</span>
                            <span className="text-lg font-bold text-foreground font-serif bg-white px-3 py-1 rounded-xl shadow-sm border border-border">{st.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls & Marquee footer */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-border/30 pt-6">
          
          {/* Trust Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["aarav", "priya", "rohan", "sneha"].map((name) => (
                <img
                  key={name}
                  src={`/avatars/${name}.png`}
                  alt="Student avatar"
                  className="h-9 w-9 rounded-full border-2 border-white object-cover transition-transform hover:-translate-y-1 hover:scale-110 hover:z-10"
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-0.5 text-[color:var(--brand-gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div className="text-muted-foreground text-xs">
                Trusted by over <b className="text-foreground">4,000+</b> Students
              </div>
            </div>
          </div>

          {/* Dots Indicator & Navigation buttons */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-2 rounded-full border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer shadow-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="p-2 rounded-full border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer shadow-sm"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Corporate logos marquee */}
        <div className="mt-8 rounded-2xl bg-white/70 border border-white shadow-[var(--shadow-card)] py-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max marquee-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex items-center gap-10 pr-10 shrink-0"
              >
                {companies.map((c) => (
                  <img
                    key={`${copy}-${c.name}`}
                    src={c.logo}
                    alt={c.name}
                    title={c.name}
                    className="h-6 sm:h-7 w-auto max-w-[110px] object-contain shrink-0 transition-transform duration-300 hover:scale-110"
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
