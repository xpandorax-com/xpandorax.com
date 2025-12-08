import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/lib/auth";
import { VideoPlayer, ServerSelector, type VideoServer } from "~/components/video-player";
import { VideoCard } from "~/components/video-card";
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
import { createSanityClient, getSlug, type SanityVideo, type SanityCategory } from "~/lib/sanity";
import { useViewTracker } from "~/lib/view-tracker";

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

  const { user } = await getSession(request, context);
  const env = context.cloudflare.env;

  // Check premium status
  let isPremium = false;
  if (user?.isPremium) {
    isPremium = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) > new Date()
      : true;
  }

  // Create Sanity client
  const sanity = createSanityClient(env);

  // Fetch video from Sanity
  const videoRaw = await sanity.fetch<SanityVideo | null>(
    `*[_type == "video" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      "thumbnail": thumbnail.asset->url,
      duration,
      views,
      likes,
      isPremium,
      abyssEmbed,
      servers,
      publishedAt,
      "actress": actress->{
        _id,
        name,
        slug,
        "image": image.asset->url,
        "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
      },
      "categories": categories[]->{
        _id,
        name,
        slug
      }
    }`,
    { slug }
  );

  if (!videoRaw) {
    throw new Response("Not Found", { status: 404 });
  }

  // Check if video is premium only and user is not premium
  const canWatch = !videoRaw.isPremium || isPremium;

  // Fetch related videos from Sanity
  const relatedVideosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && isPublished == true && _id != $videoId] | order(publishedAt desc)[0...6] {
      _id,
      title,
      slug,
      "thumbnail": thumbnail.asset->url,
      duration,
      views,
      isPremium,
      "actress": actress->{
        name
      }
    }`,
    { videoId: videoRaw._id }
  );

  // Transform data
  const video = {
    id: videoRaw._id,
    slug: getSlug(videoRaw.slug),
    title: videoRaw.title,
    description: videoRaw.description || null,
    thumbnail: videoRaw.thumbnail || null,
    duration: videoRaw.duration || null,
    views: videoRaw.views || 0,
    likes: videoRaw.likes || 0,
    isPremium: videoRaw.isPremium || false,
    premiumOnly: videoRaw.isPremium || false,
    abyssEmbed: videoRaw.abyssEmbed || "",
    servers: (videoRaw.servers || []).map((s: { name: string; url: string }) => ({
      name: s.name,
      url: s.url,
    })) as VideoServer[],
    publishedAt: videoRaw.publishedAt || null,
    actress: videoRaw.actress ? {
      id: videoRaw.actress._id,
      name: videoRaw.actress.name,
      slug: getSlug(videoRaw.actress.slug),
      thumbnailUrl: videoRaw.actress.image || null,
      videoCount: videoRaw.actress.videoCount || 0,
    } : null,
    categories: (videoRaw.categories || []).map((c) => ({
      id: c._id,
      name: c.name,
      slug: getSlug(c.slug),
    })),
  };

  const relatedVideos = relatedVideosRaw.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
    actress: v.actress ? { name: v.actress.name } : null,
  }));

  return json({
    video,
    relatedVideos,
    canWatch,
    isPremium,
  });
}

export default function VideoPage() {
  const { video, relatedVideos, canWatch, isPremium } =
    useLoaderData<typeof loader>();

  // Track video view when page loads
  useViewTracker({ type: "video", id: video.id, enabled: canWatch });

  // Build all available servers (primary + additional)
  const allServers: VideoServer[] = [
    { name: "Server 1", url: video.abyssEmbed },
    ...video.servers,
  ];
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const currentEmbedUrl = allServers[activeServerIndex]?.url || video.abyssEmbed;

  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          {canWatch ? (
            <VideoPlayer
              embedUrl={currentEmbedUrl}
              thumbnailUrl={video.thumbnail}
              title={video.title}
            />
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

          {/* Server Selector - below video player, above title */}
          {canWatch && (
            <ServerSelector
              servers={allServers}
              activeIndex={activeServerIndex}
              onServerChange={setActiveServerIndex}
            />
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
    </div>
  );
}
