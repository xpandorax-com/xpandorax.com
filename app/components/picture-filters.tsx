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

interface PictureFiltersProps {
  models?: { id: string; name: string; slug: string }[];
  currentFilters: {
    sort: string;
    model?: string;
  };
  totalResults?: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Views" },
  { value: "most-images", label: "Most Images" },
  { value: "title", label: "Title (A-Z)" },
];

export function PictureFilters({ 
  models = [], 
  currentFilters, 
  totalResults 
}: PictureFiltersProps) {
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

  const hasActiveFilters = currentFilters.model;

  const activeFilterCount = [
    currentFilters.model,
  ].filter(Boolean).length;

  const selectedModel = models.find(m => m.slug === currentFilters.model);

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

        {/* Model Filter */}
        {models.length > 0 && (
          <Select 
            value={currentFilters.model || "all"} 
            onValueChange={(v) => updateFilter("model", v)}
          >
            <SelectTrigger className="w-[140px] sm:w-[180px] h-9">
              <SelectValue placeholder="Filter by model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.slug}>
                  {model.name}
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

        {/* Results count */}
        {totalResults !== undefined && (
          <span className="text-sm text-muted-foreground ml-auto">
            {totalResults.toLocaleString()} {totalResults === 1 ? "gallery" : "galleries"}
          </span>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.model && selectedModel && (
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("model", "all")}
            >
              Model: {selectedModel.name}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
