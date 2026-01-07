import { Link } from "@remix-run/react";
import { Play } from "lucide-react";
import { formatViews, cn } from "~/lib/utils";

interface CutCardCut {
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

interface CutCardProps {
  cut: CutCardCut;
  className?: string;
}

export function CutCard({ cut, className }: CutCardProps) {
  return (
    <Link
      to={`/cut/${cut.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer touch-action-button",
        className
      )}
    >
      {/* Thumbnail - 9:16 aspect ratio for vertical videos */}
      <div className="relative aspect-[9/16] overflow-hidden bg-muted">
        {cut.thumbnail ? (
          <img
            src={cut.thumbnail}
            alt={cut.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Play className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className="rounded-full bg-white/90 p-2 xs:p-2.5 sm:p-3 transition-transform scale-0 group-hover:scale-100 shadow-lg">
            <Play className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-black" fill="black" />
          </div>
        </div>

        {/* Views badge */}
        {cut.views !== undefined && cut.views > 0 && (
          <div className="absolute bottom-1.5 xs:bottom-2 left-1.5 xs:left-2 flex items-center gap-0.5 xs:gap-1 rounded bg-black/70 px-1 xs:px-1.5 py-0.5 text-[9px] xs:text-[10px] sm:text-[11px] font-medium text-white backdrop-blur-sm">
            <Play className="h-2.5 w-2.5 xs:h-3 xs:w-3" fill="white" />
            {formatViews(cut.views)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-1.5 xs:p-2">
        <h3 className="line-clamp-2 text-[10px] xs:text-xs font-medium leading-tight group-hover:text-primary">
          {cut.title}
        </h3>
        {cut.actress && (
          <p className="mt-0.5 xs:mt-1 text-[9px] xs:text-[10px] text-muted-foreground truncate">
            {cut.actress.name}
          </p>
        )}
      </div>
    </Link>
  );
}

// Compact version for smaller grids
export function CutCardCompact({ cut, className }: CutCardProps) {
  return (
    <Link
      to={`/cut/${cut.slug}`}
      className={cn(
        "group relative aspect-[9/16] overflow-hidden rounded-lg bg-muted cursor-pointer touch-action-button",
        className
      )}
    >
      {cut.thumbnail ? (
        <img
          src={cut.thumbnail}
          alt={cut.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
          <Play className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-muted-foreground" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
        <div className="rounded-full bg-white/90 p-1.5 xs:p-2 transition-transform scale-0 group-hover:scale-100 shadow-lg">
          <Play className="h-3 w-3 xs:h-4 xs:w-4 text-black" fill="black" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-1.5 xs:p-2">
        <h3 className="line-clamp-2 text-[9px] xs:text-[10px] sm:text-[11px] font-medium leading-tight text-white drop-shadow-lg">
          {cut.title}
        </h3>
        {cut.views !== undefined && cut.views > 0 && (
          <div className="mt-0.5 xs:mt-1 flex items-center gap-0.5 xs:gap-1 text-[8px] xs:text-[9px] sm:text-[10px] text-white/80">
            <Play className="h-2 w-2 xs:h-2.5 xs:w-2.5" fill="currentColor" />
            {formatViews(cut.views)}
          </div>
        )}
      </div>
    </Link>
  );
}
