import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Search, Video, Users, Folder, X } from "lucide-react";
import { createSanityClient, getSlug, type SanityVideo, type SanityActress, type SanityCategory } from "~/lib/sanity";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const query = data?.query || "";
  return [
    { title: query ? `Search: ${query} - XpandoraX` : "Search - XpandoraX" },
    { name: "description", content: `Search results for "${query}" on XpandoraX.` },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const type = url.searchParams.get("type") || "videos";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  if (!query) {
    return json({
      query: "",
      type,
      videos: [],
      actresses: [],
      categories: [],
      totalVideos: 0,
      totalActresses: 0,
      totalCategories: 0,
      page,
      totalPages: 0,
    });
  }

  const sanity = createSanityClient(context.cloudflare.env);

  // Search videos
  const [videoResults, totalVideos] = await Promise.all([
    type === "videos"
      ? sanity.fetch<SanityVideo[]>(
          `*[_type == "video" && isPublished == true && (title match "${query}*" || description match "${query}*")] | order(publishedAt desc) [${offset}...${offset + limit}] {
            _id,
            title,
            slug,
            "thumbnail": thumbnail.asset->url,
            "previewVideo": previewVideo.asset->url,
            duration,
            views,
            isPremium
          }`
        )
      : Promise.resolve([]),
    type === "videos"
      ? sanity.fetch<number>(
          `count(*[_type == "video" && isPublished == true && (title match "${query}*" || description match "${query}*")])`
        )
      : Promise.resolve(0),
  ]);

  // Search actresses/models
  const [actressResults, totalActresses] = await Promise.all([
    type === "actresses"
      ? sanity.fetch<(SanityActress & { videoCount: number })[]>(
          `*[_type == "actress" && (name match "${query}*" || bio match "${query}*")] | order(name asc) [${offset}...${offset + limit}] {
            _id,
            name,
            slug,
            "image": image.asset->url,
            "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
          }`
        )
      : Promise.resolve([]),
    type === "actresses"
      ? sanity.fetch<number>(
          `count(*[_type == "actress" && (name match "${query}*" || bio match "${query}*")])`
        )
      : Promise.resolve(0),
  ]);

  // Search categories
  const [categoryResults, totalCategories] = await Promise.all([
    type === "categories"
      ? sanity.fetch<(SanityCategory & { videoCount: number })[]>(
          `*[_type == "category" && (name match "${query}*" || description match "${query}*")] | order(name asc) [${offset}...${offset + limit}] {
            _id,
            name,
            slug,
            "thumbnail": thumbnail.asset->url,
            "videoCount": count(*[_type == "video" && references(^._id) && isPublished == true])
          }`
        )
      : Promise.resolve([]),
    type === "categories"
      ? sanity.fetch<number>(
          `count(*[_type == "category" && (name match "${query}*" || description match "${query}*")])`
        )
      : Promise.resolve(0),
  ]);

  // Transform data
  const videos = videoResults.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
  }));

  const actresses = actressResults.map((a) => ({
    id: a._id,
    slug: getSlug(a.slug),
    name: a.name,
    image: a.image || null,
    videoCount: a.videoCount || 0,
  }));

  const categories = categoryResults.map((c) => ({
    id: c._id,
    slug: getSlug(c.slug),
    name: c.name,
    thumbnail: c.thumbnail || null,
    videoCount: c.videoCount || 0,
  }));

  const currentTotal =
    type === "videos"
      ? totalVideos
      : type === "actresses"
      ? totalActresses
      : totalCategories;

  return json({
    query,
    type,
    videos,
    actresses,
    categories,
    totalVideos,
    totalActresses,
    totalCategories,
    page,
    totalPages: Math.ceil(currentTotal / limit),
  });
}

export default function SearchPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", newType);
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="container-responsive py-4 sm:py-8">
      {/* Search Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Search</h1>
        <Form method="get" className="flex flex-col xs:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={data.query}
              placeholder="Search videos, models, categories..."
              className="pl-10 h-12 xs:h-10 text-base xs:text-sm"
            />
          </div>
          <input type="hidden" name="type" value={data.type} />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 xs:flex-initial h-12 xs:h-10 touch-target">
              Search
            </Button>
            {data.query && (
              <Button variant="outline" asChild className="h-12 xs:h-10 touch-target">
                <a href="/search">
                  <X className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </Form>
      </div>

      {data.query ? (
        <>
          {/* Results Summary */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              Found{" "}
              <span className="font-medium text-foreground">
                {data.totalVideos + data.totalActresses + data.totalCategories}
              </span>{" "}
              results for &quot;<span className="font-medium text-foreground">{data.query}</span>&quot;
            </p>
          </div>

          {/* Tabs - Mobile optimized */}
          <Tabs value={data.type} onValueChange={handleTypeChange}>
            <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:inline-flex h-auto p-1">
              <TabsTrigger value="videos" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 flex-col xs:flex-row">
                <Video className="h-4 w-4" />
                <span className="hidden xs:inline">Videos</span>
                <Badge variant="secondary" className="ml-0 xs:ml-1 text-xs">
                  {data.totalVideos}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="actresses" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 flex-col xs:flex-row">
                <Users className="h-4 w-4" />
                <span className="hidden xs:inline">Models</span>
                <Badge variant="secondary" className="ml-0 xs:ml-1 text-xs">
                  {data.totalActresses}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 flex-col xs:flex-row">
                <Folder className="h-4 w-4" />
                <span className="hidden xs:inline">Categories</span>
                <Badge variant="secondary" className="ml-0 xs:ml-1 text-xs">
                  {data.totalCategories}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Videos Results */}
            <TabsContent value="videos">
              {data.videos.length > 0 ? (
                <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
              ) : (
                <EmptyState
                  icon={Video}
                  title="No videos found"
                  description={`No videos matching "${data.query}"`}
                />
              )}
            </TabsContent>

            {/* Actresses Results */}
            <TabsContent value="actresses">
              {data.actresses.length > 0 ? (
                <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {data.actresses.map((actress) => (
                    <a
                      key={actress.id}
                      href={`/model/${actress.slug}`}
                      className="group rounded-lg border bg-card p-2 sm:p-4 transition-colors hover:bg-accent touch-manipulation"
                    >
                      <div className="aspect-square overflow-hidden rounded-full mb-2 sm:mb-3">
                        {actress.image ? (
                          <img
                            src={actress.image}
                            alt={actress.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-center truncate text-xs sm:text-sm group-hover:text-primary">
                        {actress.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                        {actress.videoCount || 0} videos
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No models found"
                  description={`No models matching "${data.query}"`}
                />
              )}
            </TabsContent>

            {/* Categories Results */}
            <TabsContent value="categories">
              {data.categories.length > 0 ? (
                <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {data.categories.map((category) => (
                    <a
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="group rounded-lg border bg-card overflow-hidden transition-colors hover:bg-accent touch-manipulation"
                    >
                      <div className="aspect-video">
                        {category.thumbnail ? (
                          <img
                            src={category.thumbnail}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Folder className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-4">
                        <h3 className="font-medium truncate text-xs sm:text-sm group-hover:text-primary">
                          {category.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {category.videoCount || 0} videos
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Folder}
                  title="No categories found"
                  description={`No categories matching "${data.query}"`}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination - Mobile optimized */}
          {data.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row items-center justify-center gap-2">
              {data.page > 1 && (
                <Button variant="outline" asChild className="w-full xs:w-auto touch-target">
                  <a
                    href={`/search?q=${encodeURIComponent(data.query)}&type=${data.type}&page=${data.page - 1}`}
                  >
                    Previous
                  </a>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground order-first xs:order-none">
                Page {data.page} of {data.totalPages}
              </span>
              {data.page < data.totalPages && (
                <Button variant="outline" asChild className="w-full xs:w-auto touch-target">
                  <a
                    href={`/search?q=${encodeURIComponent(data.query)}&type=${data.type}&page=${data.page + 1}`}
                  >
                    Next
                  </a>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <Search className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
          <h2 className="mt-4 text-lg sm:text-xl font-semibold">Start Searching</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Enter a search term to find videos, models, and categories.
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
