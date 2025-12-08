import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { 
  Image as ImageIcon, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Settings2,
  ArrowUp,
  Loader2
} from "lucide-react";
import { createSanityClient, getSlug } from "~/lib/sanity";
import { trackView } from "~/lib/view-tracker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export const meta: MetaFunction = () => {
  return [
    { title: "Pictures - XpandoraX" },
    { name: "description", content: "Browse all model pictures in manga-style reader on XpandoraX." },
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

  // Fetch pictures from the dedicated Pictures schema
  const [picturesFromSchema, modelsWithGalleries] = await Promise.all([
    sanity.fetch<Array<{
      _id: string;
      title: string;
      slug: { current: string } | string;
      thumbnail?: string;
      r2ImageUrl?: string;
      actress?: {
        _id: string;
        name: string;
        slug: { current: string } | string;
        image?: string;
      };
    }>>(
      `*[_type == "picture" && isPublished == true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        "thumbnail": thumbnail.asset->url,
        r2ImageUrl,
        "actress": actress->{
          _id,
          name,
          slug,
          "image": image.asset->url
        }
      }`
    ),
    // Also fetch model gallery images as fallback
    sanity.fetch<Array<{
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
    ),
  ]);

  // Combine all images
  const allImages: GalleryImageWithModel[] = [];

  // Add pictures from Pictures schema first
  picturesFromSchema.forEach((pic) => {
    // Prefer R2 URL for full image, fallback to thumbnail
    const imageUrl = pic.r2ImageUrl || pic.thumbnail;
    if (imageUrl) {
      allImages.push({
        url: imageUrl,
        caption: pic.title,
        alt: pic.title,
        modelName: pic.actress?.name || "Unknown",
        modelSlug: pic.actress ? getSlug(pic.actress.slug) : "",
        modelImage: pic.actress?.image,
        modelId: pic.actress?._id || pic._id,
      });
    }
  });

  // Add model gallery images
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [imageWidth, setImageWidth] = useState<"full" | "large" | "medium">("large");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const trackedViews = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track views for visible images
  const trackImageView = useCallback((image: GalleryImageWithModel) => {
    const viewKey = `${image.modelId}-${image.url}`;
    if (!trackedViews.current.has(viewKey)) {
      trackedViews.current.add(viewKey);
      trackView("picture", image.modelId);
    }
  }, []);

  // Lazy load images as user scrolls
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setLoadedImages((prev) => {
                const newSet = new Set(prev);
                // Load this image and next few
                for (let i = index; i < Math.min(index + 5, images.length); i++) {
                  newSet.add(i);
                }
                return newSet;
              });
              // Track view when image becomes visible
              if (images[index]) {
                trackImageView(images[index]);
              }
            }
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );

    return () => observerRef.current?.disconnect();
  }, [images, trackImageView]);

  // Scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle infinite scroll for loading more pages
  useEffect(() => {
    if (!loadMoreRef.current || page >= totalPages) return;

    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Navigate to next page
          const newParams = new URLSearchParams(searchParams);
          newParams.set("page", String(page + 1));
          setSearchParams(newParams, { preventScrollReset: true });
        }
      },
      { rootMargin: "400px", threshold: 0 }
    );

    loadMoreObserver.observe(loadMoreRef.current);
    return () => loadMoreObserver.disconnect();
  }, [page, totalPages, isLoadingMore, searchParams, setSearchParams]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getImageContainerClass = () => {
    switch (imageWidth) {
      case "full":
        return "max-w-full";
      case "large":
        return "max-w-3xl";
      case "medium":
        return "max-w-xl";
      default:
        return "max-w-3xl";
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container-responsive py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-pink-500" />
            <div>
              <h1 className="text-lg font-bold text-white">Pictures</h1>
              <p className="text-xs text-gray-400">{total} images</p>
            </div>
          </div>
          
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Image Width</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setImageWidth("full")}
                className={imageWidth === "full" ? "bg-pink-500/20" : ""}
              >
                Full Width
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setImageWidth("large")}
                className={imageWidth === "large" ? "bg-pink-500/20" : ""}
              >
                Large (Recommended)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setImageWidth("medium")}
                className={imageWidth === "medium" ? "bg-pink-500/20" : ""}
              >
                Medium
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Manga-style Vertical Reader */}
      {images.length > 0 ? (
        <div className="flex flex-col items-center py-4 gap-1">
          {images.map((image, index) => (
            <div
              key={`${image.modelId}-${index}`}
              data-index={index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              className={`w-full ${getImageContainerClass()} mx-auto px-2 sm:px-4`}
            >
              {loadedImages.has(index) ? (
                <div className="relative group">
                  {/* Image */}
                  <img
                    src={image.url}
                    alt={image.alt || `${image.modelName} photo ${index + 1}`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                  
                  {/* Model info overlay - shows on hover/tap */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      to={`/model/${image.modelSlug}`}
                      className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors"
                    >
                      {image.modelImage ? (
                        <img
                          src={image.modelImage}
                          alt={image.modelName}
                          className="h-8 w-8 rounded-full object-cover border border-white/30"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{image.modelName}</p>
                        {image.caption && (
                          <p className="text-xs text-gray-300">{image.caption}</p>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Image counter badge */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-60">
                    {index + 1} / {images.length}
                  </div>
                </div>
              ) : (
                // Placeholder while loading
                <div className="w-full aspect-[3/4] bg-gray-900 animate-pulse flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
                </div>
              )}
            </div>
          ))}

          {/* Load More Trigger */}
          {page < totalPages && (
            <div ref={loadMoreRef} className="w-full py-8 flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            </div>
          )}

          {/* End of content */}
          {page >= totalPages && images.length > 0 && (
            <div className="w-full py-8 text-center text-gray-500">
              <p>You&apos;ve reached the end</p>
              <Button
                variant="ghost"
                onClick={scrollToTop}
                className="mt-2 text-pink-500 hover:text-pink-400"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Back to top
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-700" />
          <p className="mt-4 text-gray-500 text-lg">No pictures available yet.</p>
        </div>
      )}

      {/* Floating scroll controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        {showScrollTop && (
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Keyboard navigation hint - shows briefly */}
      <div className="fixed bottom-6 left-6 hidden sm:block text-xs text-gray-600 bg-black/60 px-3 py-2 rounded-lg opacity-50">
        Scroll to read • Hover for model info
      </div>
    </div>
  );
}
