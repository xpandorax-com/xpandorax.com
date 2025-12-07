import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { eq, desc, asc, and } from "drizzle-orm";
import { createDatabase } from "~/db";
import { categories, videos, videoCategories } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { VideoCard } from "~/components/video-card";
import { AdContainer } from "~/components/ads";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import type { AdConfig } from "~/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.category) {
    return [{ title: "Category Not Found - XpandoraX" }];
  }

  return [
    { title: `${data.category.name} Videos - XpandoraX` },
    {
      name: "description",
      content: data.category.description || `Watch ${data.category.name} videos on XpandoraX`,
    },
    { property: "og:title", content: `${data.category.name} - XpandoraX` },
    { property: "og:description", content: data.category.description || "" },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const sort = url.searchParams.get("sort") || "latest";
  const pageSize = 24;

  const db = createDatabase(context.cloudflare.env.DATABASE);
  const { user } = await getSession(request, context);
  const env = context.cloudflare.env;

  // Check premium status
  let isPremium = false;
  if (user?.isPremium) {
    isPremium = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) > new Date()
      : true;
  }

  // Fetch category
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  // Build order by based on sort
  const orderBy = sort === "popular"
    ? desc(videos.views)
    : sort === "oldest"
    ? asc(videos.publishedAt)
    : desc(videos.publishedAt);

  // Fetch videos in this category
  const categoryVideos = await db
    .select({
      video: videos,
    })
    .from(videoCategories)
    .innerJoin(videos, eq(videoCategories.videoId, videos.id))
    .where(
      and(
        eq(videoCategories.categoryId, category.id),
        eq(videos.isPublished, true)
      )
    )
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalPages = Math.ceil(category.videoCount / pageSize);

  // Ad config for non-premium users
  const adConfig: AdConfig | null = isPremium
    ? null
    : {
        exoclickZoneId: env.EXOCLICK_ZONE_ID || "",
        juicyadsZoneId: env.JUICYADS_ZONE_ID || "",
      };

  return json({
    category,
    videos: categoryVideos.map((cv) => cv.video),
    page,
    totalPages,
    sort,
    adConfig,
  });
}

export default function CategoryPage() {
  const { category, videos: categoryVideos, page, totalPages, sort, adConfig } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    searchParams.set("sort", value);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Top Ad Banner */}
      <AdContainer adConfig={adConfig} position="top" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {category.thumbnailUrl ? (
            <img
              src={category.thumbnailUrl}
              alt={category.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              {category.videoCount} videos
            </p>
          </div>
        </div>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {category.description && (
        <p className="text-muted-foreground">{category.description}</p>
      )}

      {/* Videos Grid */}
      {categoryVideos.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 stagger-children">
          {categoryVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No videos found</h3>
          <p className="text-muted-foreground">
            This category doesn&apos;t have any videos yet.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            asChild={page > 1}
          >
            {page > 1 ? (
              <Link to={`?page=${page - 1}&sort=${sort}`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            )}
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            asChild={page < totalPages}
          >
            {page < totalPages ? (
              <Link to={`?page=${page + 1}&sort=${sort}`}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Bottom Ad Banner */}
      <AdContainer adConfig={adConfig} position="bottom" />
    </div>
  );
}
