import { Check, X, ShieldCheck, Award, Flame, Star } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const bulletPoints = [
  { text: "1-on-1 Doubt Support" },
  { text: "Personalized Mentorship" },
  { text: "Internship Opportunities" },
  { text: "Premium Quality Courses" },
];

const comparisonData = [
  {
    feature: "Affordable Price",
    sarvpratham: true,
    youtube: true,
    others: false,
  },
  {
    feature: "Live Doubt Solving",
    sarvpratham: true,
    youtube: false,
    others: false,
  },
  {
    feature: "Structured Learning",
    sarvpratham: true,
    youtube: false,
    others: true,
  },
  {
    feature: "Verified Certificate",
    sarvpratham: true,
    youtube: false,
    others: true,
  },
  {
    feature: "Corporate Expert Mentorship",
    sarvpratham: true,
    youtube: false,
    others: false,
  },
];

export function CertificateSection() {
  return (
    <section className="px-4 py-16 sm:py-20 bg-slate-50 border-t border-slate-100 overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-16">
        
        {/* Why Choose US? checklist section */}
        <div>
          <Reveal className="text-center">
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
              Why Choose US?
            </h2>
            <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base max-w-xl mx-auto">
              Get instant mentorship, internship opportunities, and a highly supportive learning community.
            </p>
          </Reveal>

          {/* Bullet points Card grid */}
          <Reveal delay={100} className="mt-8 max-w-4xl mx-auto rounded-3xl bg-white border border-slate-100 p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bulletPoints.map((bp) => (
                <div key={bp.text} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-purple-50/50 transition-colors">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                    {bp.text}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* How are we different comparison table */}
        <div className="space-y-8">
          <Reveal className="text-center">
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
              How are we different from others?
            </h2>
          </Reveal>

          <Reveal delay={120} className="max-w-4xl mx-auto overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50/50 border-b border-slate-100">
                    <th className="p-5 text-sm sm:text-base font-extrabold text-[#1e1b4b]">Features</th>
                    <th className="p-5 text-sm sm:text-base font-extrabold text-[#6b21a8] text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-current text-purple-600" />
                        Sarvpratham
                      </span>
                    </th>
                    <th className="p-5 text-sm sm:text-base font-extrabold text-slate-500 text-center">YouTube</th>
                    <th className="p-5 text-sm sm:text-base font-extrabold text-slate-500 text-center">Other Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={row.feature} className={idx !== comparisonData.length - 1 ? "border-b border-slate-50" : ""}>
                      <td className="p-5 text-xs sm:text-sm font-bold text-slate-700">{row.feature}</td>
                      
                      {/* Sarvpratham */}
                      <td className="p-5 text-center">
                        <div className="flex justify-center">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </div>
                        </div>
                      </td>

                      {/* YouTube */}
                      <td className="p-5 text-center">
                        <div className="flex justify-center">
                          {row.youtube ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm">
                              <X className="h-4 w-4 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Other Platforms */}
                      <td className="p-5 text-center">
                        <div className="flex justify-center">
                          {row.others ? (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm">
                              <X className="h-4 w-4 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
