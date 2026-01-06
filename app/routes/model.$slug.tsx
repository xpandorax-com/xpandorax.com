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

  try {
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
          "previewVideo": previewVideo.asset->url,
          duration,
          views
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
      previewVideo: v.previewVideo || null,
      duration: v.duration || null,
      views: v.views || 0,
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
  } catch (error) {
    // Re-throw Response errors (404, etc.)
    if (error instanceof Response) {
      throw error;
    }
    console.error("Model loader error:", error);
    throw new Response("Failed to load model data", { status: 500 });
  }
}

export default function ModelDetailPage() {
  const data = useLoaderData<typeof loader>();
  const { actress, videos: actressVideos, gallery, total, page, totalPages } = data;

  // Track model/actress view when page loads
  useViewTracker({ type: "actress", id: actress.id });

  return (
    <div className="container py-4 sm:py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4 sm:mb-6 -ml-2 touch-target">
        <a href="/models">
          <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4" />
          Back to Models
        </a>
      </Button>

      {/* Model Profile */}
      <div className="mb-6 sm:mb-8 flex flex-col items-center md:flex-row md:items-start gap-4 sm:gap-8">
        {/* Image */}
        <div className="shrink-0">
          <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-primary/20">
            {actress.image ? (
              <img
                src={actress.image}
                alt={actress.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Users className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">{actress.name}</h1>

          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 justify-center md:justify-start">
            <Badge variant="secondary" className="text-xs sm:text-sm py-1 px-2 sm:px-3">
              <Video className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {total} Videos
            </Badge>
            {actress.createdAt && (
              <Badge variant="outline" className="text-xs sm:text-sm py-1 px-2 sm:px-3">
                <Calendar className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Added {formatDate(actress.createdAt)}
              </Badge>
            )}
          </div>

          {actress.bio && (
            <>
              <Separator className="my-3 sm:my-4" />
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{actress.bio}</p>
            </>
          )}
        </div>
      </div>

      <Separator className="mb-4 sm:mb-8" />

      {/* Content Tabs - Videos & Gallery */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto justify-start overflow-x-auto">
          <TabsTrigger value="videos" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-target">
            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Videos ({total})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-target">
            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Pictures ({gallery.length})
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos">
          {actressVideos.length > 0 ? (
            <>
              <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {actressVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
                  <div className="flex gap-2 w-full sm:w-auto">
                    {page > 1 && (
                      <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                        <a href={`/model/${actress.slug}?page=${page - 1}`}>
                          Previous
                        </a>
                      </Button>
                    )}
                    {page < totalPages && (
                      <Button variant="outline" asChild className="flex-1 sm:flex-none touch-target">
                        <a href={`/model/${actress.slug}?page=${page + 1}`}>Next</a>
                      </Button>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground order-first sm:order-none">
                    Page {page} of {totalPages}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Video className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
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
