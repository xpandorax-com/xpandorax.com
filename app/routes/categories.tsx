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
    <div className="container-responsive py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Grid3X3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Categories</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse {allCategories.length} categories
          </p>
        </div>
      </div>

      {/* Categories Grid - Mobile optimized */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 stagger-children">
        {allCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
