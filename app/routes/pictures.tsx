import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, ZoomIn, Users } from "lucide-react";
import { createSanityClient, getSlug } from "~/lib/sanity";
import { trackView } from "~/lib/view-tracker";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "~/components/ui/dialog";

export const meta: MetaFunction = () => {
  return [
    { title: "Pictures - XpandoraX" },
    { name: "description", content: "Browse all model pictures on XpandoraX." },
  ];
};

interface GalleryImageWithModel {
  url: string;
  caption?: string;
  alt?: string;
  modelName: string;
  modelSlug: string;
  modelImage?: string;
  modelId: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = 48;
  const offset = (page - 1) * limit;

  const sanity = createSanityClient(context.cloudflare.env);

  // Fetch all models with their galleries
  const modelsWithGalleries = await sanity.fetch<Array<{
    _id: string;
    name: string;
    slug: { current: string } | string;
    image?: string;
    gallery?: Array<{
      _key: string;
      url?: string;
      caption?: string;
      alt?: string;
    }>;
  }>>(
    `*[_type == "actress" && defined(gallery) && count(gallery) > 0] {
      _id,
      name,
      slug,
      "image": image.asset->url,
      "gallery": gallery[] {
        _key,
        "url": asset->url,
        caption,
        alt
      }
    }`
  );

  // Flatten all images with model info
  const allImages: GalleryImageWithModel[] = [];
  modelsWithGalleries.forEach((model) => {
    if (model.gallery) {
      model.gallery.forEach((img) => {
        if (img.url) {
          allImages.push({
            url: img.url,
            caption: img.caption,
            alt: img.alt,
            modelName: model.name,
            modelSlug: getSlug(model.slug),
            modelImage: model.image,
            modelId: model._id,
          });
        }
      });
    }
  });

  const total = allImages.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedImages = allImages.slice(offset, offset + limit);

  return json({
    images: paginatedImages,
    total,
    page,
    totalPages,
  });
}

export default function PicturesPage() {
  const { images, total, page, totalPages } = useLoaderData<typeof loader>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;
  const trackedViews = useRef<Set<string>>(new Set());

  // Track view when an image is opened in lightbox
  useEffect(() => {
    if (selectedIndex !== null && images[selectedIndex]) {
      const image = images[selectedIndex];
      const viewKey = `${image.modelId}-${image.url}`;
      
      // Only track if we haven't tracked this specific image in this session
      if (!trackedViews.current.has(viewKey)) {
        trackedViews.current.add(viewKey);
        // Track as a picture view (tracks on the actress/model)
        trackView("picture", image.modelId);
      }
    }
  }, [selectedIndex, images]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-primary" />
          Pictures
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse {total} pictures from all models
        </p>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {images.map((image, index) => (
              <div key={index} className="group relative">
                <button
                  onClick={() => openLightbox(index)}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${image.modelName} photo`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                {/* Model info overlay */}
                <Link
                  to={`/model/${image.modelSlug}`}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg"
                >
                  <div className="flex items-center gap-2">
                    {image.modelImage ? (
                      <img
                        src={image.modelImage}
                        alt={image.modelName}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-xs text-white truncate">{image.modelName}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link to={`/pictures?page=${page - 1}`}>Previous</Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link to={`/pictures?page=${page + 1}`}>Next</Link>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No pictures available yet.</p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none">
          {selectedIndex !== null && images[selectedIndex] && (
            <div className="relative flex items-center justify-center min-h-[50vh]">
              {/* Close button */}
              <DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {/* Navigation buttons */}
              {images.length > 1 && (
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
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].alt || `${images[selectedIndex].modelName} photo`}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg"
                />
                
                {/* Caption and model info */}
                <div className="mt-4 text-center">
                  <Link
                    to={`/model/${images[selectedIndex].modelSlug}`}
                    className="inline-flex items-center gap-2 text-white hover:text-primary transition-colors"
                  >
                    {images[selectedIndex].modelImage && (
                      <img
                        src={images[selectedIndex].modelImage}
                        alt={images[selectedIndex].modelName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{images[selectedIndex].modelName}</span>
                  </Link>
                  {images[selectedIndex].caption && (
                    <p className="text-white/80 text-sm mt-2">{images[selectedIndex].caption}</p>
                  )}
                  <p className="text-white/60 text-sm mt-1">
                    {selectedIndex + 1} / {images.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
