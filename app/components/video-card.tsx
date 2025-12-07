import { Link } from "@remix-run/react";
import { Play, Clock, Eye, Crown } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDuration, formatViews, cn } from "~/lib/utils";

interface VideoCardVideo {
  id: string;
  slug: string;
  title: string;
  thumbnail?: string | null;
  duration?: number | null;
  views: number;
  isPremium: boolean;
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
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-accent",
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
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="scale-0 rounded-full bg-primary/90 p-3 transition-transform group-hover:scale-100">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Premium badge */}
        {video.isPremium && (
          <Badge
            variant="premium"
            className="absolute left-2 top-2 flex items-center gap-1"
          >
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
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
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatViews(video.views)}
          </span>
          {video.categories && video.categories.length > 0 && (
            <span className="truncate">
              {video.categories[0].name}
              {video.categories.length > 1 && ` +${video.categories.length - 1}`}
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
      <div className="p-3">
        <div className="h-4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
