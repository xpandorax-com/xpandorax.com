import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc } from "drizzle-orm";
import { bookmarks } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { createSanityClient, getSlug, type SanityVideo } from "~/lib/sanity";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import { Bookmark, Heart, X } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "My Bookmarks - XpandoraX" },
    { name: "robots", content: "noindex" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);
  
  if (!user) {
    return redirect("/login?redirect=/bookmarks");
  }

  const db = drizzle(context.cloudflare.env.DB);
  const sanity = createSanityClient(context.cloudflare.env);
  
  // Get user's bookmarks
  const userBookmarks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(100);

  if (userBookmarks.length === 0) {
    return json({ videos: [], bookmarkIds: [] });
  }

  // Get video details from Sanity
  const videoIds = userBookmarks.map(b => b.videoId);
  const videosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && _id in $ids && isPublished == true] {
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

  // Map videos preserving bookmark order
  const videoMap = new Map(videosRaw.map(v => [v._id, v]));
  const videos = userBookmarks
    .map(b => {
      const video = videoMap.get(b.videoId);
      if (!video) return null;
      return {
        id: video._id,
        slug: getSlug(video.slug),
        title: video.title,
        thumbnail: video.thumbnail || null,
        previewVideo: video.previewVideo || null,
        duration: video.duration || null,
        views: video.views || 0,
        bookmarkedAt: b.createdAt,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  return json({ videos });
}

export default function BookmarksPage() {
  const { videos } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // Filter out null values
  const validVideos = videos.filter((v): v is NonNullable<typeof v> => v !== null);

  const handleRemoveBookmark = (videoId: string) => {
    fetcher.submit(
      { action: "remove", videoId },
      { method: "POST", action: "/api/bookmarks" }
    );
  };

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-5 w-5 sm:h-6 sm:w-6" />
          My Bookmarks
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          {validVideos.length} saved {validVideos.length === 1 ? "video" : "videos"}
        </p>
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
                onClick={() => handleRemoveBookmark(video.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                title="Remove bookmark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground mb-6">
            Save videos you like by clicking the bookmark icon.
          </p>
          <Button asChild>
            <Link to="/videos">Browse Videos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
