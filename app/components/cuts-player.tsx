"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@remix-run/react";
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  X,
  Music2,
  User,
  Loader2,
} from "lucide-react";
import { cn, formatViews } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export interface CutData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  videoUrl: string;
  embedUrl?: string | null;
  duration?: number | null;
  views?: number;
  likes?: number;
  isPremium?: boolean;
  soundName?: string | null;
  hashtags?: string[];
  actress?: {
    name: string;
    slug: string;
    image?: string | null;
  } | null;
}

interface CutsPlayerProps {
  cut: CutData;
  allCuts?: CutData[];
  currentIndex?: number;
  onNavigate?: (direction: "prev" | "next") => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * TikTok-style vertical video player for short videos (Cuts)
 * Features:
 * - Full-screen vertical video
 * - Tap to play/pause
 * - Swipe up/down navigation (via buttons)
 * - Like, comment, share actions
 * - Sound on/off toggle
 * - Model/actress info overlay
 */
export function CutsPlayer({
  cut,
  allCuts = [],
  currentIndex = 0,
  onNavigate,
  onLike,
  onComment,
  onShare,
  className,
}: CutsPlayerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const hasNext = currentIndex < allCuts.length - 1;
  const hasPrev = currentIndex > 0;

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle like
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    onLike?.();
  }, [isLiked, onLike]);

  // Handle video load
  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {
        // Auto-play was prevented, mute and try again
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
    }
  }, [isPlaying]);

  // Update progress
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  }, []);

  // Loop video
  const handleEnded = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, []);

  // Navigation
  const handleNavigate = useCallback((direction: "prev" | "next") => {
    if (direction === "prev" && hasPrev) {
      const prevCut = allCuts[currentIndex - 1];
      navigate(`/cut/${prevCut.slug}`);
      onNavigate?.("prev");
    } else if (direction === "next" && hasNext) {
      const nextCut = allCuts[currentIndex + 1];
      navigate(`/cut/${nextCut.slug}`);
      onNavigate?.("next");
    }
  }, [allCuts, currentIndex, hasNext, hasPrev, navigate, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowUp":
          e.preventDefault();
          handleNavigate("prev");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleNavigate("next");
          break;
        case "m":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, handleNavigate]);

  // Touch/swipe handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY = e.changedTouches[0].screenY;
      const diff = touchStartY - touchEndY;
      
      // Swipe threshold
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe up - next video
          handleNavigate("next");
        } else {
          // Swipe down - previous video
          handleNavigate("prev");
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleNavigate]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    handleActivity();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, []);

  // Share function
  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: cut.title,
          text: cut.description || cut.title,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      onShare?.();
    }
  }, [cut, onShare]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Video or Embed */}
      {cut.embedUrl ? (
        <iframe
          src={cut.embedUrl}
          className="w-full h-full max-w-[500px] mx-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 0 }}
        />
      ) : (
        <video
          ref={videoRef}
          src={cut.videoUrl}
          poster={cut.thumbnail || undefined}
          className="w-full h-full object-contain max-w-[500px] mx-auto"
          playsInline
          muted={isMuted}
          loop
          onClick={togglePlay}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      {/* Loading spinner */}
      {isLoading && !cut.embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}

      {/* Play/Pause indicator (on tap) */}
      {!isPlaying && !cut.embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full bg-black/50 p-6">
            <Play className="h-16 w-16 text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!cut.embedUrl && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Close button */}
      <Link
        to="/cuts"
        className={cn(
          "absolute top-4 left-4 z-10 rounded-full bg-black/50 p-2 text-white transition-opacity hover:bg-black/70",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <X className="h-6 w-6" />
      </Link>

      {/* Right side actions */}
      <div
        className={cn(
          "absolute right-3 sm:right-4 bottom-24 sm:bottom-32 flex flex-col items-center gap-5 z-10 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 sm:opacity-100"
        )}
      >
        {/* Model avatar */}
        {cut.actress && (
          <Link
            to={`/model/${cut.actress.slug}`}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full border-2 border-white overflow-hidden bg-zinc-800">
              {cut.actress.image ? (
                <img
                  src={cut.actress.image}
                  alt={cut.actress.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </Link>
        )}

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={cn(
            "rounded-full bg-black/30 p-3 transition-colors",
            isLiked ? "text-red-500" : "text-white hover:bg-black/50"
          )}>
            <Heart
              className="h-7 w-7"
              fill={isLiked ? "currentColor" : "none"}
            />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            {formatViews((cut.likes || 0) + (isLiked ? 1 : 0))}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={onComment}
          className="flex flex-col items-center gap-1"
        >
          <div className="rounded-full bg-black/30 p-3 text-white hover:bg-black/50 transition-colors">
            <MessageCircle className="h-7 w-7" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            0
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="rounded-full bg-black/30 p-3 text-white hover:bg-black/50 transition-colors">
            <Share2 className="h-7 w-7" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-lg">
            Share
          </span>
        </button>

        {/* Sound toggle */}
        {!cut.embedUrl && (
          <button
            onClick={toggleMute}
            className="rounded-full bg-black/30 p-3 text-white hover:bg-black/50 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div
        className={cn(
          "absolute bottom-4 left-3 right-20 sm:right-24 z-10 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 sm:opacity-100"
        )}
      >
        {/* Username */}
        {cut.actress && (
          <Link
            to={`/model/${cut.actress.slug}`}
            className="flex items-center gap-2 mb-2"
          >
            <span className="text-white font-bold text-base drop-shadow-lg hover:underline">
              @{cut.actress.name.toLowerCase().replace(/\s+/g, '')}
            </span>
            <span className="px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded">
              Follow
            </span>
          </Link>
        )}

        {/* Description */}
        <p className="text-white text-sm line-clamp-2 drop-shadow-lg mb-2">
          {cut.description || cut.title}
        </p>

        {/* Hashtags */}
        {cut.hashtags && cut.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {cut.hashtags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-white text-xs font-medium drop-shadow-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Sound/Music */}
        {cut.soundName && (
          <div className="flex items-center gap-2 text-white text-xs">
            <Music2 className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="truncate max-w-[200px] drop-shadow-lg">
              {cut.soundName}
            </span>
          </div>
        )}
      </div>

      {/* Navigation arrows (visible on larger screens) */}
      <div
        className={cn(
          "hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-4 z-10 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate("prev")}
          disabled={!hasPrev}
          className="rounded-full bg-black/30 text-white hover:bg-black/50 disabled:opacity-30"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate("next")}
          disabled={!hasNext}
          className="rounded-full bg-black/30 text-white hover:bg-black/50 disabled:opacity-30"
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>

      {/* Views count */}
      <div
        className={cn(
          "absolute top-4 right-4 flex items-center gap-1 text-white text-sm bg-black/30 px-2 py-1 rounded-full z-10 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <Play className="h-3.5 w-3.5" fill="white" />
        <span>{formatViews(cut.views || 0)}</span>
      </div>
    </div>
  );
}
