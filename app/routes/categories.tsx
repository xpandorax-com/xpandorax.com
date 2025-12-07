import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { desc } from "drizzle-orm";
import { createDatabase } from "~/db";
import { categories } from "~/db/schema";
import { getSession } from "~/lib/auth";
import { CategoryCard } from "~/components/category-card";
import { AdContainer } from "~/components/ads";
import { Grid3X3 } from "lucide-react";
import type { AdConfig } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Categories - XpandoraX" },
    { name: "description", content: "Browse all video categories on XpandoraX." },
    { property: "og:title", content: "Categories - XpandoraX" },
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

  // Fetch all categories
  const allCategories = await db.query.categories.findMany({
    orderBy: [desc(categories.videoCount)],
  });

  // Ad config for non-premium users
  const adConfig: AdConfig | null = isPremium
    ? null
    : {
        exoclickZoneId: env.EXOCLICK_ZONE_ID || "",
        juicyadsZoneId: env.JUICYADS_ZONE_ID || "",
      };

  return json({
    categories: allCategories,
    adConfig,
  });
}

export default function CategoriesPage() {
  const { categories: allCategories, adConfig } = useLoaderData<typeof loader>();

  return (
    <div className="container py-6 space-y-6">
      {/* Top Ad Banner */}
      <AdContainer adConfig={adConfig} position="top" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Grid3X3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Browse {allCategories.length} categories
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 stagger-children">
        {allCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Bottom Ad Banner */}
      <AdContainer adConfig={adConfig} position="bottom" />
    </div>
  );
}
