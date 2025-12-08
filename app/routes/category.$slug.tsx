import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { createSanityClient, getSlug, type SanityCategory, type SanityVideo } from "~/lib/sanity";

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
  const offset = (page - 1) * pageSize;

  const env = context.cloudflare.env;

  // Create Sanity client
  const sanity = createSanityClient(env);

  // Build order by based on sort
  const orderBy = sort === "popular"
    ? "views desc"
    : sort === "oldest"
    ? "publishedAt asc"
    : "publishedAt desc";

  // Fetch category with videos from Sanity
  const categoryRaw = await sanity.fetch<(SanityCategory & { videos: SanityVideo[] }) | null>(
    `*[_type == "category" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      "thumbnail": thumbnail.asset->url,
      "videoCount": count(*[_type == "video" && references(^._id) && isPublished == true]),
      "videos": *[_type == "video" && references(^._id) && isPublished == true] | order(${orderBy}) [$offset...$end] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        "previewVideo": previewVideo.asset->url,
        duration,
        views,
        isPremium
      }
    }`,
    { slug, offset, end: offset + pageSize }
  );

  if (!categoryRaw) {
    throw new Response("Not Found", { status: 404 });
  }

  const totalPages = Math.ceil((categoryRaw.videoCount || 0) / pageSize);

  // Transform data
  const category = {
    id: categoryRaw._id,
    slug: getSlug(categoryRaw.slug),
    name: categoryRaw.name,
    description: categoryRaw.description || null,
    thumbnailUrl: categoryRaw.thumbnail || null,
    videoCount: categoryRaw.videoCount || 0,
  };

  const categoryVideos = (categoryRaw.videos || []).map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
  }));

  return json({
    category,
    videos: categoryVideos,
    page,
    totalPages,
    sort,
  });
}

export default function CategoryPage() {
  const { category, videos: categoryVideos, page, totalPages, sort } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSortChange = (value: string) => {
    searchParams.set("sort", value);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  return (
    <div className="container py-6 space-y-6">
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
    </div>
  );
}
