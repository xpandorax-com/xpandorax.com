import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Video, SlidersHorizontal } from "lucide-react";
import { createSanityClient, getSlug, type SanityVideo } from "~/lib/sanity";

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
  const limit = 36;
  const offset = (page - 1) * limit;

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

  // Fetch videos with pagination
  const [videosRaw, totalCount] = await Promise.all([
    sanity.fetch<SanityVideo[]>(
      `*[_type == "video" && isPublished == true] | order(${orderBy}) [$offset...$end] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        "previewVideo": previewVideo.asset->url,
        duration,
        views,
        isPremium
      }`,
      { offset, end: offset + limit }
    ),
    sanity.fetch<number>(`count(*[_type == "video" && isPublished == true])`),
  ]);

  const videoList = videosRaw.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    videos: videoList,
    total: totalCount,
    page,
    totalPages,
    sort,
  });
}

export default function VideosPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 sm:h-6 sm:w-6" />
            All Videos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Browse {data.total.toLocaleString()} videos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={data.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 touch-target">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="popular">Most Views</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                  isPremium: video.isPremium,
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
                    <a
                      href={`/videos?${new URLSearchParams({
                        sort: data.sort,
                        page: String(data.page - 1),
                      })}`}
                    >
                      Previous
                    </a>
                  </Button>
                )}
                {data.page < data.totalPages && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                    <a
                      href={`/videos?${new URLSearchParams({
                        sort: data.sort,
                        page: String(data.page + 1),
                      })}`}
                    >
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
          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">No Videos Yet</h2>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Check back later for new content.
          </p>
        </div>
      )}
    </div>
  );
}
