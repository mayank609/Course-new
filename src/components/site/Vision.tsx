import { ShieldCheck, HelpCircle, CheckCircle2, BadgePercent } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function Vision() {
  return (
    <section id="how-it-works" className="px-4 py-16 sm:py-20 bg-[#2e1065] text-white">
      <div className="mx-auto max-w-7xl">
        {/* Title Header */}
        <Reveal className="text-center">
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight">
            Here's how you will learn <span className="text-[#a78bfa] underline decoration-yellow-400 decoration-3 underline-offset-4">for Free</span>
          </h2>
          <p className="mt-3 text-purple-200 font-medium text-sm sm:text-base max-w-2xl mx-auto">
            Our unique 100% refund guarantee keeps you motivated to finish what you start and build job-ready skills.
          </p>
        </Reveal>

        {/* Layout Grid */}
        <div className="mt-12 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          
          {/* Left Column: Vertically stacked step cards */}
          <div className="space-y-6">
            
            {/* Step 1 */}
            <Reveal delay={100} className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed] text-white shadow-md">
                <BadgePercent className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-lg sm:text-xl text-white">1. Enroll</h3>
                <p className="text-sm text-purple-200">
                  Enroll into your preferred courses (Excel, PowerPoint, Word, or AI) by paying a nominal one-time registration fee.
                </p>
              </div>
              <span className="absolute right-4 bottom-2 text-7xl font-extrabold text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">1</span>
            </Reveal>

            {/* Step 2 */}
            <Reveal delay={150} className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed] text-white shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-lg sm:text-xl text-white">2. Complete Course</h3>
                <p className="text-sm text-purple-200">
                  Watch all modules, complete the hands-on practice assignments, and complete the coursework chapters.
                </p>
              </div>
              <span className="absolute right-4 bottom-2 text-7xl font-extrabold text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">2</span>
            </Reveal>

            {/* Step 3 */}
            <Reveal delay={200} className="flex gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed] text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-lg sm:text-xl text-white">3. 100% Refund Awarded</h3>
                <p className="text-sm text-purple-200">
                  Submit your completion request and receive a 100% refund of your registration fee credited directly back to your bank account!
                </p>
              </div>
              <span className="absolute right-4 bottom-2 text-7xl font-extrabold text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">3</span>
            </Reveal>

          </div>

          {/* Right Column: Duration and Access Details */}
          <Reveal delay={180} className="p-8 rounded-[36px] bg-gradient-to-br from-[#4c1d95] to-[#3b0764] border border-purple-500/20 shadow-2xl relative overflow-hidden">
            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-purple-500/10 blur-xl" />
            
            <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-white border-b border-purple-500/20 pb-4 mb-6">
              Duration of Course
            </h3>
            
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fef08a] text-black">
                  <span className="font-extrabold text-xs">✓</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-sm sm:text-base text-yellow-300">Lifetime Access</h4>
                  <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                    Get lifetime access to all learning materials, curriculum resources, and future video updates, even after receiving your 100% refund.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fef08a] text-black">
                  <span className="font-extrabold text-xs">✓</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-sm sm:text-base text-yellow-300">3 Months Guarantee Window</h4>
                  <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                    To claim your 100% refund, simply complete the course lessons and submit practice tasks within 3 months of your enrollment.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-purple-200">
              <HelpCircle className="h-5 w-5 shrink-0 text-[#fef08a]" />
              <p>
                Over <b className="text-white">92%</b> of active learners claim their refund successfully. Build your skills with zero financial risk.
              </p>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
