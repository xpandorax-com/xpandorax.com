import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { VideoPlayer, ServerSelector, type VideoServer, type DownloadLink } from "~/components/video-player";
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
  Download,
} from "lucide-react";
import { formatDuration, formatViews, formatDate, cn } from "~/lib/utils";
import { createSanityClient, getSlug, type SanityVideo } from "~/lib/sanity";
import { useViewTracker } from "~/lib/view-tracker";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { contentViews } from "~/db/schema";
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

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const env = context.cloudflare.env;

  try {
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
        downloadLinks,
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

    // Fetch view count from D1 database (with error handling)
    let viewCount = 0;
    try {
      if (env.DB) {
        const db = drizzle(env.DB);
        const viewResult = await db
          .select({ views: contentViews.views })
          .from(contentViews)
          .where(
            and(
              eq(contentViews.contentId, videoRaw._id),
              eq(contentViews.contentType, "video")
            )
          )
          .limit(1);
        viewCount = viewResult[0]?.views || 0;
      }
    } catch (dbError) {
      console.error("D1 database error:", dbError);
      // Continue with viewCount = 0
    }

    // Fetch related videos from Sanity
    const relatedVideosRaw = await sanity.fetch<SanityVideo[]>(
      `*[_type == "video" && isPublished == true && _id != $videoId] | order(publishedAt desc)[0...6] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        duration,
        "actress": actress->{
          name
        }
      }`,
      { videoId: videoRaw._id }
    );

    // Fetch related pictures from Sanity (based on same actress or categories)
    const categoryIds = videoRaw.categories?.map(c => c._id) || [];
    const actressId = videoRaw.actress?._id;
    
    const relatedPicturesRaw = await sanity.fetch<any[]>(
      `*[_type == "picture" && isPublished == true && (
        actress._ref == $actressId || 
        count((categories[]._ref)[@ in $categoryIds]) > 0
      )] | order(publishedAt desc)[0...4] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        "imageCount": count(images),
        "actress": actress->{
          name
        }
      }`,
      { actressId: actressId || "", categoryIds }
    );

    // Transform data
    const video = {
      id: videoRaw._id,
      slug: getSlug(videoRaw.slug),
      title: videoRaw.title,
      description: videoRaw.description || null,
      thumbnail: videoRaw.thumbnail || null,
      duration: videoRaw.duration || null,
      views: viewCount,
      abyssEmbed: videoRaw.abyssEmbed || "",
      servers: (videoRaw.servers || []).map((s: { name: string; url: string }) => ({
        name: s.name,
        url: s.url,
      })) as VideoServer[],
      downloadLinks: (videoRaw.downloadLinks || []).map((d: { name: string; url: string }) => ({
        name: d.name,
        url: d.url,
      })) as DownloadLink[],
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

    const relatedPictures = relatedPicturesRaw.map((p) => ({
      id: p._id,
      slug: getSlug(p.slug),
      title: p.title,
      thumbnail: p.thumbnail || null,
      imageCount: p.imageCount || 0,
      actress: p.actress ? { name: p.actress.name } : null,
    }));

    return json({
      video,
      relatedVideos,
      relatedPictures,
    });
  } catch (error) {
    console.error("Video loader error:", error);
    throw new Response("Something went wrong", { status: 500 });
  }
}

export default function VideoPage() {
  const { video, relatedVideos, relatedPictures } =
    useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<RootLoaderData>("root");
  const currentUserId = rootData?.user?.id;

  // State for views - moved before the hook so we can update it
  const [views, setViews] = useState(video.views || 0);

  // Track view when page loads and increment local count on success
  useViewTracker({ 
    type: "video", 
    id: video.id, 
    enabled: true,
    onViewCounted: useCallback(() => {
      setViews(prev => prev + 1);
    }, [])
  });

  // Fetcher for like/dislike interactions
  const interactionFetcher = useFetcher();
  const statusFetcher = useFetcher();

  // State for interaction status
  const [userInteraction, setUserInteraction] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  // Update views when video changes (e.g., navigating to another video)
  useEffect(() => {
    setViews(video.views || 0);
  }, [video.id, video.views]);

  // Fetch initial interaction status
  useEffect(() => {
    statusFetcher.load(`/api/video-interaction?videoId=${video.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]); // statusFetcher is stable and doesn't need to be in deps

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
  
  // Get the current embed URL based on selected server
  const currentEmbedUrl = allServers[activeServerIndex]?.url || video.abyssEmbed;

  // Handle server error - auto switch to next server
  const handleServerError = useCallback((failedIndex: number) => {
    const nextIndex = failedIndex + 1;
    if (nextIndex < allServers.length) {
      setActiveServerIndex(nextIndex);
    }
  }, [allServers.length]);

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
            servers={allServers}
            currentServerIndex={activeServerIndex}
            onServerError={handleServerError}
          />

          {/* Server Selector - below video player, above title */}
          <ServerSelector
            servers={allServers}
            activeIndex={activeServerIndex}
            onServerChange={setActiveServerIndex}
          />

          {/* Download Links */}
          {video.downloadLinks.length > 0 && (
            <DownloadLinks links={video.downloadLinks} />
          )}

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

        {/* Sidebar - Related Videos & Pictures */}
        <div className="space-y-4 sm:space-y-6">
          {/* Related Videos */}
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
            {/* Mobile: horizontal scroll, Desktop: vertical list with compact cards */}
            <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              {relatedVideos.map((relatedVideo) => (
                <div key={relatedVideo.id} className="w-[45%] sm:w-[200px] lg:w-full shrink-0 lg:shrink">
                  <VideoCard video={relatedVideo} size="compact" className="hidden lg:flex" />
                  <VideoCard video={relatedVideo} className="lg:hidden" />
                </div>
              ))}
            </div>
          </div>

          {/* Related Pictures */}
          {relatedPictures.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base">
                  Related Pictures
                </h3>
                <Link
                  to="/pictures"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary touch-target"
                >
                  View all <ChevronRight className="inline h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </div>
              {/* Mobile: horizontal scroll, Desktop: grid */}
              <div className="flex lg:grid lg:grid-cols-2 gap-2 sm:gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                {relatedPictures.map((picture) => (
                  <Link
                    key={picture.id}
                    to={`/pictures/${picture.slug}`}
                    className="group w-[45%] sm:w-[150px] lg:w-full shrink-0 lg:shrink"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      {picture.thumbnail ? (
                        <img
                          src={picture.thumbnail}
                          alt={picture.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">No image</span>
                        </div>
                      )}
                      {/* Image count badge */}
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-white">
                        {picture.imageCount}
                      </div>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {picture.title}
                      </p>
                      {picture.actress && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {picture.actress.name}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Download Links Component - displays download options as buttons
 */
interface DownloadLinksProps {
  links: DownloadLink[];
  className?: string;
}

function DownloadLinks({ links, className }: DownloadLinksProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center gap-2", className)}>
      <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground shrink-0">
        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Download:
      </span>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap bg-green-600 text-white hover:bg-green-700 active:bg-green-800 min-h-[36px] sm:min-h-[auto] flex items-center gap-1.5"
          >
            <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
