import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize, RotateCcw, Settings, Check } from "lucide-react";

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
  const [volume, setVolume] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [availableRates, setAvailableRates] = useState<number[]>([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  const [quality, setQuality] = useState("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [settingsTab, setSettingsTab] = useState<null | "root" | "quality" | "speed">(null);
  const settingsRef = useRef<HTMLDivElement>(null);

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
          const info = data.info;
          if (info.currentTime !== undefined) {
            setCurrentTime(info.currentTime);
          }
          if (info.duration !== undefined) {
            setDuration(info.duration);
          }
          if (info.volume !== undefined) {
            setVolume(info.volume);
          }
          if (info.muted !== undefined) {
            setIsMuted(info.muted);
          }
          if (info.playbackRate !== undefined) {
            setPlaybackRate(info.playbackRate);
          }
          if (Array.isArray(info.availablePlaybackRates) && info.availablePlaybackRates.length) {
            setAvailableRates(info.availablePlaybackRates);
          }
          if (info.playbackQuality !== undefined) {
            setQuality(info.playbackQuality);
          }
          if (Array.isArray(info.availableQualityLevels) && info.availableQualityLevels.length) {
            setAvailableQualities(info.availableQualityLevels);
          }
        }
      } catch (err) {
        // Safe to ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // YouTube only starts emitting infoDelivery (currentTime, duration, volume,
  // playbackRate, quality) after the embed receives a "listening" handshake.
  // Without this the timeline stays frozen at 0:00 — which is why both time
  // labels read 0:00 even while the video plays. The iframe may not be ready the
  // instant onLoad fires, so the handshake is repeated briefly until data flows.
  useEffect(() => {
    let cancelled = false;
    const ping = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        "*"
      );
    };
    ping();
    const interval = setInterval(() => {
      if (cancelled) return;
      ping();
    }, 500);
    // Stop pinging once the player is clearly reporting back.
    const stop = setTimeout(() => clearInterval(interval), 6000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [videoId]);

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

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseInt(e.target.value, 10);
    setVolume(next);
    sendCommand("setVolume", [next]);
    // Dragging the slider off zero should implicitly unmute, and to zero should mute.
    if (next === 0) {
      sendCommand("mute");
      setIsMuted(true);
    } else if (isMuted) {
      sendCommand("unMute");
      setIsMuted(false);
    }
  };

  const changeRate = (rate: number) => {
    sendCommand("setPlaybackRate", [rate]);
    setPlaybackRate(rate);
    setSettingsTab(null);
  };

  const changeQuality = (level: string) => {
    // setPlaybackQuality is advisory — YouTube may override it based on bandwidth,
    // and the resulting level comes back via onPlaybackQualityChange/infoDelivery.
    sendCommand("setPlaybackQuality", [level]);
    setQuality(level);
    setSettingsTab(null);
  };

  const QUALITY_LABELS: Record<string, string> = {
    highres: "4K",
    hd2160: "2160p",
    hd1440: "1440p",
    hd1080: "1080p",
    hd720: "720p",
    large: "480p",
    medium: "360p",
    small: "240p",
    tiny: "144p",
    auto: "Auto",
    default: "Auto",
  };
  const qualityLabel = (q: string) => QUALITY_LABELS[q] ?? q;

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

  // Dismiss the settings popover when clicking anywhere outside it.
  useEffect(() => {
    if (!settingsTab) return;
    const onPointerDown = (e: PointerEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsTab(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [settingsTab]);

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

            {/* Volume: button + slider that expands on hover */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                ) : volume < 50 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                aria-label="Volume"
                title={`Volume ${isMuted ? 0 : volume}%`}
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100 h-1 rounded-lg cursor-pointer appearance-none outline-none transition-all duration-200"
                style={{
                  background: `linear-gradient(to right, #fff 0%, #fff ${
                    isMuted ? 0 : volume
                  }%, rgba(255,255,255,0.25) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.25) 100%)`,
                }}
              />
            </div>

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
            {/* Current speed shown inline so it is readable without opening the menu */}
            {playbackRate !== 1 && (
              <span className="text-[10px] font-bold text-white tracking-wide bg-white/15 border border-white/20 px-2 py-0.5 rounded-full pointer-events-none">
                {playbackRate}x
              </span>
            )}

            {/* Settings: quality + playback speed */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setSettingsTab((t) => (t ? null : "root"))}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
                title="Settings"
                aria-haspopup="menu"
                aria-expanded={settingsTab !== null}
              >
                <Settings className={`h-4 w-4 transition-transform ${settingsTab ? "rotate-45" : ""}`} />
              </button>

              {settingsTab && (
                <div className="absolute bottom-full right-0 mb-2 min-w-[180px] max-h-64 overflow-y-auto rounded-xl bg-black/90 backdrop-blur border border-white/15 py-1.5 shadow-2xl text-white text-xs">
                  {settingsTab === "root" && (
                    <>
                      <button
                        onClick={() => setSettingsTab("quality")}
                        className="w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-white/10 transition-colors"
                      >
                        <span>Quality</span>
                        <span className="text-white/60">{qualityLabel(quality)}</span>
                      </button>
                      <button
                        onClick={() => setSettingsTab("speed")}
                        className="w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-white/10 transition-colors"
                      >
                        <span>Speed</span>
                        <span className="text-white/60">{playbackRate === 1 ? "Normal" : `${playbackRate}x`}</span>
                      </button>
                    </>
                  )}

                  {settingsTab === "quality" && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
                        Quality
                      </div>
                      {["auto", ...availableQualities].map((q) => (
                        <button
                          key={q}
                          onClick={() => changeQuality(q)}
                          className="w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                          <span>{qualityLabel(q)}</span>
                          {quality === q && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                      {availableQualities.length === 0 && (
                        <div className="px-3 py-2 text-white/50">Loading…</div>
                      )}
                    </>
                  )}

                  {settingsTab === "speed" && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10 mb-1">
                        Speed
                      </div>
                      {availableRates.map((r) => (
                        <button
                          key={r}
                          onClick={() => changeRate(r)}
                          className="w-full flex items-center justify-between gap-6 px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                          <span>{r === 1 ? "Normal" : `${r}x`}</span>
                          {playbackRate === r && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Watermark Label */}
            <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-full pointer-events-none">
              Sarvpratham Player
            </span>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white hover:scale-105 transition-all outline-none"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
