import { Link } from "@remix-run/react";
import { Image as ImageIcon, Eye, User } from "lucide-react";
import { formatViews, cn } from "~/lib/utils";

interface PictureCardPicture {
  id: string;
  slug?: string;
  title: string;
  thumbnail?: string | null;
  imageCount: number;
  views?: number;
  model?: {
    name: string;
    slug?: string;
  } | null;
}

interface PictureCardProps {
  picture: PictureCardPicture;
  className?: string;
  size?: "default" | "compact";
}

export function PictureCard({ picture, className, size = "default" }: PictureCardProps) {
  const isCompact = size === "compact";
  const linkTo = picture.slug 
    ? `/pictures/${picture.slug}` 
    : picture.model?.slug 
      ? `/model/${picture.model.slug}` 
      : "#";
  
  return (
    <Link
      to={linkTo}
      className={cn(
        "group relative flex overflow-hidden rounded-lg bg-card transition-all hover:bg-accent hover:ring-2 hover:ring-primary/50 cursor-pointer",
        isCompact ? "flex-row gap-2" : "flex-col",
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        "relative overflow-hidden bg-muted shrink-0",
        isCompact ? "w-28 sm:w-32 aspect-[3/4] rounded-lg" : "aspect-[3/4]"
      )}>
        {picture.thumbnail ? (
          <img
            src={picture.thumbnail}
            alt={picture.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <ImageIcon className={cn(
              "text-muted-foreground",
              isCompact ? "h-4 w-4" : "h-8 w-8 sm:h-12 sm:w-12"
            )} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <div className={cn(
            "rounded-full bg-pink-600/90 transition-transform scale-0 group-hover:scale-100",
            isCompact ? "p-1" : "p-2 sm:p-3"
          )}>
            <ImageIcon className={cn(
              "text-white",
              isCompact ? "h-2.5 w-2.5" : "h-4 w-4 sm:h-6 sm:w-6"
            )} />
          </div>
        </div>

        {/* Image count badge */}
        {picture.imageCount > 1 && (
          <div className={cn(
            "absolute flex items-center gap-0.5 rounded bg-black/80 font-medium text-white",
            isCompact 
              ? "bottom-0.5 right-0.5 px-1 py-0.5 text-[10px]" 
              : "bottom-1 right-1 sm:bottom-2 sm:right-2 gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 text-2xs sm:text-xs"
          )}>
            <ImageIcon className={cn(isCompact ? "h-2 w-2" : "h-2.5 w-2.5 sm:h-3 sm:w-3")} />
            {picture.imageCount}
          </div>
        )}

        {/* Model indicator */}
        {picture.model && (
          <div className={cn(
            "absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-1 rounded-full bg-black/70 px-1.5 py-0.5 text-white",
            isCompact ? "text-[9px]" : "text-2xs sm:text-xs"
          )}>
            <User className="h-2.5 w-2.5" />
            <span className="truncate max-w-[80px]">{picture.model.name}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-1 flex-col min-w-0",
        isCompact ? "py-0.5" : "p-2 sm:p-3"
      )}>
        <h3 className={cn(
          "font-medium leading-tight group-hover:text-pink-500 transition-colors",
          isCompact ? "line-clamp-2 text-xs" : "line-clamp-2 text-xs sm:text-sm"
        )}>
          {picture.title}
        </h3>

        <div className={cn(
          "flex items-center gap-2 text-muted-foreground",
          isCompact ? "mt-0.5" : "mt-1 sm:mt-2"
        )}>
          {/* Views */}
          {picture.views !== undefined && picture.views > 0 && (
            <span className={cn(
              "flex items-center gap-0.5",
              isCompact ? "text-[10px]" : "text-2xs sm:text-xs"
            )}>
              <Eye className={cn(isCompact ? "h-2 w-2" : "h-2.5 w-2.5 sm:h-3 sm:w-3")} />
              {formatViews(picture.views)}
            </span>
          )}
          
          {/* Image count (mobile visible) */}
          <span className={cn(
            "flex items-center gap-0.5",
            isCompact ? "text-[10px]" : "text-2xs sm:text-xs"
          )}>
            <ImageIcon className={cn(isCompact ? "h-2 w-2" : "h-2.5 w-2.5 sm:h-3 sm:w-3")} />
            {picture.imageCount} {picture.imageCount === 1 ? "image" : "images"}
          </span>
        </div>
      </div>
    </Link>
  );
}
