import { useState } from "react";
import { Star, Play, X, User } from "lucide-react";
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
  videoUrl?: string;
};

const defaultVideoReviews = [
  {
    name: "Salman",
    role: "Student",
    bgGradient: "from-blue-600 to-indigo-900",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Apeksha",
    role: "Student",
    bgGradient: "from-purple-600 to-pink-900",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Naveen",
    role: "Student",
    bgGradient: "from-emerald-600 to-teal-900",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    name: "Shadab Ahmed",
    role: "Student",
    bgGradient: "from-amber-600 to-orange-900",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

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

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  if (url.length === 11 && !url.includes("/") && !url.includes(".")) {
    return `https://www.youtube.com/embed/${url}?autoplay=1`;
  }
  return null;
}

export function Testimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const { data: dbTestimonials } = useQuery<TestimonialItem[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      return res.json();
    },
  });

  const list = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials : defaultTestimonials;
  const ytEmbed = activeVideo ? getYoutubeEmbedUrl(activeVideo) : null;

  return (
    <section className="px-4 py-16 sm:py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl space-y-16">
        
        {/* Video reviews section */}
        <div className="space-y-10">
          <Reveal className="text-center">
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1e1b4b]">
              Video Reviews from Our Students!
            </h2>
            <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">
              Listen directly to how our students landed career transformations after completion.
            </p>
          </Reveal>

          {/* Video Grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {defaultVideoReviews.map((vr, i) => (
              <Reveal
                key={vr.name}
                delay={i * 80}
                className="flex flex-col items-center text-center group cursor-pointer"
                onClick={() => setActiveVideo(vr.videoUrl)}
              >
                {/* Vertical video card preview */}
                <div className={`w-full aspect-[3/4] rounded-[28px] bg-gradient-to-br ${vr.bgGradient} relative overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 flex items-center justify-center`}>
                  {/* Subtle abstract glow background */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
                  
                  {/* Styled avatar overlay placeholder */}
                  <div className="flex flex-col items-center gap-1.5 z-10 text-white/90">
                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Centered Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#6b21a8] group-hover:border-[#7c3aed] transition-all duration-300 text-white">
                      <Play className="h-6 w-6 fill-current ml-1 text-white" />
                    </div>
                  </div>
                </div>

                <h4 className="mt-3 font-sans font-extrabold text-[#1e1b4b] text-base leading-snug group-hover:text-[#6b21a8] transition-colors">
                  {vr.name}
                </h4>
                <p className="text-xs font-semibold text-slate-400">
                  {vr.role}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Written Review Cards */}
        <div className="space-y-8 border-t border-slate-100 pt-16">
          <Reveal className="text-center">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-[#1e1b4b]">
              Student Testimonials
            </h2>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {ytEmbed ? (
              <iframe
                src={ytEmbed}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                src={activeVideo}
                className="w-full h-full"
                controls
                autoPlay
              ></video>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
