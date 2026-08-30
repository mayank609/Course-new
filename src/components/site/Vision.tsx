import { Award, Sparkles, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function Vision() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-slate-50 border-t border-slate-100/60 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Instructor details */}
          <Reveal className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                <Award className="h-3.5 w-3.5" />
                Meet Your Instructor
              </span>
              <h2 className="mt-3 font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
                Shubham Verma
                <span className="text-purple-600 block text-lg font-bold mt-1">Microsoft Certified Trainer</span>
              </h2>
            </div>
            
            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Shubham brings over a decade of real-world corporate experience, helping professionals master Microsoft Office tools integrated with advanced AI features. His practical, case-study-driven pedagogy simplifies complex automation workflows, ensuring you build skills that translate directly to workplace efficiency.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="group rounded-2xl bg-white p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-sans font-bold text-slate-800 text-sm sm:text-base">Microsoft Certified</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Expert-led authorized curriculum</p>
              </div>

              <div className="group rounded-2xl bg-white p-5 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-sans font-bold text-slate-800 text-sm sm:text-base">AI Integration</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Learn ChatGPT & Copilot workflows</p>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Instructor Photo */}
          <Reveal delay={120} className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-indigo-600/5 rounded-3xl filter blur-3xl -z-10 transform scale-95" />

            <div className="relative group max-w-lg w-full rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-white p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
              <div className="rounded-2xl overflow-hidden border border-slate-100/50">
                <img
                  src="/instructor.jpeg"
                  alt="Shubham Verma - Microsoft Certified Trainer"
                  className="w-full h-auto aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>

              <div className="mt-4 p-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Industry Expert</span>
                </div>
                <h3 className="font-sans text-base font-extrabold text-slate-800">
                  10+ Years of Corporate Training Experience
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Trusted by working professionals to teach Excel, automation, and AI-powered productivity workflows.
                </p>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
