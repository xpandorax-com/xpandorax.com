"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Loader2, Server, ExternalLink, AlertTriangle, Maximize2, Crown } from "lucide-react";
import { cn } from "~/lib/utils";

export interface VideoServer {
  name: string;
  url: string;
}

export interface DownloadLink {
  name: string;
  url: string;
}

interface VideoPlayerProps {
  embedUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
  servers?: VideoServer[];
  onServerError?: (failedIndex: number) => void;
  currentServerIndex?: number;
}

/**
 * Simple Video Player Component using iframe embeds
 * Mobile-optimized with fullscreen support and auto server switching
 */
export function VideoPlayer({
  embedUrl,
  thumbnailUrl,
  title,
  className,
  onPlay,
  servers = [],
  onServerError,
  currentServerIndex = 0,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePlay = () => {
    setHasStarted(true);
    onPlay?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Auto-switch to next server if available
    if (!autoSwitchAttempted && servers.length > 0 && currentServerIndex < servers.length - 1) {
      setAutoSwitchAttempted(true);
      onServerError?.(currentServerIndex);
    }
  };

  const openInNewTab = () => {
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  };

  // Request fullscreen on mobile
  const requestFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    // Reset state when embed URL changes
    setIsLoading(true);
    setHasStarted(false);
    setHasError(false);
    setAutoSwitchAttempted(false);
  }, [embedUrl]);

  // Set a timeout to detect if iframe fails to load (X-Frame-Options block)
  useEffect(() => {
    if (hasStarted && isLoading) {
      const timeout = setTimeout(() => {
        // If still loading after 10 seconds, likely blocked - auto switch to next server
        setHasError(true);
        setIsLoading(false);
        
        // Auto-switch to next server if available
        if (!autoSwitchAttempted && servers.length > 0 && currentServerIndex < servers.length - 1) {
          setAutoSwitchAttempted(true);
          onServerError?.(currentServerIndex);
        }
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [hasStarted, isLoading, autoSwitchAttempted, servers.length, currentServerIndex, onServerError]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        "fullscreen:rounded-none fullscreen:aspect-auto fullscreen:h-screen",
        className
      )}
    >
      {!hasStarted ? (
        // Thumbnail with play button
        <button
          onClick={handlePlay}
          className="group relative h-full w-full focus:outline-none touch-target"
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
              <Play className="h-16 w-16 sm:h-20 sm:w-20 text-zinc-600" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90 active:scale-95">
              <Play className="ml-0.5 sm:ml-1 h-6 w-6 sm:h-8 sm:w-8 text-white" fill="white" />
            </div>
          </div>
          
          {/* Video title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="text-sm sm:text-lg font-medium text-white drop-shadow-lg line-clamp-2">
              {title}
            </h3>
          </div>
        </button>
      ) : (
        // Video iframe
        <div className="relative h-full w-full">
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                <p className="text-xs sm:text-sm text-zinc-400">Loading video...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3 sm:gap-4 text-center px-4">
                <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
                <div>
                  <p className="text-base sm:text-lg font-medium text-white">Video embed blocked</p>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    This server doesn't allow embedding. Try a different server or open directly.
                  </p>
                </div>
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-primary/90 transition-colors touch-target"
                >
                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          )}

          {/* Fullscreen button for mobile */}
          {isMobile && !isLoading && !hasError && (
            <button
              onClick={requestFullscreen}
              className="absolute top-2 right-2 z-20 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors touch-target"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}
          
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            className={cn(
              "h-full w-full border-0",
              (isLoading || hasError) && "invisible"
            )}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            onLoad={handleLoad}
            onError={handleError}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Server Selector Component - displays server options as buttons
 * Mobile-responsive with horizontal scroll
 * Includes premium "Main Server (No Ads)" option
 */
interface ServerSelectorProps {
  servers: VideoServer[];
  activeIndex: number;
  onServerChange: (index: number) => void;
  className?: string;
  isPremium?: boolean;
  mainServerUrl?: string | null;
}

export function ServerSelector({
  servers,
  activeIndex,
  onServerChange,
  className,
  isPremium = false,
  mainServerUrl,
}: ServerSelectorProps) {
  // Check if Main Server URL is available
  const hasMainServerUrl = !!mainServerUrl;
  // Determine if Main Server is usable (premium + has URL)
  const canUseMainServer = isPremium && hasMainServerUrl;
  
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
        <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Servers:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
        {/* Main Server (No Ads) - Always show, locked for non-premium */}
        <button
          onClick={() => canUseMainServer && onServerChange(-1)}
          disabled={!canUseMainServer}
          title={!isPremium ? "Premium subscription required for ad-free streaming" : !hasMainServerUrl ? "Ad-free video not available for this content" : "Ad-free streaming"}
          className={cn(
            "rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-target min-h-[36px] sm:min-h-[auto] relative",
            activeIndex === -1 && canUseMainServer
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
              : canUseMainServer
              ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border border-amber-500/50"
              : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed border border-dashed border-muted-foreground/30"
          )}
        >
          <span className="flex items-center gap-1.5">
            {isPremium ? "🌟" : "🔒"} Main Server (No Ads)
          </span>
        </button>
        
        {/* Regular servers */}
        {servers.map((server, index) => (
          <button
            key={index}
            onClick={() => onServerChange(index)}
            className={cn(
              "rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-target min-h-[36px] sm:min-h-[auto]",
              activeIndex === index
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground active:bg-muted/70"
            )}
          >
            {server.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Plyr Video Player Component for direct video files (Premium Main Server)
 * Uses Plyr.io for a clean, ad-free video experience
 */
interface PlyrVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
}

export function PlyrVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  className,
  onPlay,
}: PlyrVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Dynamically load Plyr CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
    document.head.appendChild(link);

    // Dynamically load Plyr JS and initialize
    const script = document.createElement('script');
    script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
    script.async = true;
    script.onload = () => {
      if (videoRef.current && (window as any).Plyr) {
        const player = new (window as any).Plyr(videoRef.current, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
          settings: ['captions', 'quality', 'speed'],
          speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
          keyboard: { focused: true, global: false },
          tooltips: { controls: true, seek: true },
        });

        player.on('play', () => {
          onPlay?.();
        });

        player.on('ready', () => {
          setIsLoading(false);
        });

        player.on('error', () => {
          setHasError(true);
          setIsLoading(false);
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, [videoUrl, onPlay]);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-black", className)}>
      {/* Premium badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-1 text-xs font-semibold text-white shadow-lg">
        <Crown className="h-3.5 w-3.5" />
        Ad-Free
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-amber-500" />
            <p className="text-xs sm:text-sm text-zinc-400">Loading premium video...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
            <div>
              <p className="text-lg font-medium text-white">Video unavailable</p>
              <p className="text-sm text-zinc-400 mt-1">
                There was an error loading the video. Please try another server.
              </p>
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className={cn("h-full w-full", (isLoading || hasError) && "invisible")}
        poster={thumbnailUrl || undefined}
        playsInline
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
