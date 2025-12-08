import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { VideoCard } from "~/components/video-card";
import { PictureGallery } from "~/components/picture-gallery";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, Video, Calendar, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { formatDate } from "~/lib/utils";
import { createSanityClient, getSlug, type SanityActress, type SanityVideo, type SanityGalleryImage } from "~/lib/sanity";
import { useViewTracker } from "~/lib/view-tracker";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.actress) {
    return [
      { title: "Model Not Found - XpandoraX" },
      { name: "description", content: "This model could not be found." },
    ];
  }

  return [
    { title: `${data.actress.name} - XpandoraX` },
    {
      name: "description",
      content: data.actress.bio || `Watch videos featuring ${data.actress.name} on XpandoraX.`,
    },
    { property: "og:title", content: `${data.actress.name} - XpandoraX` },
    { property: "og:image", content: data.actress.image || "" },
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

  // Fetch model with videos from Sanity
  const actressRaw = await sanity.fetch<(SanityActress & { 
    videos: SanityVideo[];
    videoCount: number;
    createdAt?: string;
    gallery?: SanityGalleryImage[];
  }) | null>(
    `*[_type == "actress" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      bio,
      "image": image.asset->url,
      "_createdAt": _createdAt,
      "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true]),
      "videos": *[_type == "video" && actress._ref == ^._id && isPublished == true] | order(publishedAt desc) [$offset...$end] {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        duration,
        views,
        isPremium
      },
      "gallery": gallery[] {
        _key,
        "url": asset->url,
        caption,
        alt
      }
    }`,
    { slug, offset, end: offset + limit }
  );

  if (!actressRaw) {
    throw new Response("Not Found", { status: 404 });
  }

  const total = actressRaw.videoCount || 0;
  const totalPages = Math.ceil(total / limit);

  // Transform data
  const actress = {
    id: actressRaw._id,
    slug: getSlug(actressRaw.slug),
    name: actressRaw.name,
    bio: actressRaw.bio || null,
    image: actressRaw.image || null,
    createdAt: actressRaw.createdAt || null,
  };

  const actressVideos = (actressRaw.videos || []).map((v) => ({
    id: v._id,
    slug: getSlug(v.slug),
    title: v.title,
    thumbnail: v.thumbnail || null,
    duration: v.duration || null,
    views: v.views || 0,
    isPremium: v.isPremium || false,
  }));

  const gallery = (actressRaw.gallery || []).map((img) => ({
    url: img.url || "",
    caption: img.caption || undefined,
    alt: img.alt || undefined,
  })).filter(img => img.url);

  return json({
    actress,
    videos: actressVideos,
    gallery,
    total,
    page,
    totalPages,
  });
}

export default function ModelDetailPage() {
  const data = useLoaderData<typeof loader>();
  const { actress, videos: actressVideos, gallery, total, page, totalPages } = data;

  // Track model/actress view when page loads
  useViewTracker({ type: "actress", id: actress.id });

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <a href="/models">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </a>
      </Button>

      {/* Model Profile */}
      <div className="mb-8 flex flex-col md:flex-row gap-8">
        {/* Image */}
        <div className="shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-primary/20 mx-auto md:mx-0">
            {actress.image ? (
              <img
                src={actress.image}
                alt={actress.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Users className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{actress.name}</h1>

          <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
            <Badge variant="secondary" className="text-sm">
              <Video className="mr-1 h-4 w-4" />
              {total} Videos
            </Badge>
            {actress.createdAt && (
              <Badge variant="outline" className="text-sm">
                <Calendar className="mr-1 h-4 w-4" />
                Added {formatDate(actress.createdAt)}
              </Badge>
            )}
          </div>

          {actress.bio && (
            <>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">{actress.bio}</p>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Content Tabs - Videos & Gallery */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({total})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Pictures ({gallery.length})
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos">
          {actressVideos.length > 0 ? (
            <>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {actressVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {page > 1 && (
                    <Button variant="outline" asChild>
                      <a href={`/model/${actress.slug}?page=${page - 1}`}>
                        Previous
                      </a>
                    </Button>
                  )}
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Button variant="outline" asChild>
                      <a href={`/model/${actress.slug}?page=${page + 1}`}>Next</a>
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No videos available yet for {actress.name}.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery">
          <PictureGallery images={gallery} modelName={actress.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
