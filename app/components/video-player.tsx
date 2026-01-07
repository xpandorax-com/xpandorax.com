"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Loader2, Server, ExternalLink, AlertTriangle, Maximize2 } from "lucide-react";
import { cn } from "~/lib/utils";

export interface VideoServer {
  name: string;
  embedCode: string;
}

export interface DownloadLink {
  name: string;
  url: string;
}

interface VideoPlayerProps {
  embedCode: string;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
  servers?: VideoServer[];
  onServerError?: (failedIndex: number) => void;
  currentServerIndex?: number;
}

/**
 * Simple Video Player Component using embed codes
 * Mobile-optimized with fullscreen support and auto server switching
 */
export function VideoPlayer({
  embedCode,
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
    // Try to extract URL from embed code for opening in new tab
    const urlMatch = embedCode.match(/src=["']([^"']+)["']/);
    const url = urlMatch ? urlMatch[1] : '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
    // Reset state when embed code changes
    setIsLoading(true);
    setHasStarted(false);
    setHasError(false);
    setAutoSwitchAttempted(false);
    return undefined;
  }, [embedCode]);

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
    return undefined;
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
          
          {/* Embed code container */}
          <div
            className={cn(
              "h-full w-full [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0",
              (isLoading || hasError) && "invisible"
            )}
            dangerouslySetInnerHTML={{ __html: embedCode }}
            onLoad={() => handleLoad()}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Server Selector Component - displays server options as buttons
 * Mobile-responsive with horizontal scroll
 */
interface ServerSelectorProps {
  servers: VideoServer[];
  activeIndex: number;
  onServerChange: (index: number) => void;
  className?: string;
}

export function ServerSelector({
  servers,
  activeIndex,
  onServerChange,
  className,
}: ServerSelectorProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
        <Server className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Servers:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
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
