import { Award, CheckCircle, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function CertificateStats() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-white border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <Reveal className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                Credentials & Value
              </span>
              <h2 className="mt-3 font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
                Get Recognized with Our Prestigious Certificate!
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Upon successful completion of this program, you'll earn a professional certificate. Boost your resume, showcase your new AI + Excel skills, and unlock top job opportunities!
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <Award className="h-6 w-6 text-purple-600" />
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1e1b4b]">4,781+</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Certificates Issued</div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1e1b4b]">97%</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Student Satisfied</div>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1e1b4b]">100%</div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Genuine & Verified</div>
              </div>
            </div>
          </Reveal>

          {/* Right Column - Certificate mockup */}
          <Reveal delay={100} className="relative flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-indigo-600/5 rounded-3xl filter blur-3xl -z-10 transform scale-95" />

            <div className="relative group max-w-lg w-full rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-white p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
              <div className="rounded-2xl overflow-hidden border border-slate-100/50">
                <img
                  src="/Cert1.webp"
                  alt="Sarvpratham Analytics Certificate of Completion"
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
