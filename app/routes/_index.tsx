import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { desc, eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { videos, categories, actresses, videoCategories } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { VideoCard } from "~/components/video-card";
import { CategoryCard } from "~/components/category-card";
import { AdContainer } from "~/components/ads";
import { Button } from "~/components/ui/button";
import { ChevronRight, TrendingUp, Sparkles, Grid3X3 } from "lucide-react";
import type { AdConfig } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "XpandoraX - Premium Video Content" },
    {
      name: "description",
      content: "Discover premium video content. Browse categories, actresses, and enjoy high-quality streaming.",
    },
    { property: "og:title", content: "XpandoraX - Premium Video Content" },
    { property: "og:description", content: "Discover premium video content." },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
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

  // Fetch latest videos
  const latestVideos = await db.query.videos.findMany({
    where: eq(videos.isPublished, true),
    orderBy: [desc(videos.publishedAt)],
    limit: 8,
    with: {
      actress: true,
    },
  });

  // Fetch trending videos (most views)
  const trendingVideos = await db.query.videos.findMany({
    where: eq(videos.isPublished, true),
    orderBy: [desc(videos.views)],
    limit: 8,
    with: {
      actress: true,
    },
  });

  // Fetch categories
  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.videoCount)],
    limit: 12,
  });

  // Ad config for non-premium users
  const adConfig: AdConfig | null = isPremium
    ? null
    : {
        exoclickZoneId: env.EXOCLICK_ZONE_ID || "",
        juicyadsZoneId: env.JUICYADS_ZONE_ID || "",
      };

  return json({
    latestVideos,
    trendingVideos,
    categories: allCategories,
    adConfig,
  });
}

export default function Index() {
  const { latestVideos, trendingVideos, categories, adConfig } =
    useLoaderData<typeof loader>();

  return (
    <div className="container py-6 space-y-10">
      {/* Top Ad Banner */}
      <AdContainer adConfig={adConfig} position="top" />

      {/* Latest Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-primary" />
            Latest Videos
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/videos?sort=latest">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 stagger-children">
          {latestVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Trending Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trending Now
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/videos?sort=popular">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 stagger-children">
          {trendingVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Middle Ad Banner */}
      <AdContainer adConfig={adConfig} position="bottom" />

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Grid3X3 className="h-6 w-6 text-primary" />
            Popular Categories
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/categories">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 stagger-children">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Bottom Ad Banner */}
      <AdContainer adConfig={adConfig} position="bottom" />
    </div>
  );
}
