"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Loader2, Server, ExternalLink, AlertTriangle } from "lucide-react";
import { cn } from "~/lib/utils";

export interface VideoServer {
  name: string;
  url: string;
}

interface VideoPlayerProps {
  embedUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
}

/**
 * Simple Video Player Component using iframe embeds
 */
export function VideoPlayer({
  embedUrl,
  thumbnailUrl,
  title,
  className,
  onPlay,
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
  };

  const openInNewTab = () => {
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    // Reset state when embed URL changes
    setIsLoading(true);
    setHasStarted(false);
    setHasError(false);
  }, [embedUrl]);

  // Set a timeout to detect if iframe fails to load (X-Frame-Options block)
  useEffect(() => {
    if (hasStarted && isLoading) {
      const timeout = setTimeout(() => {
        // If still loading after 10 seconds, likely blocked
        setHasError(true);
        setIsLoading(false);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [hasStarted, isLoading]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg bg-black",
        className
      )}
    >
      {!hasStarted ? (
        // Thumbnail with play button
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
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90">
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
      ) : (
        // Video iframe
        <div className="relative h-full w-full">
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-zinc-400">Loading video...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-4 text-center px-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <div>
                  <p className="text-lg font-medium text-white">Video embed blocked</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    This server doesn't allow embedding. Try a different server or open directly.
                  </p>
                </div>
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Server className="h-4 w-4" />
        Servers:
      </span>
      {servers.map((server, index) => (
        <button
          key={index}
          onClick={() => onServerChange(index)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activeIndex === index
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {server.name}
        </button>
      ))}
    </div>
  );
}
