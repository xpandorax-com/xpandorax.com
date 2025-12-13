import { Link } from "@remix-run/react";
import { FolderOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Category } from "~/types";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-colors hover:bg-accent touch-manipulation",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {category.thumbnail ? (
          <img
            src={category.thumbnail}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <FolderOpen className="h-8 w-8 sm:h-12 sm:w-12 text-primary/50" />
          </div>
        )}

        {/* Overlay with video count */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-white">{category.videoCount}</p>
            <p className="text-xs sm:text-sm text-white/80">videos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3">
        <h3 className="text-center text-xs sm:text-sm font-medium group-hover:text-primary line-clamp-1">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="p-3">
        <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
