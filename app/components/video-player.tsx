"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Loader2, Maximize, Volume2, VolumeX, Pause, Settings } from "lucide-react";
import { cn } from "~/lib/utils";

interface VideoPlayerProps {
  embedUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

// List of known video hosting domains that use iframe embeds
const EMBED_HOSTS = [
  // Adult video hosts
  "abyss.to",
  "short.icu",      // Abyss.to embed domain
  "doodstream.com",
  "dood.to",
  "dood.so",
  "dood.watch",
  "dood.ws",
  "dood.pm",
  "streamtape.com",
  "streamtape.to",
  "streamsb.net",
  "streamsb.com",
  "sbplay.org",
  "vidoza.net",
  "filemoon.sx",
  "filemoon.to",
  "voe.sx",
  "upstream.to",
  "mixdrop.co",
  "mixdrop.to",
  "netu.tv",
  "hxfile.co",
  "vtube.to",
  "wolfstream.tv",
  // Mainstream video hosts
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "twitch.tv",
  "facebook.com",
  "streamable.com",
  "vidyard.com",
  "wistia.com",
  "loom.com",
  // Generic patterns
  "player.",
  "embed.",
];

/**
 * Check if URL is an iframe embed based on known hosts or patterns
 */
function isEmbedUrl(url: string): boolean {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  
  // Check for common embed patterns
  if (lowerUrl.includes("/embed/") || 
      lowerUrl.includes("/embed?") ||
      lowerUrl.includes("/e/") ||
      lowerUrl.includes("/player/") ||
      lowerUrl.includes("iframe") ||
      lowerUrl.includes("/watch/")) {
    return true;
  }
  
  // Check against known embed hosts
  return EMBED_HOSTS.some(host => lowerUrl.includes(host));
}

/**
 * Plyr-style Video Player Component
 * 
 * Supports:
 * - Multiple video hosting platforms (iframe mode):
 *   - Abyss.to, DoodStream, StreamTape, Filemoon, VOE, etc.
 *   - YouTube, Vimeo, Dailymotion, Twitch, etc.
 * - Direct video URLs (native Plyr mode)
 * - Custom controls with Plyr styling
 */
export function VideoPlayer({
  embedUrl,
  thumbnailUrl,
  title,
  className,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine if this is an iframe embed or direct video
  const isIframeEmbed = isEmbedUrl(embedUrl);

  const handlePlay = useCallback(() => {
    setHasStarted(true);
    onPlay?.();
  }, [onPlay]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset state when embed URL changes
    setIsLoading(true);
    setHasStarted(false);
  }, [embedUrl]);

  // Load Plyr CSS
  useEffect(() => {
    const linkId = "plyr-css";
    if (typeof document !== "undefined" && !document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "plyr-container relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        className
      )}
    >
      {!hasStarted ? (
        // Thumbnail with Plyr-style play button
        <button
          onClick={handlePlay}
          className="group relative h-full w-full focus:outline-none"
          aria-label={`Play ${title}`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
              <Play className="h-20 w-20 text-zinc-600" />
            </div>
          )}
          
          {/* Plyr-style gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Plyr-style play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="plyr-play-button flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#00b2ff] shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-[#00c8ff]">
              <Play className="ml-1 h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          
          {/* Video title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-medium text-white drop-shadow-lg line-clamp-2">
              {title}
            </h3>
          </div>
        </button>
      ) : hasStarted ? (
        // Video player (iframe embed mode)
        <div className="relative h-full w-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#00b2ff]" />
                <p className="text-sm text-zinc-400">Loading video...</p>
              </div>
            </div>
          )}
          
          {isIframeEmbed ? (
            // Iframe embed (Abyss.to, DoodStream, Filemoon, YouTube, etc.)
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className={cn(
                "h-full w-full border-0",
                isLoading && "invisible"
              )}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              onLoad={handleLoad}
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            // Native video with Plyr controls
            <PlyrNativePlayer
              src={embedUrl}
              poster={thumbnailUrl || undefined}
              title={title}
              onLoad={handleLoad}
              onPause={onPause}
              onEnded={onEnded}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Native Plyr Player for direct video URLs
 */
interface PlyrNativePlayerProps {
  src: string;
  poster?: string;
  title: string;
  onLoad?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function PlyrNativePlayer({ src, poster, onLoad, onPause, onEnded }: PlyrNativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onLoad?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    // Auto-play
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onLoad, onPause, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div 
      className="plyr-native relative h-full w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        playsInline
        onClick={togglePlay}
      />
      
      {/* Plyr-style Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Progress bar */}
        <div 
          className="group relative mb-3 h-1 cursor-pointer rounded-full bg-white/30"
          onClick={handleSeek}
        >
          <div 
            className="absolute left-0 top-0 h-full rounded-full bg-[#00b2ff] transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#00b2ff] opacity-0 transition-opacity group-hover:opacity-100"
            style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>
        
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button 
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="white" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" fill="white" />
              )}
            </button>
            
            {/* Volume */}
            <button 
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            
            {/* Time */}
            <span className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Settings (placeholder) */}
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Center play/pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00b2ff]/90 transition-transform hover:scale-110"
          >
            <Play className="ml-1 h-7 w-7 text-white" fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}
