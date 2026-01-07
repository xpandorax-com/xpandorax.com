import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { CutsPlayer, type CutData } from "~/components/cuts-player";
import { createSanityClient, getSlug, type SanityCut } from "~/lib/sanity";
import { useViewTracker } from "~/lib/view-tracker";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.cut) {
    return [{ title: "Cut Not Found - XpandoraX" }];
  }

  return [
    { title: `${data.cut.title} - Cuts | XpandoraX` },
    { name: "description", content: data.cut.description || data.cut.title },
    { property: "og:title", content: data.cut.title },
    { property: "og:description", content: data.cut.description || "" },
    { property: "og:type", content: "video.other" },
    { property: "og:image", content: data.cut.thumbnail || "" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const env = context.cloudflare.env;

  try {
    const sanity = createSanityClient(env);

    // Fetch the current cut
    const cutRaw = await sanity.fetch<SanityCut | null>(
      `*[_type == "cut" && slug.current == $slug && isPublished == true][0] {
        _id,
        title,
        slug,
        description,
        "thumbnail": thumbnail.asset->url,
        videoUrl,
        embedCode,
        duration,
        views,
        likes,
        soundName,
        hashtags,
        publishedAt,
        "actress": actress->{
          _id,
          name,
          slug,
          "image": image.asset->url
        },
        "categories": categories[]->{
          _id,
          name,
          slug
        }
      }`,
      { slug }
    );

    if (!cutRaw) {
      throw new Response("Not Found", { status: 404 });
    }

    // Fetch adjacent cuts for navigation
    const [prevCuts, nextCuts] = await Promise.all([
      sanity.fetch<SanityCut[]>(
        `*[_type == "cut" && isPublished == true && publishedAt > $publishedAt] | order(publishedAt asc)[0...3] {
          _id,
          title,
          slug,
          "thumbnail": thumbnail.asset->url,
          videoUrl,
          embedCode,
          duration,
          views,
          likes,
          soundName,
          hashtags,
          "actress": actress->{
            _id,
            name,
            slug,
            "image": image.asset->url
          }
        }`,
        { publishedAt: cutRaw.publishedAt || new Date().toISOString() }
      ),
      sanity.fetch<SanityCut[]>(
        `*[_type == "cut" && isPublished == true && publishedAt < $publishedAt] | order(publishedAt desc)[0...3] {
          _id,
          title,
          slug,
          "thumbnail": thumbnail.asset->url,
          videoUrl,
          embedCode,
          duration,
          views,
          likes,
          soundName,
          hashtags,
          "actress": actress->{
            _id,
            name,
            slug,
            "image": image.asset->url
          }
        }`,
        { publishedAt: cutRaw.publishedAt || new Date().toISOString() }
      ),
    ]);

    // Transform cut data
    const cut: CutData = {
      id: cutRaw._id,
      slug: getSlug(cutRaw.slug),
      title: cutRaw.title,
      description: cutRaw.description,
      thumbnail: cutRaw.thumbnail || null,
      videoUrl: cutRaw.videoUrl,
      embedCode: cutRaw.embedCode || null,
      duration: cutRaw.duration || null,
      views: cutRaw.views || 0,
      likes: cutRaw.likes || 0,
      soundName: cutRaw.soundName || null,
      hashtags: cutRaw.hashtags || [],
      actress: cutRaw.actress ? {
        name: cutRaw.actress.name,
        slug: getSlug(cutRaw.actress.slug),
        image: cutRaw.actress.image || null,
      } : null,
    };

    // Build navigation list: previous cuts + current + next cuts
    const allCuts: CutData[] = [
      ...prevCuts.reverse().map((c) => ({
        id: c._id,
        slug: getSlug(c.slug),
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail || null,
        videoUrl: c.videoUrl,
        embedCode: c.embedCode || null,
        duration: c.duration || null,
        views: c.views || 0,
        likes: c.likes || 0,
        soundName: c.soundName || null,
        hashtags: c.hashtags || [],
        actress: c.actress ? {
          name: c.actress.name,
          slug: getSlug(c.actress.slug),
          image: c.actress.image || null,
        } : null,
      })),
      cut,
      ...nextCuts.map((c) => ({
        id: c._id,
        slug: getSlug(c.slug),
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail || null,
        videoUrl: c.videoUrl,
        embedCode: c.embedCode || null,
        duration: c.duration || null,
        views: c.views || 0,
        likes: c.likes || 0,
        soundName: c.soundName || null,
        hashtags: c.hashtags || [],
        actress: c.actress ? {
          name: c.actress.name,
          slug: getSlug(c.actress.slug),
          image: c.actress.image || null,
        } : null,
      })),
    ];

    const currentIndex = allCuts.findIndex((c) => c.id === cut.id);

    return json({
      cut,
      allCuts,
      currentIndex,
    });
  } catch (error) {
    console.error("Cut loader error:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Server Error", { status: 500 });
  }
}

export default function CutPage() {
  const { cut, allCuts, currentIndex } = useLoaderData<typeof loader>();

  // Track view for this cut
  useViewTracker({ type: "cut", id: cut.id });

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Full viewport container with dynamic sizing */}
      <div className="relative w-full h-full max-h-[100dvh] flex items-center justify-center">
        <CutsPlayer
          cut={cut}
          allCuts={allCuts}
          currentIndex={currentIndex}
          className="w-full h-full max-w-screen max-h-[100dvh]"
        />
      </div>
    </div>
  );
}

// Error boundary for cut page
export function ErrorBoundary() {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Cut Not Found</h1>
        <p className="text-white/70 mb-4">This cut may have been removed or doesn't exist.</p>
        <a
          href="/cuts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Browse Cuts
        </a>
      </div>
    </div>
  );
}
