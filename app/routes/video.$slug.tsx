import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { VideoPlayer, ServerSelector, type VideoServer } from "~/components/video-player";
import { VideoCard } from "~/components/video-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Comments } from "~/components/comments";
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { formatDuration, formatViews, formatDate } from "~/lib/utils";
import { createSanityClient, getSlug, type SanityVideo } from "~/lib/sanity";
import { useViewTracker } from "~/lib/view-tracker";
import type { RootLoaderData } from "~/types";

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

  const env = context.cloudflare.env;

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

  // Fetch related videos from Sanity
  const relatedVideosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && isPublished == true && _id != $videoId] | order(publishedAt desc)[0...6] {
      _id,
      title,
      slug,
      "thumbnail": thumbnail.asset->url,
      "previewVideo": previewVideo.asset->url,
      duration,
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
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    actress: v.actress ? { name: v.actress.name } : null,
  }));

  return json({
    video,
    relatedVideos,
  });
}

export default function VideoPage() {
  const { video, relatedVideos } =
    useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoaderData>("root");
  const currentUserId = rootData?.user?.id;

  // Track view when page loads
  useViewTracker({ type: "video", id: video.id, enabled: true });

  // Fetcher for like/dislike interactions
  const interactionFetcher = useFetcher();
  const statusFetcher = useFetcher();

  // State for interaction status
  const [userInteraction, setUserInteraction] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [views, setViews] = useState(0);

  // Fetch initial interaction status
  useEffect(() => {
    statusFetcher.load(`/api/video-interaction?videoId=${video.id}`);
  }, [video.id]);

  // Update state when status is fetched
  useEffect(() => {
    if (statusFetcher.data) {
      const data = statusFetcher.data as { userInteraction: "like" | "dislike" | null; likes: number; dislikes: number };
      setUserInteraction(data.userInteraction);
      setLikes(data.likes || 0);
      setDislikes(data.dislikes || 0);
    }
  }, [statusFetcher.data]);

  // Handle like/dislike click
  const handleInteraction = (action: "like" | "dislike") => {
    // Optimistic update
    if (userInteraction === action) {
      // Toggling off
      setUserInteraction(null);
      if (action === "like") setLikes((prev) => Math.max(0, prev - 1));
      else setDislikes((prev) => Math.max(0, prev - 1));
    } else if (userInteraction) {
      // Changing from one to another
      setUserInteraction(action);
      if (action === "like") {
        setLikes((prev) => prev + 1);
        setDislikes((prev) => Math.max(0, prev - 1));
      } else {
        setDislikes((prev) => prev + 1);
        setLikes((prev) => Math.max(0, prev - 1));
      }
    } else {
      // New interaction
      setUserInteraction(action);
      if (action === "like") setLikes((prev) => prev + 1);
      else setDislikes((prev) => prev + 1);
    }

    // Submit to API
    interactionFetcher.submit(
      { videoId: video.id, action },
      { method: "post", action: "/api/video-interaction" }
    );
  };

  // Build all available servers (primary + additional)
  const allServers: VideoServer[] = [
    { name: "Server 1", url: video.abyssEmbed },
    ...video.servers,
  ];
  
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const currentEmbedUrl = allServers[activeServerIndex]?.url || video.abyssEmbed;

  return (
    <div className="container py-3 sm:py-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Video Player */}
          <VideoPlayer
            embedUrl={currentEmbedUrl}
            thumbnailUrl={video.thumbnail}
            title={video.title}
          />

          {/* Server Selector - below video player, above title */}
          <ServerSelector
            servers={allServers}
            activeIndex={activeServerIndex}
            onServerChange={setActiveServerIndex}
          />

          {/* Video Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold break-words">{video.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {formatViews(views)} views
                  </span>
                  {video.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {formatDuration(video.duration)}
                    </span>
                  )}
                  {video.publishedAt && (
                    <span className="hidden xs:inline">{formatDate(video.publishedAt)}</span>
                  )}
                </div>
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={userInteraction === "like" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInteraction("like")}
                  className="flex items-center gap-1.5 sm:gap-2 touch-target h-9 sm:h-8 px-3"
                >
                  <ThumbsUp className={`h-4 w-4 ${userInteraction === "like" ? "fill-current" : ""}`} />
                  <span className="text-sm">{formatViews(likes)}</span>
                </Button>
                <Button
                  variant={userInteraction === "dislike" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleInteraction("dislike")}
                  className="flex items-center gap-1.5 sm:gap-2 touch-target h-9 sm:h-8 px-3"
                >
                  <ThumbsDown className={`h-4 w-4 ${userInteraction === "dislike" ? "fill-current" : ""}`} />
                  <span className="text-sm">{formatViews(dislikes)}</span>
                </Button>
              </div>
            </div>

            {/* Actress */}
            {video.actress && (
              <Link
                to={`/model/${video.actress.slug}`}
                className="flex items-center gap-3 rounded-lg border p-2.5 sm:p-3 transition-colors hover:bg-accent active:bg-accent touch-target"
              >
                {video.actress.thumbnailUrl ? (
                  <img
                    src={video.actress.thumbnailUrl}
                    alt={video.actress.name}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{video.actress.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {video.actress.videoCount} videos
                  </p>
                </div>
              </Link>
            )}

            {/* Categories */}
            {video.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {video.categories.map((category) => (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 text-xs sm:text-sm py-1 px-2 sm:py-1 sm:px-2.5">
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
                <p className="text-sm sm:text-base text-muted-foreground">{video.description}</p>
              </>
            )}

            {/* Comments Section */}
            <Comments videoId={video.id} currentUserId={currentUserId} />
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm sm:text-base">Related Videos</h3>
              <Link
                to="/videos"
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary touch-target"
              >
                View all <ChevronRight className="inline h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </div>
            {/* Mobile: horizontal scroll, Desktop: vertical grid */}
            <div className="flex lg:grid gap-2 sm:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {relatedVideos.map((relatedVideo) => (
                <div key={relatedVideo.id} className="w-[45%] sm:w-[200px] lg:w-auto shrink-0 lg:shrink">
                  <VideoCard video={relatedVideo} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
