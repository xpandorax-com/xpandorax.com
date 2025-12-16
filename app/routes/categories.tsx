import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { CategoryCard } from "~/components/category-card";
import { Grid3X3 } from "lucide-react";
import { createSanityClient, getSlug, type SanityCategory } from "~/lib/sanity";

export const meta: MetaFunction = () => {
  return [
    { title: "Categories - XpandoraX" },
    { name: "description", content: "Browse all video categories on XpandoraX." },
    { property: "og:title", content: "Categories - XpandoraX" },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  // Create Sanity client
  const sanity = createSanityClient(env);

  // Fetch all categories from Sanity
  const categoriesRaw = await sanity.fetch<SanityCategory[]>(
    `*[_type == "category"] | order(sortOrder asc) {
      _id,
      name,
      slug,
      "thumbnail": thumbnail.asset->url,
      "videoCount": count(*[_type == "video" && references(^._id) && isPublished == true])
    }`
  );

  const allCategories = categoriesRaw.map((c) => ({
    _id: c._id,
    id: c._id,
    slug: getSlug(c.slug),
    name: c.name,
    thumbnail: c.thumbnail || null,
    videoCount: c.videoCount || 0,
  }));

  return json({
    categories: allCategories,
  });
}

export default function CategoriesPage() {
  const { categories: allCategories } = useLoaderData<typeof loader>();

  return (
    <div className="container py-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse {allCategories.length} categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {allCategories.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {allCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16">
          <Grid3X3 className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
          <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">No Categories Found</h2>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Check back later for new categories.
          </p>
        </div>
      )}
    </div>
  );
}
