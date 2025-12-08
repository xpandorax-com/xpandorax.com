import { Link, useNavigate } from "@remix-run/react";
import { useState, useRef, useCallback, useEffect } from "react";
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
    
    // On touch devices, single tap navigates directly
    if (isTouchDevice) {
      handleTrackView();
      navigate(`/video/${video.slug}`);
      return;
    }
    
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
  }, [navigate, video.slug, handleTrackView, isTouchDevice]);

  // Handle touch start - store position
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  // Handle touch end - only navigate if not a scroll
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };
    
    const deltaX = Math.abs(touchEnd.x - touchStartRef.current.x);
    const deltaY = Math.abs(touchEnd.y - touchStartRef.current.y);
    
    // If moved more than 10px, it's a scroll, not a tap
    if (deltaX < 10 && deltaY < 10) {
      handleTrackView();
      navigate(`/video/${video.slug}`);
    }
    
    touchStartRef.current = null;
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
      onClick={!isTouchDevice ? handleClick : undefined}
      onTouchStart={isTouchDevice ? handleTouchStart : undefined}
      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-accent cursor-pointer touch-none",
        className
      )}
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isPreviewing && video.previewVideo && !isTouchDevice ? (
          // Preview video (fast-forward) - desktop only
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
            <Play className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay - shows double-click hint when previewing (desktop only) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className={cn(
            "rounded-full bg-primary/90 p-2 sm:p-3 transition-transform",
            isPreviewing && !isTouchDevice ? "scale-100" : "scale-0 group-hover:scale-100"
          )}>
            <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="white" />
          </div>
          {isPreviewing && !isTouchDevice && (
            <span className="mt-2 text-2xs sm:text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">
              Double-click to watch
            </span>
          )}
        </div>

        {/* Preview indicator - desktop only */}
        {isPreviewing && !isTouchDevice && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-2xs sm:text-xs font-medium text-white animate-pulse">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white" />
            Preview
          </div>
        )}

        {/* Duration badge */}
        {video.duration && !isPreviewing && (
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 rounded bg-black/80 px-1 sm:px-1.5 py-0.5 text-2xs sm:text-xs font-medium text-white">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-2 sm:p-3">
        <h3 className="line-clamp-2 text-xs sm:text-sm font-medium leading-tight group-hover:text-primary">
          {video.title}
        </h3>

        {video.actress && (
          <p className="mt-0.5 sm:mt-1 text-2xs sm:text-xs text-muted-foreground truncate">
            {video.actress.name}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2 text-2xs sm:text-xs text-muted-foreground">
          {video.views !== undefined && video.views > 0 && (
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
      <div className="p-2 sm:p-3">
        <div className="h-3 sm:h-4 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 sm:mt-2 h-2.5 sm:h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 sm:mt-3 h-2.5 sm:h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
