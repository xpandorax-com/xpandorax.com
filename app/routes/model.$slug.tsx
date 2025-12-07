import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { eq, desc, sql } from "drizzle-orm";
import { createDatabase } from "~/db";
import { actresses, videos, videoActresses } from "~/db/schema";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Users, Video, Calendar, ArrowLeft } from "lucide-react";
import { formatDate } from "~/lib/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.actress) {
    return [
      { title: "Model Not Found - XpandoraX" },
      { name: "description", content: "This model could not be found." },
    ];
  }

  return [
    { title: `${data.actress.name} - XpandoraX` },
    {
      name: "description",
      content: data.actress.bio || `Watch videos featuring ${data.actress.name} on XpandoraX.`,
    },
    { property: "og:title", content: `${data.actress.name} - XpandoraX` },
    { property: "og:image", content: data.actress.image || "" },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const db = createDatabase(context.cloudflare.env.DATABASE);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  // Get actress
  const actress = await db.query.actresses.findFirst({
    where: eq(actresses.slug, slug),
  });

  if (!actress) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get videos for this actress using the junction table
  const actressVideos = await db
    .select({
      id: videos.id,
      slug: videos.slug,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      isPremium: videos.isPremium,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .innerJoin(videoActresses, eq(videos.id, videoActresses.videoId))
    .where(eq(videoActresses.actressId, actress.id))
    .orderBy(desc(videos.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .innerJoin(videoActresses, eq(videos.id, videoActresses.videoId))
    .where(eq(videoActresses.actressId, actress.id));

  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return json({
    actress,
    videos: actressVideos,
    total,
    page,
    totalPages,
  });
}

export default function ModelDetailPage() {
  const data = useLoaderData<typeof loader>();
  const { actress, videos: actressVideos, total, page, totalPages } = data;

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <a href="/models">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </a>
      </Button>

      {/* Model Profile */}
      <div className="mb-8 flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-primary/20 mx-auto md:mx-0">
            {actress.image ? (
              <img
                src={actress.image}
                alt={actress.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Users className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{actress.name}</h1>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
            <Badge variant="secondary" className="text-sm">
              <Video className="mr-1 h-4 w-4" />
              {total} Videos
            </Badge>
            {actress.createdAt && (
              <Badge variant="outline" className="text-sm">
                <Calendar className="mr-1 h-4 w-4" />
                Added {formatDate(actress.createdAt)}
              </Badge>
            )}
          </div>

          {actress.bio && (
            <>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">{actress.bio}</p>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Videos Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Videos featuring {actress.name}
        </h2>

        {actressVideos.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {actressVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <a href={`/model/${actress.slug}?page=${page - 1}`}>
                      Previous
                    </a>
                  </Button>
                )}
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" asChild>
                    <a href={`/model/${actress.slug}?page=${page + 1}`}>Next</a>
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No videos available yet for {actress.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
