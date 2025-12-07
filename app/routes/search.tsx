import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, Form } from "@remix-run/react";
import { like, or, desc, eq, sql } from "drizzle-orm";
import { createDatabase } from "~/db";
import { videos, actresses, categories } from "~/db/schema";
import { getOptionalUser } from "~/lib/auth";
import { VideoCard } from "~/components/video-card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Search, Video, Users, Folder, X } from "lucide-react";
import { cn } from "~/lib/utils";

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

  const db = createDatabase(context.cloudflare.env.DB);
  const searchTerm = `%${query.toLowerCase()}%`;

  // Search videos
  const [videoResults, videoCountResult] = await Promise.all([
    type === "videos"
      ? db
          .select()
          .from(videos)
          .where(
            or(
              sql`lower(${videos.title}) like ${searchTerm}`,
              sql`lower(${videos.description}) like ${searchTerm}`
            )
          )
          .orderBy(desc(videos.createdAt))
          .limit(limit)
          .offset(offset)
      : Promise.resolve([]),
    db
      .select({ count: sql<number>`count(*)` })
      .from(videos)
      .where(
        or(
          sql`lower(${videos.title}) like ${searchTerm}`,
          sql`lower(${videos.description}) like ${searchTerm}`
        )
      ),
  ]);

  // Search actresses
  const [actressResults, actressCountResult] = await Promise.all([
    type === "actresses"
      ? db
          .select()
          .from(actresses)
          .where(
            or(
              sql`lower(${actresses.name}) like ${searchTerm}`,
              sql`lower(${actresses.bio}) like ${searchTerm}`
            )
          )
          .orderBy(actresses.name)
          .limit(limit)
          .offset(offset)
      : Promise.resolve([]),
    db
      .select({ count: sql<number>`count(*)` })
      .from(actresses)
      .where(
        or(
          sql`lower(${actresses.name}) like ${searchTerm}`,
          sql`lower(${actresses.bio}) like ${searchTerm}`
        )
      ),
  ]);

  // Search categories
  const [categoryResults, categoryCountResult] = await Promise.all([
    type === "categories"
      ? db
          .select()
          .from(categories)
          .where(
            or(
              sql`lower(${categories.name}) like ${searchTerm}`,
              sql`lower(${categories.description}) like ${searchTerm}`
            )
          )
          .orderBy(categories.name)
          .limit(limit)
          .offset(offset)
      : Promise.resolve([]),
    db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(
        or(
          sql`lower(${categories.name}) like ${searchTerm}`,
          sql`lower(${categories.description}) like ${searchTerm}`
        )
      ),
  ]);

  const totalVideos = videoCountResult[0]?.count || 0;
  const totalActresses = actressCountResult[0]?.count || 0;
  const totalCategories = categoryCountResult[0]?.count || 0;

  const currentTotal =
    type === "videos"
      ? totalVideos
      : type === "actresses"
      ? totalActresses
      : totalCategories;

  return json({
    query,
    type,
    videos: videoResults,
    actresses: actressResults,
    categories: categoryResults,
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
    <div className="container py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <Form method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={data.query}
              placeholder="Search videos, models, categories..."
              className="pl-10"
            />
          </div>
          <input type="hidden" name="type" value={data.type} />
          <Button type="submit">Search</Button>
          {data.query && (
            <Button variant="outline" asChild>
              <a href="/search">
                <X className="h-4 w-4" />
              </a>
            </Button>
          )}
        </Form>
      </div>

      {data.query ? (
        <>
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found{" "}
              <span className="font-medium text-foreground">
                {data.totalVideos + data.totalActresses + data.totalCategories}
              </span>{" "}
              results for &quot;<span className="font-medium text-foreground">{data.query}</span>&quot;
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={data.type} onValueChange={handleTypeChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos
                <Badge variant="secondary" className="ml-1">
                  {data.totalVideos}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="actresses" className="gap-2">
                <Users className="h-4 w-4" />
                Models
                <Badge variant="secondary" className="ml-1">
                  {data.totalActresses}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Folder className="h-4 w-4" />
                Categories
                <Badge variant="secondary" className="ml-1">
                  {data.totalCategories}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Videos Results */}
            <TabsContent value="videos">
              {data.videos.length > 0 ? (
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
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {data.actresses.map((actress) => (
                    <a
                      key={actress.id}
                      href={`/model/${actress.slug}`}
                      className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                    >
                      <div className="aspect-square overflow-hidden rounded-full mb-3">
                        {actress.image ? (
                          <img
                            src={actress.image}
                            alt={actress.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Users className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-center truncate group-hover:text-primary">
                        {actress.name}
                      </h3>
                      <p className="text-xs text-center text-muted-foreground">
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
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {data.categories.map((category) => (
                    <a
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="group rounded-lg border bg-card overflow-hidden transition-colors hover:bg-accent"
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
                            <Folder className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate group-hover:text-primary">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
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

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {data.page > 1 && (
                <Button variant="outline" asChild>
                  <a
                    href={`/search?q=${encodeURIComponent(data.query)}&type=${data.type}&page=${data.page - 1}`}
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
        <div className="text-center py-16">
          <Search className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Start Searching</h2>
          <p className="mt-2 text-muted-foreground">
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
