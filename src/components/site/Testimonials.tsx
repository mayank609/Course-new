import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/site/Reveal";

type TestimonialItem = {
  _id?: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  avatarUrl?: string;
};

const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Neha Kapoor",
    role: "MIS Executive",
    company: "HDFC Life",
    rating: 5,
    text: "Shubham sir's Excel training completely changed how I work. I went from knowing nothing to confidently building pivot reports for my entire department. Got promoted within 4 months.",
  },
  {
    name: "Rahul Sinha",
    role: "Operations Analyst",
    company: "Infosys",
    rating: 5,
    text: "The way he explains complex topics in simple language is unlike any other trainer. I had failed to learn Excel from 3 other courses. Here I understood everything — and landed my first job.",
  },
  {
    name: "Megha Patil",
    role: "Business Analyst",
    company: "TCS",
    rating: 5,
    text: "The AI module was a revelation. I now use Copilot every single day. The bonus Job Skills section helped me crack 3 interviews back to back. This is genuinely the most practical training I've done.",
  },
  {
    name: "Riya Sharma",
    role: "Team Lead - MIS",
    company: "Sarvpratham Alum",
    rating: 5,
    text: "This course has been a game-changer for me. The content is engaging, informative, and relevant to my career goals. I highly recommend it!",
  },
];

export function Testimonials() {
  const { data: dbTestimonials } = useQuery<TestimonialItem[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      return res.json();
    },
  });

  const list = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : defaultTestimonials;

  return (
    <section className="px-4 py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Title Header */}
        <Reveal className="text-center">
          <p className="text-purple-600 font-bold uppercase tracking-[0.2em] text-xs">
            Student Stories
          </p>
          <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
            Real Results, Real Transformations
          </h2>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">
            See how our graduates are advancing in their careers with MS Office and AI skills.
          </p>
        </Reveal>

        {/* Written Review Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {list.map((t, idx) => (
            <Reveal
              key={t.name + idx}
              delay={idx * 80}
              className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 border-t border-slate-50 pt-4 flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="h-9 w-9 rounded-full object-cover border border-slate-100"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-purple-50 text-[#6b21a8] flex items-center justify-center font-extrabold text-sm border border-purple-100">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-sans font-bold text-xs sm:text-sm text-slate-800">{t.name}</h4>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400">
                    {t.role}{t.company ? `, ` : ""}<span className="text-[#6b21a8]">{t.company}</span>
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
