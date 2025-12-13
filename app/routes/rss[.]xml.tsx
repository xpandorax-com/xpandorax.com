import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createSanityClient, type SanityVideo } from "~/lib/sanity";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const baseUrl = env?.APP_URL || "https://xpandorax.com";
  const appName = env?.APP_NAME || "XpandoraX";
  const sanity = createSanityClient(env);

  // Fetch latest videos for RSS feed
  const videos = await sanity.fetch<SanityVideo[]>(`*[_type == "video" && isPublished == true] | order(publishedAt desc)[0...50] {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    publishedAt
  }`);

  const getSlugValue = (slug: { current: string } | string): string => {
    return typeof slug === "string" ? slug : slug?.current || "";
  };

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const currentDate = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${appName} - Latest Videos</title>
    <link>${baseUrl}</link>
    <description>Latest videos from ${appName}</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${videos.map((video) => `
    <item>
      <title>${escapeXml(video.title || "")}</title>
      <link>${baseUrl}/video/${getSlugValue(video.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/video/${getSlugValue(video.slug)}</guid>
      <description>${escapeXml(video.description || "")}</description>
      <pubDate>${video.publishedAt ? new Date(video.publishedAt).toUTCString() : currentDate}</pubDate>
      ${video.thumbnail ? `<media:thumbnail url="${video.thumbnail}"/>` : ""}
      ${video.duration ? `<media:content duration="${video.duration}"/>` : ""}
    </item>`).join("")}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
