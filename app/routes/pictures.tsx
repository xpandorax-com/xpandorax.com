import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Image as ImageIcon, Users } from "lucide-react";
import { createSanityClient, getSlug } from "~/lib/sanity";
import { PictureCard } from "~/components/picture-card";
import { PictureFilters } from "~/components/picture-filters";

export const meta: MetaFunction = () => {
  return [
    { title: "Pictures - XpandoraX" },
    { name: "description", content: "Browse all model picture galleries on XpandoraX." },
  ];
};

interface PictureGallery {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  imageCount: number;
  views: number;
  model: {
    name: string;
    slug: string;
  } | null;
  publishedAt: string | null;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const modelFilter = url.searchParams.get("model");
  const limit = 24;
  const offset = (page - 1) * limit;

  try {
    const sanity = createSanityClient(context.cloudflare.env);

    // Fetch pictures from the Pictures schema, models for filter, and count
    const [picturesRaw, modelsWithPictures, totalCount] = await Promise.all([
      // Main pictures query - use simple ordering to avoid GROQ issues
      sanity.fetch<Array<{
        _id: string;
        title: string;
        slug: { current: string } | string;
        thumbnail?: string;
        images?: Array<{ url?: string }>;
        views?: number;
        publishedAt?: string;
        actress?: {
          _id: string;
          name: string;
          slug: { current: string } | string;
        };
      }>>(
        modelFilter
          ? `*[_type == "picture" && isPublished == true && actress->slug.current == $modelFilter] | order(publishedAt desc) [$offset...$end] {
              _id,
              title,
              slug,
              "thumbnail": coalesce(thumbnail.asset->url, images[0].url),
              images,
              views,
              publishedAt,
              "actress": actress->{
                _id,
                name,
                slug
              }
            }`
          : `*[_type == "picture" && isPublished == true] | order(publishedAt desc) [$offset...$end] {
              _id,
              title,
              slug,
              "thumbnail": coalesce(thumbnail.asset->url, images[0].url),
              images,
              views,
              publishedAt,
              "actress": actress->{
                _id,
                name,
                slug
              }
            }`,
        { offset, end: offset + limit, modelFilter }
      ),
      // Get all models that have pictures (for filter dropdown)
      sanity.fetch<Array<{
        _id: string;
        name: string;
        slug: { current: string } | string;
      }>>(
        `*[_type == "actress" && count(*[_type == "picture" && isPublished == true && references(^._id)]) > 0] | order(name asc) {
          _id,
          name,
          slug
        }`
      ),
      // Total count
      sanity.fetch<number>(
        modelFilter
          ? `count(*[_type == "picture" && isPublished == true && actress->slug.current == $modelFilter])`
          : `count(*[_type == "picture" && isPublished == true])`,
        { modelFilter }
      ),
    ]);

    // Transform pictures data
    const pictures: PictureGallery[] = picturesRaw.map((pic) => ({
      id: pic._id,
      slug: getSlug(pic.slug),
      title: pic.title,
      thumbnail: pic.thumbnail || null,
      imageCount: pic.images?.filter(img => img.url)?.length || 0,
      views: pic.views || 0,
      model: pic.actress ? {
        name: pic.actress.name,
        slug: getSlug(pic.actress.slug),
      } : null,
      publishedAt: pic.publishedAt || null,
    }));

    // Transform models for filter dropdown
    const models = modelsWithPictures.map((m) => ({
      id: m._id,
      name: m.name,
      slug: getSlug(m.slug),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return json({
      pictures,
      models,
      total: totalCount,
      page,
      totalPages,
      model: modelFilter,
    });
  } catch (error) {
    console.error("Pictures loader error:", error);
    return json({
      pictures: [],
      models: [],
      total: 0,
      page: 1,
      totalPages: 0,
      model: null,
      error: "Failed to load pictures",
    });
  }
}

export default function PicturesPage() {
  const data = useLoaderData<typeof loader>();

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    if (data.model) params.set("model", data.model);
    return `/pictures?${params.toString()}`;
  };

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
          Pictures
        </h1>
        
        {/* Filters */}
        <PictureFilters
          models={data.models}
          currentFilters={{
            model: data.model || undefined,
          }}
          totalResults={data.total}
        />
      </div>

      {/* Pictures Grid */}
      {data.pictures.length > 0 ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.pictures.map((picture) => (
              <PictureCard
                key={picture.id}
                picture={{
                  id: picture.id,
                  slug: picture.slug,
                  title: picture.title,
                  thumbnail: picture.thumbnail,
                  imageCount: picture.imageCount,
                  views: picture.views,
                  model: picture.model,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                {data.page > 1 && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                    <a href={buildPageUrl(data.page - 1)}>
                      Previous
                    </a>
                  </Button>
                )}
                {data.page < data.totalPages && (
                  <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                    <a href={buildPageUrl(data.page + 1)}>
                      Next
                    </a>
                  </Button>
                )}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
                Page {data.page} of {data.totalPages}
              </span>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="rounded-full bg-muted p-6 mb-6">
            <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-center mb-2">
            No pictures available yet
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {data.model 
              ? "No pictures found for this model. Try clearing the filter to see all pictures."
              : "Picture galleries will appear here once they are uploaded."
            }
          </p>
          {data.model && (
            <Button variant="outline" asChild>
              <Link to="/pictures">
                Clear Filters
              </Link>
            </Button>
          )}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button variant="secondary" asChild>
              <Link to="/videos" className="flex items-center gap-2">
                Browse Videos
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/models" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Browse Models
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
