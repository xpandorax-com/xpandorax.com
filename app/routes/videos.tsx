import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { desc, asc, sql } from "drizzle-orm";
import { createDatabase } from "~/db";
import { videos } from "~/db/schema";
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

  const db = createDatabase(context.cloudflare.env.DATABASE);

  let orderBy;
  switch (sort) {
    case "oldest":
      orderBy = asc(videos.createdAt);
      break;
    case "popular":
      orderBy = desc(videos.views);
      break;
    case "title":
      orderBy = asc(videos.title);
      break;
    case "newest":
    default:
      orderBy = desc(videos.createdAt);
      break;
  }

  const [videoList, totalResult] = await Promise.all([
    db.select().from(videos).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(videos),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return json({
    videos: videoList,
    total,
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
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            All Videos
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse {data.total.toLocaleString()} videos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={data.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
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
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
            <div className="mt-8 flex justify-center gap-2">
              {data.page > 1 && (
                <Button variant="outline" asChild>
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
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              {data.page < data.totalPages && (
                <Button variant="outline" asChild>
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
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Video className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Videos Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back later for new content.
          </p>
        </div>
      )}
    </div>
  );
}
