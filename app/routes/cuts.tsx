import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";
import { CutCardCompact } from "~/components/cut-card";
import { Button } from "~/components/ui/button";
import { 
  Scissors, 
  Clock, 
  TrendingUp, 
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createSanityClient, getSlug, type SanityCut, type SanityCategory } from "~/lib/sanity";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Cuts - Short Videos | XpandoraX" },
    { name: "description", content: "Watch short vertical videos on XpandoraX. TikTok-style content featuring the hottest clips." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const sort = url.searchParams.get("sort") || "latest";
  const filter = url.searchParams.get("filter") || "all";
  const limit = 24;
  const offset = (page - 1) * limit;

  try {
    const sanity = createSanityClient(context.cloudflare.env);

    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = "publishedAt asc";
        break;
      case "popular":
        orderBy = "views desc";
        break;
      case "latest":
      default:
        orderBy = "publishedAt desc";
        break;
    }

    // No filter condition needed
    const filterCondition = "";

    // Fetch cuts, count, and categories in parallel
    const [cutsRaw, totalCount, categoriesRaw] = await Promise.all([
      sanity.fetch<SanityCut[]>(
        `*[_type == "cut" && isPublished == true ${filterCondition}] | order(${orderBy}) [$offset...$end] {
          _id,
          title,
          slug,
          "thumbnail": thumbnail.asset->url,
          videoUrl,
          duration,
          views,
          "actress": actress->{
            name
          }
        }`,
        { offset, end: offset + limit }
      ),
      sanity.fetch<number>(
        `count(*[_type == "cut" && isPublished == true ${filterCondition}])`
      ),
      sanity.fetch<SanityCategory[]>(
        `*[_type == "category"] | order(name asc) { _id, name, slug }`
      ),
    ]);

    const cuts = cutsRaw.map((c) => ({
      id: c._id,
      slug: getSlug(c.slug),
      title: c.title,
      thumbnail: c.thumbnail || null,
      videoUrl: c.videoUrl,
      duration: c.duration || null,
      views: c.views || 0,
      actress: c.actress ? { name: c.actress.name } : null,
    }));

    const categories = categoriesRaw.map((c) => ({
      id: c._id,
      name: c.name,
      slug: getSlug(c.slug),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return json({
      cuts,
      categories,
      total: totalCount,
      page,
      totalPages,
      sort,
      filter,
    });
  } catch (error) {
    console.error("Cuts loader error:", error);
    return json({
      cuts: [],
      categories: [],
      total: 0,
      page: 1,
      totalPages: 0,
      sort: "latest",
      filter: "all",
      error: "Failed to load cuts",
    });
  }
}

export default function CutsPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Update filter
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    newParams.delete("page"); // Reset page when changing filters
    setSearchParams(newParams);
  };

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(pageNum));
    return `/cuts?${params.toString()}`;
  };

  const filterOptions: { value: string; label: string; icon: LucideIcon | null }[] = [
    { value: "all", label: "All", icon: null },
  ];

  const sortOptions: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "latest", label: "Latest", icon: Clock },
    { value: "popular", label: "Popular", icon: TrendingUp },
    { value: "oldest", label: "Oldest", icon: Clock },
  ];

  return (
    <div className="container py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-1">
          <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
          Cuts
        </h1>
        <p className="text-sm text-muted-foreground">
          Short vertical videos • Swipe through the hottest clips
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("filter", option.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                data.filter === option.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.icon && <option.icon className="h-4 w-4 text-amber-500" />}
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1 ml-auto">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("sort", option.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                data.sort === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-muted-foreground">
        {data.total} {data.total === 1 ? "cut" : "cuts"} found
      </div>

      {/* Cuts Grid */}
      {data.cuts.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
          {data.cuts.map((cut) => (
            <CutCardCompact key={cut.id} cut={cut} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Scissors className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No cuts found</h2>
          <p className="text-muted-foreground mb-4">
            {data.filter !== "all"
              ? "Try changing your filter to see more cuts."
              : "Check back later for new content."}
          </p>
          {data.filter !== "all" && (
            <Button onClick={() => updateFilter("filter", "all")}>
              Show all cuts
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {/* Previous */}
          <Link
            to={buildPageUrl(Math.max(1, data.page - 1))}
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              data.page === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-muted"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              let pageNum;
              if (data.totalPages <= 5) {
                pageNum = i + 1;
              } else if (data.page <= 3) {
                pageNum = i + 1;
              } else if (data.page >= data.totalPages - 2) {
                pageNum = data.totalPages - 4 + i;
              } else {
                pageNum = data.page - 2 + i;
              }
              
              return (
                <Link
                  key={pageNum}
                  to={buildPageUrl(pageNum)}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    data.page === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {/* Next */}
          <Link
            to={buildPageUrl(Math.min(data.totalPages, data.page + 1))}
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              data.page === data.totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-muted"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </div>
  );
}
