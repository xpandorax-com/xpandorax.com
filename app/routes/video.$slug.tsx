import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { videos, videoCategories, categories, actresses } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { VideoPlayer, VideoPlayerWithAds } from "~/components/video-player";
import { VideoCard } from "~/components/video-card";
import { AdContainer } from "~/components/ads";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Eye,
  ThumbsUp,
  Clock,
  User,
  Crown,
  Lock,
  ChevronRight,
} from "lucide-react";
import { formatDuration, formatViews, formatDate } from "~/lib/utils";
import type { AdConfig } from "~/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.video) {
    return [{ title: "Video Not Found - XpandoraX" }];
  }

  return [
    { title: `${data.video.title} - XpandoraX` },
    { name: "description", content: data.video.description || data.video.title },
    { property: "og:title", content: data.video.title },
    { property: "og:description", content: data.video.description || "" },
    { property: "og:type", content: "video.other" },
    { property: "og:image", content: data.video.thumbnail || "" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const db = createDatabase(context.cloudflare.env.DB);
  const { user } = await getSession(request, context);
  const env = context.cloudflare.env;

  // Check premium status
  let isPremium = false;
  if (user?.isPremium) {
    isPremium = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) > new Date()
      : true;
  }

  // Fetch video with relations
  const video = await db.query.videos.findFirst({
    where: eq(videos.slug, slug),
    with: {
      actress: true,
    },
  });

  if (!video) {
    throw new Response("Not Found", { status: 404 });
  }

  // Check if video is premium only and user is not premium
  const canWatch = !video.isPremium || isPremium;

  // Fetch video categories
  const videoCats = await db
    .select({
      category: categories,
    })
    .from(videoCategories)
    .innerJoin(categories, eq(videoCategories.categoryId, categories.id))
    .where(eq(videoCategories.videoId, video.id));

  // Increment view count
  await db
    .update(videos)
    .set({ views: video.views + 1 })
    .where(eq(videos.id, video.id));

  // Fetch related videos (same actress or category)
  const relatedVideos = await db.query.videos.findMany({
    where: eq(videos.isPublished, true),
    limit: 6,
    with: {
      actress: true,
    },
  });

  // Ad config for non-premium users
  const adConfig: AdConfig | null = isPremium
    ? null
    : {
        exoclickZoneId: env.EXOCLICK_ZONE_ID || "",
        juicyadsZoneId: env.JUICYADS_ZONE_ID || "",
      };

  return json({
    video: {
      ...video,
      categories: videoCats.map((vc) => vc.category),
    },
    relatedVideos: relatedVideos.filter((v) => v.id !== video.id),
    canWatch,
    isPremium,
    adConfig,
  });
}

export default function VideoPage() {
  const { video, relatedVideos, canWatch, isPremium, adConfig } =
    useLoaderData<typeof loader>();

  return (
    <div className="container py-6">
      {/* Top Ad Banner */}
      <AdContainer adConfig={adConfig} position="top" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          {canWatch ? (
            adConfig ? (
              // Non-premium users see Plyr player with ad support
              <VideoPlayerWithAds
                embedUrl={video.abyssEmbed}
                thumbnailUrl={video.thumbnail}
                title={video.title}
                adConfig={{
                  prerollEnabled: true,
                  overlayEnabled: false,
                  exoclickZoneId: adConfig.exoclickZoneId,
                  juicyadsZoneId: adConfig.juicyadsZoneId,
                }}
              />
            ) : (
              // Premium users see clean Plyr player without ads
              <VideoPlayer
                embedUrl={video.abyssEmbed}
                thumbnailUrl={video.thumbnail}
                title={video.title}
              />
            )
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover opacity-30 blur-sm"
                />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-6 text-center">
                <Lock className="h-16 w-16 text-primary" />
                <h3 className="text-xl font-bold">Premium Content</h3>
                <p className="text-muted-foreground max-w-md">
                  This video is available exclusively for premium members.
                  Upgrade your account to watch this and all other premium content.
                </p>
                <Button asChild variant="premium" size="lg">
                  <Link to="/premium">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Video Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{video.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatViews(video.views)} views
                  </span>
                  {video.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {formatViews(video.likes)} likes
                  </span>
                  {video.publishedAt && (
                    <span>{formatDate(video.publishedAt)}</span>
                  )}
                </div>
              </div>
              {video.premiumOnly && (
                <Badge variant="premium" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Actress */}
            {video.actress && (
              <Link
                to={`/actress/${video.actress.slug}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                {video.actress.thumbnailUrl ? (
                  <img
                    src={video.actress.thumbnailUrl}
                    alt={video.actress.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{video.actress.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {video.actress.videoCount} videos
                  </p>
                </div>
              </Link>
            )}

            {/* Categories */}
            {video.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {video.categories.map((category) => (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            {video.description && (
              <>
                <Separator />
                <p className="text-muted-foreground">{video.description}</p>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sidebar Ad */}
          <AdContainer adConfig={adConfig} position="sidebar" />

          {/* Related Videos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Related Videos</h3>
              <Link
                to="/videos"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                View all <ChevronRight className="inline h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ad Banner */}
      <AdContainer adConfig={adConfig} position="bottom" />
    </div>
  );
}
