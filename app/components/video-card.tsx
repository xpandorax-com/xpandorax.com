import { Link } from "@remix-run/react";
import { Play, Clock, Eye } from "lucide-react";
import { formatDuration, formatViews, cn } from "~/lib/utils";

interface VideoCardVideo {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
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
  return (
    <Link
      to={`/video/${video.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-accent cursor-pointer",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {video.thumbnail ? (
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

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="rounded-full bg-primary/90 p-2 sm:p-3 transition-transform scale-0 group-hover:scale-100">
            <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
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
    </Link>
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
