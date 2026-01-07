"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";

interface PlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  controlsStyle?: "default" | "minimal" | "full";
  playsinline?: boolean;
}

interface PortableTextVideoProps {
  value: {
    _type: "videoBlock";
    _key: string;
    sourceType: "selfHosted" | "external";
    videoUrl?: string;
    embedCode?: string;
    title?: string;
    caption?: string;
    posterUrl?: string;
    posterImage?: {
      asset?: {
        _ref?: string;
        url?: string;
      };
    };
    aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16" | "21:9";
    maxWidth?: "full" | "lg" | "md" | "sm";
    playerOptions?: PlayerOptions;
  };
}

// Control presets based on style
const controlPresets = {
  default: [
    "play-large",
    "play",
    "progress",
    "current-time",
    "mute",
    "volume",
    "fullscreen",
  ],
  minimal: ["play-large", "play", "progress", "mute", "fullscreen"],
  full: [
    "play-large",
    "rewind",
    "play",
    "fast-forward",
    "progress",
    "current-time",
    "duration",
    "mute",
    "volume",
    "captions",
    "settings",
    "pip",
    "airplay",
    "fullscreen",
  ],
};

/**
 * PortableTextVideo Component
 *
 * Renders video blocks from Sanity Portable Text using Plyr.io
 * Supports both self-hosted (B2) and external embeds (YouTube/Vimeo)
 */
export function PortableTextVideo({ value }: PortableTextVideoProps) {
  const {
    sourceType,
    videoUrl,
    embedCode,
    title,
    caption,
    posterUrl,
    posterImage,
    aspectRatio = "16:9",
    maxWidth = "full",
    playerOptions = {},
  } = value;

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [plyrLoaded, setPlyrLoaded] = useState(false);

  // Aspect ratio CSS classes
  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
    "21:9": "aspect-[21/9]",
  }[aspectRatio];

  // Max width CSS classes
  const maxWidthClass = {
    full: "w-full",
    lg: "max-w-[1024px]",
    md: "max-w-[768px]",
    sm: "max-w-[512px]",
  }[maxWidth];

  // Get poster URL from either direct URL or Sanity image
  const getPosterUrl = (): string | undefined => {
    if (posterUrl) return posterUrl;
    if (posterImage?.asset?._ref) {
      const ref = posterImage.asset._ref;
      const [, id, dimensions, format] = ref.split("-");
      return `https://cdn.sanity.io/images/p9gceue4/production/${id}-${dimensions}.${format}`;
    }
    return undefined;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PlyrRef = useRef<any>(null);

  // Load Plyr dynamically on client side
  useEffect(() => {
    if (typeof window !== "undefined" && sourceType === "selfHosted") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import("plyr").then((module: any) => {
        PlyrRef.current = module.default;
        setPlyrLoaded(true);
      });

      // Load Plyr CSS
      if (!document.querySelector('link[href*="plyr.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
        document.head.appendChild(link);
      }
    }
  }, [sourceType]);

  // Initialize Plyr when ready
  useEffect(() => {
    if (!plyrLoaded || !videoRef.current || !PlyrRef.current || !hasStarted) return;

    const Plyr = PlyrRef.current;
    const controls =
      controlPresets[playerOptions.controlsStyle || "default"];

    playerRef.current = new Plyr(videoRef.current, {
      controls: playerOptions.controls !== false ? controls : [],
      autoplay: playerOptions.autoplay || false,
      muted: playerOptions.autoplay || playerOptions.muted || false,
      loop: { active: playerOptions.loop || false },
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      storage: { enabled: true, key: "plyr" },
      resetOnEnd: false,
      keyboard: { focused: true, global: false },
      tooltips: { controls: true, seek: true },
      invertTime: true,
      displayDuration: true,
      clickToPlay: true,
      hideControls: true,
      settings: ["captions", "quality", "speed", "loop"],
    });

    // Handle events
    playerRef.current.on("ready", () => {
      setIsLoading(false);
    });

    playerRef.current.on("error", () => {
      setHasError(true);
      setIsLoading(false);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [plyrLoaded, hasStarted, playerOptions]);

  // Extract src from embed code
  const getEmbedSrc = (): string | null => {
    if (!embedCode) return null;
    const match = embedCode.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  };

  // Render self-hosted video with Plyr
  const renderSelfHostedVideo = () => {
    if (!videoUrl) {
      return (
        <div className="flex h-full items-center justify-center bg-zinc-900">
          <p className="text-sm text-zinc-500">No video URL provided</p>
        </div>
      );
    }

    const poster = getPosterUrl();

    if (!hasStarted) {
      return (
        <button
          onClick={() => setHasStarted(true)}
          className="group relative h-full w-full focus:outline-none"
          aria-label={`Play ${title || "video"}`}
        >
          {poster ? (
            <img
              src={poster}
              alt={title || "Video thumbnail"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
              <Play className="h-16 w-16 text-zinc-600" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90 active:scale-95">
              <Play className="ml-1 h-8 w-8 text-white" fill="white" />
            </div>
          </div>

          {/* Title overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-medium text-white drop-shadow-lg">
                {title}
              </h3>
            </div>
          )}
        </button>
      );
    }

    return (
      <div className="relative h-full w-full plyr-container">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
              <p className="text-sm text-white">Failed to load video</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Open directly
              </a>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          playsInline={playerOptions.playsinline !== false}
          className="h-full w-full"
          crossOrigin="anonymous"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  // Render external embed (YouTube/Vimeo)
  const renderExternalEmbed = () => {
    const embedSrc = getEmbedSrc();

    if (!embedSrc) {
      return (
        <div className="flex h-full items-center justify-center bg-zinc-900">
          <p className="text-sm text-zinc-500">Invalid embed code</p>
        </div>
      );
    }

    if (!hasStarted) {
      return (
        <button
          onClick={() => setHasStarted(true)}
          className="group relative h-full w-full focus:outline-none"
          aria-label={`Play ${title || "video"}`}
        >
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-primary/90">
                <Play className="ml-1 h-8 w-8 text-white" fill="white" />
              </div>
              {title && (
                <p className="text-lg font-medium text-white">{title}</p>
              )}
              <p className="text-sm text-zinc-400">Click to load video</p>
            </div>
          </div>
        </button>
      );
    }

    return (
      <iframe
        src={embedSrc}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  };

  return (
    <figure
      className={cn(
        "my-6 mx-auto overflow-hidden rounded-lg",
        maxWidthClass
      )}
    >
      <div className={cn("relative bg-black", aspectRatioClass)}>
        {sourceType === "selfHosted"
          ? renderSelfHostedVideo()
          : renderExternalEmbed()}
      </div>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default PortableTextVideo;
