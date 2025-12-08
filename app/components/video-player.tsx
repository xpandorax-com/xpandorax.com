"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Loader2, Server } from "lucide-react";
import { cn } from "~/lib/utils";

export interface VideoServer {
  name: string;
  url: string;
}

interface VideoPlayerProps {
  embedUrl: string;
  servers?: VideoServer[];
  thumbnailUrl?: string | null;
  title: string;
  className?: string;
  onPlay?: () => void;
}

/**
 * Video Player Component with Multi-Server Support
 * 
 * Supports iframe embeds from:
 * - Abyss.to, DoodStream, StreamTape, Filemoon, VOE, etc.
 * - YouTube, Vimeo, Dailymotion, Twitch, etc.
 */
export function VideoPlayer({
  embedUrl,
  servers = [],
  thumbnailUrl,
  title,
  className,
  onPlay,
}: VideoPlayerProps) {
  // Build all available servers (primary + additional)
  const allServers: VideoServer[] = [
    { name: "Server 1", url: embedUrl },
    ...servers,
  ];
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentUrl = allServers[activeServerIndex]?.url || embedUrl;

  const handleServerChange = (index: number) => {
    setActiveServerIndex(index);
    setIsLoading(true);
    setShowServerMenu(false);
  };

  const handlePlay = () => {
    setHasStarted(true);
    onPlay?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset state when embed URL changes
    setIsLoading(true);
    setHasStarted(false);
    setActiveServerIndex(0);
  }, [embedUrl]);

  // Close server menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showServerMenu) {
        setShowServerMenu(false);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showServerMenu]);

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
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-zinc-400">Loading video...</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={currentUrl}
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
          
          {/* Server Selector - only show if multiple servers */}
          {allServers.length > 1 && (
            <div className="absolute top-3 right-3 z-20">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowServerMenu(!showServerMenu);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-black/80 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/90"
                >
                  <Server className="h-4 w-4" />
                  <span>{allServers[activeServerIndex]?.name}</span>
                </button>
                
                {showServerMenu && (
                  <div 
                    className="absolute right-0 top-full mt-1 min-w-[140px] overflow-hidden rounded-lg bg-zinc-900 shadow-xl ring-1 ring-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allServers.map((server, index) => (
                      <button
                        key={index}
                        onClick={() => handleServerChange(index)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800",
                          activeServerIndex === index
                            ? "bg-primary/20 text-primary"
                            : "text-white"
                        )}
                      >
                        <Server className="h-3.5 w-3.5" />
                        {server.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
