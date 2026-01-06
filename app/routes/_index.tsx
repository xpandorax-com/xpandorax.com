import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getSession } from "~/lib/auth";
import { VideoCard } from "~/components/video-card";
import { CategoryCard } from "~/components/category-card";
import { Button } from "~/components/ui/button";
import { ChevronRight, TrendingUp, Sparkles, Grid3X3, Users, Building2 } from "lucide-react";
import { createSanityClient, getSlug, type SanityVideo, type SanityCategory, type SanityActress } from "~/lib/sanity";

export const meta: MetaFunction = () => {
  return [
    { title: "XpandoraX - Free Video Content" },
    {
      name: "description",
      content: "Discover free video content. Browse categories, actresses, and enjoy high-quality streaming.",
    },
    { property: "og:title", content: "XpandoraX - Free Video Content" },
    { property: "og:description", content: "Discover free video content." },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    await getSession(request, context);
    const env = context.cloudflare.env;

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

    // Fetch popular models from Sanity
    const modelsRaw = await sanity.fetch<(SanityActress & { videoCount: number })[]>(
      `*[_type == "actress"] {
        _id,
        name,
        slug,
        "image": image.asset->url,
        "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
      } | order(videoCount desc)[0...12]`
    );

    // Fetch popular producers from Sanity
    const producersRaw = await sanity.fetch<Array<{
      _id: string;
      name: string;
      slug: { current: string } | string;
      logo?: string;
      videoCount: number;
    }>>(
      `*[_type == "producer"] {
        _id,
        name,
        slug,
        "logo": logo.asset->url,
        "videoCount": count(*[_type == "video" && producer._ref == ^._id && isPublished == true])
      } | order(videoCount desc)[0...12]`
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
      actress: v.actress ? { name: v.actress.name } : null,
    }));

    const allCategories = categoriesRaw.map((c) => ({
      _id: c._id,
      id: c._id,
      slug: getSlug(c.slug),
      name: c.name,
      thumbnail: c.thumbnail || null,
      videoCount: c.videoCount || 0,
    }));

    const models = modelsRaw.map((m) => ({
      id: m._id,
      slug: getSlug(m.slug),
      name: m.name,
      image: m.image || null,
      videoCount: m.videoCount || 0,
    }));

    const producers = producersRaw.map((p) => ({
      id: p._id,
      slug: getSlug(p.slug),
      name: p.name,
      logo: p.logo || null,
      videoCount: p.videoCount || 0,
    }));

    return json({
      latestVideos,
      trendingVideos,
      categories: allCategories,
      models,
      producers,
    });
  } catch (error) {
    console.error("Index loader error:", error);
    // Return empty data instead of crashing
    return json({
      latestVideos: [],
      trendingVideos: [],
      categories: [],
      models: [],
      producers: [],
      error: "Failed to load content. Please try again later.",
    });
  }
}

export default function Index() {
  const { latestVideos, trendingVideos, categories, models, producers } =
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

      {/* Popular Models Section */}
      {models.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Popular Models
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
              <Link to="/models">
                View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 stagger-children">
            {models.map((model) => (
              <Link
                key={model.id}
                to={`/model/${model.slug}`}
                className="group rounded-lg border bg-card p-2 sm:p-3 transition-all hover:bg-accent hover:shadow-md active:scale-[0.98] touch-target"
              >
                <div className="aspect-square overflow-hidden rounded-full mb-2 ring-2 ring-transparent group-hover:ring-primary transition-all">
                  {model.image ? (
                    <img
                      src={model.image}
                      alt={model.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-center text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                  {model.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                  {model.videoCount || 0} videos
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* Popular Producers Section */}
      {producers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Popular Producers
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
              <Link to="/producers">
                View All <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 stagger-children">
            {producers.map((producer) => (
              <Link
                key={producer.id}
                to={`/producer/${producer.slug}`}
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:ring-2 hover:ring-primary hover:shadow-md active:scale-[0.98]"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {producer.logo ? (
                    <img
                      src={producer.logo}
                      alt={producer.name}
                      className="h-full w-full object-contain p-3 sm:p-4 transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                    {producer.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {producer.videoCount || 0} videos
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
