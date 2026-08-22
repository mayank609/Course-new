import { useState } from "react";
import { Star, Play, X } from "lucide-react";
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
    <section className="px-4 py-16 sm:py-20 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-[color:var(--brand-gold-foreground)] font-semibold uppercase tracking-[0.2em] text-xs">
            Student Stories
          </p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Real Results, Real Transformations
          </h2>
          <p className="mt-2 text-muted-foreground">
            See how our graduates are advancing in their careers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((t, idx) => (
            <Reveal
              key={t.name + idx}
              delay={idx * 80}
              className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-card)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  {t.videoUrl && (
                    <button
                      onClick={() => setActiveVideo(t.videoUrl!)}
                      className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-all scale-100 hover:scale-110 active:scale-95"
                      title="Play Video Testimonial"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-4 flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t.role}{t.company ? `, ` : ""}<span className="font-semibold text-primary/80">{t.company}</span>
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
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
