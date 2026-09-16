import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Youtube } from "lucide-react";
import { extractYoutubeId } from "@/lib/youtube";

export function YoutubeSection() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to load site settings");
      return res.json() as Promise<{ youtubeVideoUrl: string; youtubeChannelUrl: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = data?.youtubeVideoUrl ? extractYoutubeId(data.youtubeVideoUrl) : null;
  if (!videoId) return null;

  return (
    <section className="py-16 sm:py-20 px-4 bg-muted/20">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Watch & Learn</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-2">See a Class Before You Join</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          A quick look at how our live and recorded sessions actually work.
        </p>

        <div className="relative mt-8 aspect-video w-full rounded-2xl overflow-hidden shadow-[var(--shadow-card)] bg-black">
          {isPlaying ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Sarvpratham Analytics demo class"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="group absolute inset-0 h-full w-full"
              aria-label="Play demo class video"
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt="Demo class video thumbnail"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-105 transition-all flex items-center justify-center shadow-lg">
                  <Play className="h-7 w-7 sm:h-8 sm:w-8 text-primary fill-current ml-1" />
                </span>
              </span>
            </button>
          )}
        </div>

        {data?.youtubeChannelUrl && (
          <a
            href={data.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
          >
            <Youtube className="h-5 w-5" /> Visit our YouTube Channel
          </a>
        )}
      </div>
    </section>
  );
}
