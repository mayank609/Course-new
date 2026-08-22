import { Sparkles, Star, ChevronLeft, ChevronRight, Award, Compass, TrendingUp, CheckCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { useState, useEffect } from "react";

const companies = [
  "MIQ",
  "SIEMENS",
  "TCS",
  "Tech Mahindra",
  "Infosys",
  "Accenture",
  "Wipro",
  "Cognizant",
  "Capgemini",
  "HCLTech",
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      type: "image",
      src: "/instructor.jpeg",
      alt: "Shubham Verma — Trainer",
      badge: "Expert Trainer",
      title: "Learn directly from Shubham Verma",
      description: "Founder & Lead Instructor. ex-Corporate Specialist helping you automate your daily business workflows.",
    },
    {
      type: "stats",
      icon: <TrendingUp className="h-10 w-10 text-[color:var(--brand-gold-foreground)]" />,
      badge: "Career Support",
      title: "Unlock Top Placement Opportunities",
      stats: [
        { val: "57%", label: "Avg. Salary Hike" },
        { val: "300+", label: "Hiring Partners" },
        { val: "1-on-1", label: "Mock Interviews" },
      ],
      description: "Get resume assistance, LinkedIn profile optimizations, and career counseling to step into high-paying roles.",
    },
    {
      type: "features",
      icon: <Award className="h-10 w-10 text-primary" />,
      badge: "Dual Certificate",
      title: "Structured Job-Ready Curriculum",
      features: [
        "Excel from Absolute Basic to Advanced Formula mastery",
        "AI Prompts for ChatGPT & Microsoft Copilot integration",
        "MS Word & PowerPoint corporate templates & designs",
        "Real-life datasets and corporate doubt support chats",
      ],
      description: "Earn recognized credentials to showcase on LinkedIn and secure premium corporate roles.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 pt-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[image:var(--gradient-hero)] px-6 sm:px-10 py-10 lg:py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl animate-float" />
        
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          
          {/* Left Column - Content */}
          <Reveal className="min-w-0">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <Sparkles className="h-4 w-4 text-[color:var(--brand-gold-foreground)] animate-float-sm" />
              Build Job-Ready MS Office & AI Skills
            </div>
            <h1 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-[color:var(--brand-dark)]">
              Learn MS Office + AI from Experts & Become Job-Ready.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              A complete learning ecosystem — Excel Basic to Advanced, Word, PowerPoint, AI with ChatGPT & Copilot, and Career Skills. Built for freshers, job seekers, and working professionals by Shubham Verma.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="shine rounded-full bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Link to="/courses">Explore Courses</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-[color:var(--brand-gold)]/50 text-[color:var(--brand-gold-foreground)] hover:bg-[color:var(--brand-gold)]/10 hover:-translate-y-0.5 transition-all"
              >
                <Link to="/about">About Shubham</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white bg-[image:var(--gradient-primary)] transition-transform hover:-translate-y-1 hover:scale-110 hover:z-10"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 text-[color:var(--brand-gold)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="text-muted-foreground">
                  Trusted by over <b className="text-foreground">4,000+</b> Students
                </div>
              </div>
            </div>
            
            {/* Logo Marquee */}
            <div className="mt-8 rounded-2xl bg-white/70 border border-white shadow-[var(--shadow-card)] py-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max marquee-track">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    className="flex items-center gap-10 pr-10 text-sm font-bold text-muted-foreground/70 shrink-0"
                  >
                    {companies.map((c) => (
                      <span
                        key={`${copy}-${c}`}
                        className="whitespace-nowrap transition-colors hover:text-[color:var(--brand-gold-foreground)]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right Column - Premium Auto-playing Slideshow */}
          <Reveal delay={120} className="relative">
            <div className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-primary/20 blur-2xl animate-float-sm" />
            <div className="absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-[color:var(--brand-gold)]/30 blur-2xl animate-float" />
            
            {/* Slideshow Container */}
            <div className="relative aspect-[4/3] w-full bg-white/80 border border-white/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden group min-h-[350px]">
              
              {/* Slides renderer */}
              <div className="relative flex-1">
                {slides.map((slide, idx) => {
                  const isActive = idx === currentSlide;
                  return (
                    <div
                      key={idx}
                      className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-in-out ${isActive ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-4 pointer-events-none"}`}
                    >
                      {/* Sub-badge */}
                      <span className="inline-flex max-w-max items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/15 uppercase tracking-wider mb-4">
                        {slide.badge}
                      </span>

                      {/* Render type: Image */}
                      {slide.type === "image" && slide.src && (
                        <div className="flex gap-4 items-center flex-1">
                          <img
                            src={slide.src}
                            alt={slide.alt}
                            className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
                          />
                          <div>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[color:var(--brand-dark)]">
                              {slide.title}
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {slide.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Render type: Stats */}
                      {slide.type === "stats" && (
                        <div className="flex flex-col flex-1">
                          <div className="flex gap-3 items-center">
                            {slide.icon}
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[color:var(--brand-dark)]">
                              {slide.title}
                            </h3>
                          </div>
                          
                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3 my-4">
                            {slide.stats?.map((st, i) => (
                              <div key={i} className="text-center p-2.5 bg-primary/5 rounded-2xl border border-primary/5">
                                <div className="text-lg sm:text-xl font-bold text-foreground font-serif">
                                  {st.val}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 leading-none">
                                  {st.label}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {slide.description}
                          </p>
                        </div>
                      )}

                      {/* Render type: Features */}
                      {slide.type === "features" && (
                        <div className="flex flex-col flex-1">
                          <div className="flex gap-3 items-center mb-3">
                            {slide.icon}
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[color:var(--brand-dark)]">
                              {slide.title}
                            </h3>
                          </div>
                          
                          {/* Features list */}
                          <ul className="space-y-2 mb-3">
                            {slide.features?.map((ft, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-foreground/90">
                                <CheckCircle className="h-4 w-4 text-[color:var(--brand-gold-foreground)] shrink-0 mt-0.5" />
                                <span>{ft}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Slider Controls */}
              <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-auto">
                {/* Dots indicator */}
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

                {/* Left/Right buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="p-1.5 rounded-full border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="p-1.5 rounded-full border border-border bg-white text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
