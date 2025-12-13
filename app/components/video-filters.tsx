import { useSearchParams } from "@remix-run/react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";

interface VideoFiltersProps {
  categories?: { id: string; name: string; slug: string }[];
  currentFilters: {
    sort: string;
    duration?: string;
    category?: string;
  };
  totalResults?: number;
}

const DURATION_FILTERS = [
  { value: "all", label: "Any Duration" },
  { value: "short", label: "< 5 min" },
  { value: "medium", label: "5-20 min" },
  { value: "long", label: "20-60 min" },
  { value: "extra-long", label: "> 60 min" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Views" },
  { value: "title", label: "Title (A-Z)" },
];

export function VideoFilters({ 
  categories = [], 
  currentFilters, 
  totalResults 
}: VideoFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (currentFilters.sort !== "newest") {
      params.set("sort", currentFilters.sort);
    }
    setSearchParams(params);
  };

  const hasActiveFilters = currentFilters.duration || currentFilters.category;

  const activeFilterCount = [
    currentFilters.duration,
    currentFilters.category,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Sort */}
        <Select 
          value={currentFilters.sort} 
          onValueChange={(v) => updateFilter("sort", v)}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Duration Filter */}
        <Select 
          value={currentFilters.duration || "all"} 
          onValueChange={(v) => updateFilter("duration", v)}
        >
          <SelectTrigger className="w-[130px] sm:w-[150px] h-9">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select 
            value={currentFilters.category || "all"} 
            onValueChange={(v) => updateFilter("category", v)}
          >
            <SelectTrigger className="w-[140px] sm:w-[160px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.duration && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("duration", "all")}
            >
              {DURATION_FILTERS.find(d => d.value === currentFilters.duration)?.label}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
          {currentFilters.category && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("category", "all")}
            >
              {categories.find(c => c.slug === currentFilters.category)?.name || currentFilters.category}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      {totalResults !== undefined && (
        <p className="text-sm text-muted-foreground">
          {totalResults.toLocaleString()} {totalResults === 1 ? "video" : "videos"} found
        </p>
      )}
    </div>
  );
}

// Helper function to get duration filter SQL conditions
export function getDurationFilter(duration: string | null): { min?: number; max?: number } {
  switch (duration) {
    case "short":
      return { max: 300 }; // < 5 min
    case "medium":
      return { min: 300, max: 1200 }; // 5-20 min
    case "long":
      return { min: 1200, max: 3600 }; // 20-60 min
    case "extra-long":
      return { min: 3600 }; // > 60 min
    default:
      return {};
  }
}
