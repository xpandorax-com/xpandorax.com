import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Building2, Video, Calendar, ArrowLeft, Globe, MapPin } from "lucide-react";
import { createSanityClient, getSlug, type SanityProducer, type SanityVideo } from "~/lib/sanity";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.producer) {
    return [
      { title: "Producer Not Found - XpandoraX" },
      { name: "description", content: "This producer could not be found." },
    ];
  }

  return [
    { title: `${data.producer.name} - XpandoraX` },
    {
      name: "description",
      content: data.producer.description || `Watch videos from ${data.producer.name} on XpandoraX.`,
    },
    { property: "og:title", content: `${data.producer.name} - XpandoraX` },
    { property: "og:image", content: data.producer.logo || "" },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  const sanity = createSanityClient(context.cloudflare.env);

  // Fetch producer with videos from Sanity
  const producerRaw = await sanity.fetch<(SanityProducer & { 
    videos: SanityVideo[];
    videoCount: number;
    createdAt?: string;
  }) | null>(
    `*[_type == "producer" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      "logo": logo.asset->url,
      website,
      founded,
      country,
      "_createdAt": _createdAt,
      "videoCount": count(*[_type == "video" && producer._ref == ^._id && isPublished == true]),
      "videos": *[_type == "video" && producer._ref == ^._id && isPublished == true] | order(publishedAt desc) [$offset...$end] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        duration,
        views,
        isPremium
      }
    }`,
    { slug, offset, end: offset + limit }
  );

  if (!producerRaw) {
    throw new Response("Not Found", { status: 404 });
  }

  const total = producerRaw.videoCount || 0;
  const totalPages = Math.ceil(total / limit);

  // Transform data
  const producer = {
    id: producerRaw._id,
    slug: getSlug(producerRaw.slug),
    name: producerRaw.name,
    description: producerRaw.description || null,
    logo: producerRaw.logo || null,
    website: producerRaw.website || null,
    founded: producerRaw.founded || null,
    country: producerRaw.country || null,
    createdAt: producerRaw.createdAt || null,
  };

  const producerVideos = (producerRaw.videos || []).map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
  }));

  return json({
    producer,
    videos: producerVideos,
    total,
    page,
    totalPages,
  });
}

export default function ProducerDetailPage() {
  const data = useLoaderData<typeof loader>();
  const { producer, videos: producerVideos, total, page, totalPages } = data;

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <a href="/producers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Producers
        </a>
      </Button>

      {/* Producer Profile */}
      <div className="mb-8 flex flex-col md:flex-row gap-8">
        {/* Logo */}
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden ring-4 ring-primary/20 mx-auto md:mx-0 bg-muted">
            {producer.logo ? (
              <img
                src={producer.logo}
                alt={producer.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{producer.name}</h1>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
            <Badge variant="secondary" className="text-sm">
              <Video className="mr-1 h-4 w-4" />
              {total} Videos
            </Badge>
            {producer.country && (
              <Badge variant="outline" className="text-sm">
                <MapPin className="mr-1 h-4 w-4" />
                {producer.country}
              </Badge>
            )}
            {producer.founded && (
              <Badge variant="outline" className="text-sm">
                <Calendar className="mr-1 h-4 w-4" />
                Founded {producer.founded}
              </Badge>
            )}
          </div>

          {producer.website && (
            <div className="mt-4">
              <a
                href={producer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                Visit Official Website
              </a>
            </div>
          )}

          {producer.description && (
            <>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">{producer.description}</p>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Videos Section */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Videos from {producer.name}
        </h2>

        {producerVideos.length > 0 ? (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {producerVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Button variant="outline" asChild>
                    <a href={`/producer/${producer.slug}?page=${page - 1}`}>
                      Previous
                    </a>
                  </Button>
                )}
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" asChild>
                    <a href={`/producer/${producer.slug}?page=${page + 1}`}>Next</a>
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No videos available yet from {producer.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
