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
  showPrerollAd?: boolean;
}

/**
 * Plyr-style Video Player Component
 * 
 * Supports:
 * - Abyss.to embed URLs (iframe mode)
 * - Direct video URLs (native Plyr mode)
 * - Pre-roll ad compatibility
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
  showPrerollAd = false,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(showPrerollAd);
  const [adCountdown, setAdCountdown] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine if this is an iframe embed or direct video
  const isIframeEmbed = embedUrl.includes("embed") || 
                        embedUrl.includes("abyss.to") || 
                        embedUrl.includes("iframe");

  const handlePlay = useCallback(() => {
    if (showPrerollAd && !hasStarted) {
      // Show pre-roll ad overlay
      setShowAdOverlay(true);
      setAdCountdown(5);
      
      // Countdown timer for ad
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAdOverlay(false);
            setHasStarted(true);
            onPlay?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Cleanup not needed for this synchronous operation
    } else {
      setHasStarted(true);
      onPlay?.();
    }
  }, [showPrerollAd, hasStarted, onPlay]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleSkipAd = () => {
    if (adCountdown === 0) {
      setShowAdOverlay(false);
      setHasStarted(true);
      onPlay?.();
    }
  };

  useEffect(() => {
    // Reset state when embed URL changes
    setIsLoading(true);
    setHasStarted(false);
    setShowAdOverlay(showPrerollAd);
  }, [embedUrl, showPrerollAd]);

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
      {/* Pre-roll Ad Overlay */}
      {showAdOverlay && hasStarted === false && showPrerollAd && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="absolute top-4 right-4 rounded bg-black/70 px-3 py-1 text-sm text-white">
            Ad • {adCountdown > 0 ? `Skip in ${adCountdown}s` : ""}
          </div>
          
          {/* Ad Content Area - This is where ExoClick/JuicyAds pre-roll would go */}
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-white">
              <p className="text-lg">Advertisement</p>
              <p className="text-sm text-muted-foreground">Video will play shortly...</p>
            </div>
          </div>
          
          {adCountdown === 0 && (
            <button
              onClick={handleSkipAd}
              className="absolute bottom-4 right-4 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Skip Ad →
            </button>
          )}
        </div>
      )}

      {!hasStarted && !showAdOverlay ? (
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
            // Iframe embed (Abyss.to, etc.)
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title}
              className={cn(
                "h-full w-full border-0",
                isLoading && "invisible"
              )}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={handleLoad}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
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

/**
 * VideoPlayerWithAds - Wrapper component that integrates with ExoClick/JuicyAds
 * Use this when you need pre-roll or overlay ads
 */
interface VideoPlayerWithAdsProps extends VideoPlayerProps {
  adConfig?: {
    prerollEnabled?: boolean;
    overlayEnabled?: boolean;
    exoclickZoneId?: string;
    juicyadsZoneId?: string;
  };
}

export function VideoPlayerWithAds({
  adConfig,
  ...playerProps
}: VideoPlayerWithAdsProps) {
  const [adCompleted, setAdCompleted] = useState(false);

  // If no ad config or ads disabled, render regular player
  if (!adConfig?.prerollEnabled && !adConfig?.overlayEnabled) {
    return <VideoPlayer {...playerProps} />;
  }

  return (
    <div className="relative">
      <VideoPlayer
        {...playerProps}
        showPrerollAd={adConfig.prerollEnabled && !adCompleted}
        onPlay={() => {
          setAdCompleted(true);
          playerProps.onPlay?.();
        }}
      />
      
      {/* Overlay ad container - positioned below or beside video */}
      {adConfig.overlayEnabled && adConfig.exoclickZoneId && (
        <div className="mt-2" id="video-overlay-ad">
          {/* ExoClick overlay ad will be injected here */}
        </div>
      )}
    </div>
  );
}
