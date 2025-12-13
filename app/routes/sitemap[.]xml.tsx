import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createSanityClient, type SanityVideo, type SanityCategory, type SanityActress } from "~/lib/sanity";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const baseUrl = env?.APP_URL || "https://xpandorax.com";
  const sanity = createSanityClient(env);

  // Fetch all content for sitemap
  const [videos, categories, actresses] = await Promise.all([
    sanity.fetch<SanityVideo[]>(`*[_type == "video" && isPublished == true] | order(publishedAt desc) {
      slug,
      publishedAt
    }`),
    sanity.fetch<SanityCategory[]>(`*[_type == "category"] { slug }`),
    sanity.fetch<SanityActress[]>(`*[_type == "actress"] { slug }`),
  ]);

  const getSlugValue = (slug: { current: string } | string): string => {
    return typeof slug === "string" ? slug : slug?.current || "";
  };

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/videos", priority: "0.9", changefreq: "daily" },
    { url: "/categories", priority: "0.8", changefreq: "weekly" },
    { url: "/models", priority: "0.8", changefreq: "weekly" },
    { url: "/producers", priority: "0.7", changefreq: "weekly" },
    { url: "/pictures", priority: "0.7", changefreq: "daily" },
    { url: "/search", priority: "0.5", changefreq: "weekly" },
    { url: "/about", priority: "0.3", changefreq: "monthly" },
    { url: "/contact", priority: "0.3", changefreq: "monthly" },
    { url: "/terms", priority: "0.2", changefreq: "monthly" },
    { url: "/privacy", priority: "0.2", changefreq: "monthly" },
    { url: "/dmca", priority: "0.2", changefreq: "monthly" },
    { url: "/2257", priority: "0.2", changefreq: "monthly" },
  ];

  const currentDate = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map((page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("")}
  ${videos.map((video) => `
  <url>
    <loc>${baseUrl}/video/${getSlugValue(video.slug)}</loc>
    <lastmod>${video.publishedAt ? new Date(video.publishedAt).toISOString().split("T")[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
  ${categories.map((category) => `
  <url>
    <loc>${baseUrl}/category/${getSlugValue(category.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")}
  ${actresses.map((actress) => `
  <url>
    <loc>${baseUrl}/model/${getSlugValue(actress.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join("")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
