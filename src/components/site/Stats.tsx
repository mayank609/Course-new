import { BookOpen, GraduationCap, MessageSquareCode, Award } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const stats = [
  {
    icon: <GraduationCap className="h-6 w-6 text-purple-600 shrink-0" />,
    value: "4,000+",
    label: "Students Trained",
  },
  {
    icon: <Award className="h-6 w-6 text-purple-600 shrink-0" />,
    value: "12+",
    label: "Years Experience",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-purple-600 shrink-0" />,
    value: "140+",
    label: "Video Lessons",
  },
  {
    icon: <MessageSquareCode className="h-6 w-6 text-purple-600 shrink-0" />,
    value: "100+",
    label: "Hours Content",
  },
];

export function Stats() {
  return (
    <section className="px-4 py-8 bg-white">
      <div className="mx-auto max-w-7xl rounded-2xl bg-[#f5f3ff] border border-purple-100/60 p-6 md:p-8 flex flex-wrap justify-around items-center gap-8 shadow-sm">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 100}
            className="flex items-center gap-4 group hover:-translate-y-0.5 transition-transform duration-200"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-purple-50 group-hover:scale-105 transition-transform">
              {s.icon}
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-purple-950 leading-none">
                {s.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-purple-700/80">
                {s.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
