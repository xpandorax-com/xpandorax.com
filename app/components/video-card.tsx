import { Link, useNavigate } from "@remix-run/react";
import { useState, useRef, useCallback } from "react";
import { Play, Clock, Eye } from "lucide-react";
import { formatDuration, formatViews, cn } from "~/lib/utils";
import { trackView } from "~/lib/view-tracker";

interface VideoCardVideo {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  previewVideo?: string | null; // URL to preview video (fast-forward version)
  duration?: number | null;
  views?: number;
  actress?: {
    name: string;
  } | null;
}

interface VideoCardProps {
  video: VideoCardVideo;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  const navigate = useNavigate();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Track view when card is clicked (first click)
  const handleTrackView = useCallback(async () => {
    if (!hasTrackedView) {
      setHasTrackedView(true);
      await trackView("video", video.id);
    }
  }, [hasTrackedView, video.id]);

  // Handle click - single click for preview, double click for navigation
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (clickTimeoutRef.current) {
      // Double click detected - navigate to video
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setIsPreviewing(false);
      navigate(`/video/${video.slug}`);
    } else {
      // First click - track view and start preview
      handleTrackView();
      setIsPreviewing(true);
      
      // Set timeout to detect if it's a single click
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
      }, 300); // 300ms window for double-click
    }
  }, [navigate, video.slug, handleTrackView]);

  // Handle mouse leave - stop preview
  const handleMouseLeave = useCallback(() => {
    setIsPreviewing(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Handle preview video load - play at faster speed
  const handleVideoLoad = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 4; // 4x speed for fast preview
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, []);

  return (
    <div
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-accent cursor-pointer",
        className
      )}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isPreviewing && video.previewVideo ? (
          // Preview video (fast-forward)
          <video
            ref={videoRef}
            src={video.previewVideo}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            onLoadedData={handleVideoLoad}
          />
        ) : video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay - shows double-click hint when previewing */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className={cn(
            "rounded-full bg-primary/90 p-3 transition-transform",
            isPreviewing ? "scale-100" : "scale-0 group-hover:scale-100"
          )}>
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
          {isPreviewing && (
            <span className="mt-2 text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
              Double-click to watch
            </span>
          )}
        </div>

        {/* Preview indicator */}
        {isPreviewing && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white" />
            Preview
          </div>
        )}

        {/* Duration badge */}
        {video.duration && !isPreviewing && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
          {video.title}
        </h3>

        {video.actress && (
          <p className="mt-1 text-xs text-muted-foreground">
            {video.actress.name}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {video.views !== undefined && video.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(video.views)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="p-3">
        <div className="h-4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
