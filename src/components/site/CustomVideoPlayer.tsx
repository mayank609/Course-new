import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";

interface CustomVideoPlayerProps {
  videoId: string;
}

export function CustomVideoPlayer({ videoId }: CustomVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to send postMessage commands to YouTube JS API
  const sendCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  useEffect(() => {
    // Standard event listener for YouTube player updates
    const handleMessage = (e: MessageEvent) => {
      if (!e.origin.includes("youtube") && !e.origin.includes("youtube-nocookie")) return;
      try {
        const data = JSON.parse(e.data);
        
        // Handle state changes (play, pause, end)
        if (data.event === "onStateChange") {
          // 1 = playing, 2 = paused, 0 = ended
          if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2 || data.info === 0) {
            setIsPlaying(false);
          }
        }
        
        // Handle progress and duration updates
        if (data.event === "infoDelivery" && data.info) {
          if (data.info.currentTime !== undefined) {
            setCurrentTime(data.info.currentTime);
          }
          if (data.info.duration !== undefined) {
            setDuration(data.info.duration);
          }
        }
      } catch (err) {
        // Safe to ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      sendCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      sendCommand("playVideo");
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    sendCommand("seekTo", [time, true]);
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (isMuted) {
      sendCommand("unMute");
      setIsMuted(false);
    } else {
      sendCommand("mute");
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden"
    >
      {/* YouTube Frame - pointer-events-none completely blocks right-clicks, title hover, and share overlays */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&controls=0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1`}
        className="w-full h-full border-0 pointer-events-none scale-[1.01]"
        allow="autoplay; encrypted-media"
      />

      {/* Transparent Click Handler Wrapper to Play/Pause & Prevent Right-Click Menu */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Premium custom overlay controls visible on hover */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        
        {/* Timeline Seek Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-semibold text-white/90 font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow h-1.5 rounded-lg bg-white/20 hover:bg-white/35 accent-primary cursor-pointer transition-colors duration-150 appearance-none outline-none"
            style={{
              background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(255,255,255,0.2) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
          <span className="text-[11px] font-semibold text-white/90 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Panel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {/* Replay Button */}
            <button
              onClick={() => {
                sendCommand("seekTo", [0, true]);
                sendCommand("playVideo");
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
              title="Replay"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Watermark Label */}
            <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-full pointer-events-none">
              Sarvpratham Player
            </span>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
