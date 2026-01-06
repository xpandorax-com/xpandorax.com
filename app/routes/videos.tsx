import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { VideoFilters, getDurationFilter } from "~/components/video-filters";
import { Button } from "~/components/ui/button";
import { Video } from "lucide-react";
import { createSanityClient, getSlug, type SanityVideo, type SanityCategory } from "~/lib/sanity";

export const meta: MetaFunction = () => {
  return [
    { title: "All Videos - XpandoraX" },
    { name: "description", content: "Browse all videos on XpandoraX." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const sort = url.searchParams.get("sort") || "newest";
  const duration = url.searchParams.get("duration");
  const category = url.searchParams.get("category");
  const limit = 36;
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
    case "title":
      orderBy = "title asc";
      break;
    case "newest":
    default:
      orderBy = "publishedAt desc";
      break;
  }

  // Build duration filter
  const durationFilter = getDurationFilter(duration);
  let durationCondition = "";
  if (durationFilter.min !== undefined && durationFilter.max !== undefined) {
    durationCondition = `&& duration >= ${durationFilter.min} && duration < ${durationFilter.max}`;
  } else if (durationFilter.min !== undefined) {
    durationCondition = `&& duration >= ${durationFilter.min}`;
  } else if (durationFilter.max !== undefined) {
    durationCondition = `&& duration < ${durationFilter.max}`;
  }

  // Build category filter
  const categoryCondition = category 
    ? `&& count(categories[slug.current == "${category}"]) > 0`
    : "";

  // Fetch videos, count, and categories in parallel
  const [videosRaw, totalCount, categoriesRaw] = await Promise.all([
    sanity.fetch<SanityVideo[]>(
      `*[_type == "video" && isPublished == true ${durationCondition} ${categoryCondition}] | order(${orderBy}) [$offset...$end] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        "previewVideo": previewVideo.asset->url,
        duration,
        views
      }`,
      { offset, end: offset + limit }
    ),
    sanity.fetch<number>(
      `count(*[_type == "video" && isPublished == true ${durationCondition} ${categoryCondition}])`
    ),
    sanity.fetch<SanityCategory[]>(
      `*[_type == "category"] | order(name asc) { _id, name, slug }`
    ),
  ]);

  const videoList = videosRaw.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
  }));

  const categories = categoriesRaw.map((c) => ({
    id: c._id,
    name: c.name,
    slug: getSlug(c.slug),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    videos: videoList,
    categories,
    total: totalCount,
    page,
    totalPages,
    sort,
    duration,
    category,
  });
  } catch (error) {
    console.error("Videos loader error:", error);
    return json({
      videos: [],
      categories: [],
      total: 0,
      page: 1,
      totalPages: 0,
      sort: "newest",
      duration: null,
      category: null,
      error: "Failed to load videos",
    });
  }
}

export default function VideosPage() {
  const data = useLoaderData<typeof loader>();

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("sort", data.sort);
    params.set("page", String(pageNum));
    if (data.duration) params.set("duration", data.duration);
    if (data.category) params.set("category", data.category);
    return `/videos?${params.toString()}`;
  };

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 sm:h-6 sm:w-6" />
          All Videos
        </h1>
        
        {/* Advanced Filters */}
        <VideoFilters
          categories={data.categories}
          currentFilters={{
            sort: data.sort,
            duration: data.duration || undefined,
            category: data.category || undefined,
          }}
          totalResults={data.total}
        />
      </div>

      {/* Video Grid */}
      {data.videos.length > 0 ? (
        <>
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.videos.map((video) => (
              <VideoCard
                key={video.id}
                video={{
                  id: video.id,
                  slug: video.slug,
                  title: video.title,
                  thumbnail: video.thumbnail,
                  duration: video.duration,
                  views: video.views,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                {data.page > 1 && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                    <a href={buildPageUrl(data.page - 1)}>
                      Previous
                    </a>
                  </Button>
                )}
                {data.page < data.totalPages && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                    <a href={buildPageUrl(data.page + 1)}>
                      Next
                    </a>
                  </Button>
                )}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
                Page {data.page} of {data.totalPages}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <Video className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">No Videos Found</h2>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
