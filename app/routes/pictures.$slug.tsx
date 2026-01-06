import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn,
  User,
  Grid,
  ArrowLeft,
  Eye
} from "lucide-react";
import { createSanityClient, getSlug } from "~/lib/sanity";
import { formatViews, formatDate } from "~/lib/utils";
import { useViewTracker } from "~/lib/view-tracker";
import {
  Dialog,
  DialogContent,
} from "~/components/ui/dialog";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.picture) {
    return [{ title: "Gallery Not Found - XpandoraX" }];
  }

  return [
    { title: `${data.picture.title} - Pictures - XpandoraX` },
    { name: "description", content: `View ${data.picture.title} - ${data.picture.imageCount} photos` },
    { property: "og:title", content: data.picture.title },
    { property: "og:type", content: "website" },
    { property: "og:image", content: data.picture.thumbnail || "" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

interface PictureImage {
  url: string;
  caption?: string;
  alt?: string;
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const sanity = createSanityClient(context.cloudflare.env);

    // Fetch picture gallery from Sanity
    const pictureRaw = await sanity.fetch<{
      _id: string;
      title: string;
      slug: { current: string } | string;
      thumbnail?: string;
      images?: Array<{
        _key: string;
        url?: string;
        caption?: string;
        alt?: string;
      }>;
      views?: number;
      publishedAt?: string;
      actress?: {
        _id: string;
        name: string;
        slug: { current: string } | string;
        image?: string;
      };
      producer?: {
        _id: string;
        name: string;
        slug: { current: string } | string;
      };
      categories?: Array<{
        _id: string;
        name: string;
        slug: { current: string } | string;
      }>;
    } | null>(
      `*[_type == "picture" && slug.current == $slug && isPublished == true][0] {
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
          slug,
          "image": image.asset->url
        },
        "producer": producer->{
          _id,
          name,
          slug
        },
        "categories": categories[]->{
          _id,
          name,
          slug
        }
      }`,
      { slug }
    );

    if (!pictureRaw) {
      throw new Response("Not Found", { status: 404 });
    }

    // Transform images
    const images: PictureImage[] = (pictureRaw.images || [])
      .filter((img) => img.url)
      .map((img) => ({
        url: img.url!,
        caption: img.caption,
        alt: img.alt,
      }));

    // Fetch related galleries (same model or similar categories)
    const relatedGalleries = await sanity.fetch<Array<{
      _id: string;
      title: string;
      slug: { current: string } | string;
      thumbnail?: string;
      imageCount: number;
      actress?: {
        name: string;
        slug: { current: string } | string;
      };
    }>>(
      `*[_type == "picture" && isPublished == true && _id != $currentId && (
        actress._ref == $actressId ||
        count(categories[@._ref in $categoryIds]) > 0
      )] | order(publishedAt desc) [0...6] {
        _id,
        title,
        slug,
        "thumbnail": coalesce(thumbnail.asset->url, images[0].url),
        "imageCount": count(images),
        "actress": actress->{
          name,
          slug
        }
      }`,
      {
        currentId: pictureRaw._id,
        actressId: pictureRaw.actress?._id || "",
        categoryIds: pictureRaw.categories?.map((c) => c._id) || [],
      }
    );

    return json({
      picture: {
        id: pictureRaw._id,
        title: pictureRaw.title,
        slug: getSlug(pictureRaw.slug),
        thumbnail: pictureRaw.thumbnail || null,
        images,
        imageCount: images.length,
        views: pictureRaw.views || 0,
        publishedAt: pictureRaw.publishedAt || null,
        model: pictureRaw.actress
          ? {
              id: pictureRaw.actress._id,
              name: pictureRaw.actress.name,
              slug: getSlug(pictureRaw.actress.slug),
              image: pictureRaw.actress.image,
            }
          : null,
        producer: pictureRaw.producer
          ? {
              id: pictureRaw.producer._id,
              name: pictureRaw.producer.name,
              slug: getSlug(pictureRaw.producer.slug),
            }
          : null,
        categories: (pictureRaw.categories || []).map((c) => ({
          id: c._id,
          name: c.name,
          slug: getSlug(c.slug),
        })),
      },
      relatedGalleries: relatedGalleries.map((g) => ({
        id: g._id,
        title: g.title,
        slug: getSlug(g.slug),
        thumbnail: g.thumbnail || null,
        imageCount: g.imageCount || 0,
        model: g.actress
          ? {
              name: g.actress.name,
              slug: getSlug(g.actress.slug),
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Picture loader error:", error);
    if (error instanceof Response) throw error;
    throw new Response("Not Found", { status: 404 });
  }
}

export default function PictureDetailPage() {
  const { picture, relatedGalleries } = useLoaderData<typeof loader>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isLightboxOpen = selectedIndex !== null;

  // Track view
  useViewTracker({ type: "picture", id: picture.id });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          setSelectedIndex((prev) =>
            prev !== null ? (prev === 0 ? picture.images.length - 1 : prev - 1) : null
          );
          break;
        case "ArrowRight":
          setSelectedIndex((prev) =>
            prev !== null ? (prev === picture.images.length - 1 ? 0 : prev + 1) : null
          );
          break;
        case "Escape":
          setSelectedIndex(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, picture.images.length]);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === 0 ? picture.images.length - 1 : prev - 1) : null
    );
  }, [picture.images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === picture.images.length - 1 ? 0 : prev + 1) : null
    );
  }, [picture.images.length]);

  return (
    <div className="container py-4 sm:py-8">
      {/* Back Navigation */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/pictures">
            <ArrowLeft className="h-4 w-4" />
            Back to Pictures
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
          {picture.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {/* Model */}
          {picture.model && (
            <Link
              to={`/model/${picture.model.slug}`}
              className="flex items-center gap-2 hover:text-pink-500 transition-colors"
            >
              {picture.model.image ? (
                <img
                  src={picture.model.image}
                  alt={picture.model.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span>{picture.model.name}</span>
            </Link>
          )}

          {/* Image Count */}
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            {picture.imageCount} images
          </span>

          {/* Views */}
          {picture.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {formatViews(picture.views)} views
            </span>
          )}

          {/* Published Date */}
          {picture.publishedAt && (
            <span>{formatDate(picture.publishedAt)}</span>
          )}
        </div>

        {/* Categories */}
        {picture.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {picture.categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {picture.images.length > 0 ? (
        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {picture.images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <img
                src={image.url}
                alt={image.alt || `${picture.title} - Photo ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white truncate">{image.caption}</p>
                </div>
              )}
              {/* Index badge */}
              <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images in this gallery</p>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none">
          {selectedIndex !== null && picture.images[selectedIndex] && (
            <div className="relative flex items-center justify-center min-h-[50vh]">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>

              {/* Navigation buttons */}
              {picture.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 z-50 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="flex flex-col items-center max-w-full max-h-[90vh] p-4">
                <img
                  src={picture.images[selectedIndex].url}
                  alt={
                    picture.images[selectedIndex].alt ||
                    `${picture.title} - Photo ${selectedIndex + 1}`
                  }
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />

                {/* Caption and counter */}
                <div className="mt-4 text-center">
                  {picture.images[selectedIndex].caption && (
                    <p className="text-white text-sm mb-2">
                      {picture.images[selectedIndex].caption}
                    </p>
                  )}
                  <p className="text-white/60 text-sm">
                    {selectedIndex + 1} / {picture.images.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Related Galleries */}
      {relatedGalleries.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Related Galleries
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {relatedGalleries.map((gallery) => (
              <Link
                key={gallery.id}
                to={`/pictures/${gallery.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-pink-500"
              >
                {gallery.thumbnail ? (
                  <img
                    src={gallery.thumbnail}
                    alt={gallery.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2">
                    {gallery.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-white/70 text-xs">
                    <span>{gallery.imageCount} images</span>
                    {gallery.model && (
                      <>
                        <span>•</span>
                        <span>{gallery.model.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
