import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { watchHistory } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { createSanityClient, getSlug, type SanityVideo } from "~/lib/sanity";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import { History, Trash2, X } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Watch History - XpandoraX" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return redirect("/login?redirect=/history");
  }

  const db = drizzle(context.cloudflare.env.DB);
  const sanity = createSanityClient(context.cloudflare.env);
  
  // Get user's watch history
  const history = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, user.id))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(100);

  if (history.length === 0) {
    return json({ videos: [], history: [] });
  }

  // Get video details from Sanity
  const videoIds = history.map(h => h.videoId);
  const videosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && _id in $ids] {
      _id,
      title,
      slug,
      "thumbnail": thumbnail.asset->url,
      "previewVideo": previewVideo.asset->url,
      duration,
      views,
      isPremium
    }`,
    { ids: videoIds }
  );

  // Map videos with history data
  const videoMap = new Map(videosRaw.map(v => [v._id, v]));
  const videos = history
    .map(h => {
      const video = videoMap.get(h.videoId);
      if (!video) return null;
      return {
        id: video._id,
        slug: getSlug(video.slug),
        title: video.title,
        thumbnail: video.thumbnail || null,
        previewVideo: video.previewVideo || null,
        duration: video.duration || null,
        views: video.views || 0,
        watchedAt: h.watchedAt,
        lastPosition: h.lastPosition,
        completed: h.completed,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return json({ videos });
}

export default function HistoryPage() {
  const { videos } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your watch history?")) {
      fetcher.submit(
        { action: "clear", videoId: "" },
        { method: "POST", action: "/api/watch-history" }
      );
    }
  };

  const handleRemoveItem = (videoId: string) => {
    fetcher.submit(
      { action: "remove", videoId },
      { method: "POST", action: "/api/watch-history" }
    );
  };

  // Filter out null values
  const validVideos = videos.filter((v): v is NonNullable<typeof v> => v !== null);

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 sm:h-6 sm:w-6" />
            Watch History
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            {validVideos.length} {validVideos.length === 1 ? "video" : "videos"} in history
          </p>
        </div>

        {validVideos.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearHistory}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {/* Video Grid */}
      {validVideos.length > 0 ? (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {validVideos.map((video) => (
            <div key={video.id} className="relative group">
              <VideoCard
                video={{
                  id: video.id,
                  slug: video.slug,
                  title: video.title,
                  thumbnail: video.thumbnail,
                  duration: video.duration,
                  views: video.views,
                }}
              />
              <button
                onClick={() => handleRemoveItem(video.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                title="Remove from history"
              >
                <X className="h-4 w-4" />
              </button>
              {video.lastPosition && video.lastPosition > 0 && !video.completed && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(100, (video.lastPosition / (video.duration || 1)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No watch history</h2>
          <p className="text-muted-foreground mb-6">
            Videos you watch will appear here.
          </p>
          <Button asChild>
            <Link to="/videos">Browse Videos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
