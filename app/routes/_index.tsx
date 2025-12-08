import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getSession } from "~/lib/auth";
import { VideoCard } from "~/components/video-card";
import { CategoryCard } from "~/components/category-card";
import { Button } from "~/components/ui/button";
import { ChevronRight, TrendingUp, Sparkles, Grid3X3 } from "lucide-react";
import { createSanityClient, getSlug, type SanityVideo, type SanityCategory } from "~/lib/sanity";

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

  // Fetch latest videos from Sanity
  const latestVideosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && isPublished == true] | order(publishedAt desc)[0...8] {
      _id,
      title,
      slug,
      "thumbnail": thumbnail.asset->url,
      "previewVideo": previewVideo.asset->url,
      duration,
      views,
      isPremium,
      "actress": actress->{
        name
      }
    }`
  );

  // Fetch trending videos (most views) from Sanity
  const trendingVideosRaw = await sanity.fetch<SanityVideo[]>(
    `*[_type == "video" && isPublished == true] | order(views desc)[0...8] {
      _id,
      title,
      slug,
      "thumbnail": thumbnail.asset->url,
      "previewVideo": previewVideo.asset->url,
      duration,
      views,
      isPremium,
      "actress": actress->{
        name
      }
    }`
  );

  // Fetch categories from Sanity
  const categoriesRaw = await sanity.fetch<SanityCategory[]>(
    `*[_type == "category"] | order(sortOrder asc)[0...12] {
      _id,
      name,
      slug,
      "thumbnail": thumbnail.asset->url,
      "videoCount": count(*[_type == "video" && references(^._id) && isPublished == true])
    }`
  );

  // Transform Sanity data to match component expectations
  const latestVideos = latestVideosRaw.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
    actress: v.actress ? { name: v.actress.name } : null,
  }));

  const trendingVideos = trendingVideosRaw.map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    previewVideo: v.previewVideo || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
    actress: v.actress ? { name: v.actress.name } : null,
  }));

  const allCategories = categoriesRaw.map((c) => ({
    id: c._id,
    slug: getSlug(c.slug),
    name: c.name,
    thumbnail: c.thumbnail || null,
    videoCount: c.videoCount || 0,
  }));

  return json({
    latestVideos,
    trendingVideos,
    categories: allCategories,
  });
}

export default function Index() {
  const { latestVideos, trendingVideos, categories } =
    useLoaderData<typeof loader>();

  return (
    <div className="container py-4 sm:py-6 space-y-6 sm:space-y-10">

      {/* Latest Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Latest Videos
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
            <Link to="/videos?sort=latest">
              View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 stagger-children">
          {latestVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Trending Videos Section */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Trending Now
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
            <Link to="/videos?sort=popular">
              View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 stagger-children">
          {trendingVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold">
            <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Popular Categories
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
            <Link to="/categories">
              View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 stagger-children">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
