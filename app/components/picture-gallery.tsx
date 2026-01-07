import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, ZoomIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "~/components/ui/dialog";

interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

interface PictureGalleryProps {
  images: GalleryImage[];
  modelName: string;
}

export function PictureGallery({ images, modelName }: PictureGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isOpen = selectedIndex !== null;

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

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          No pictures available yet for {modelName}.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid - Responsive for all device sizes */}
      <div className="grid gap-1.5 xs:gap-2 sm:gap-3 grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary touch-action-button"
          >
            <img
              src={image.url}
              alt={image.alt || `${modelName} photo ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 xs:p-2">
                <p className="text-[10px] xs:text-xs text-white truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog - Mobile optimized */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[100vw] sm:max-w-[95vw] max-h-[100dvh] sm:max-h-[95vh] w-full sm:w-auto h-full sm:h-auto p-0 bg-black/95 border-none rounded-none sm:rounded-lg safe-area-y">
          {selectedIndex !== null && (
            <div className="relative flex items-center justify-center min-h-[50vh] h-full">
              {/* Close button */}
              <DialogClose className="absolute top-3 xs:top-4 right-3 xs:right-4 z-50 rounded-full bg-black/50 p-1.5 xs:p-2 text-white hover:bg-black/70 transition-colors touch-target safe-area-top safe-area-right">
                <X className="h-5 w-5 xs:h-6 xs:w-6" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 xs:left-4 z-50 h-10 w-10 xs:h-12 xs:w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white touch-target"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-6 w-6 xs:h-8 xs:w-8" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 xs:right-4 z-50 h-10 w-10 xs:h-12 xs:w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white touch-target"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-6 w-6 xs:h-8 xs:w-8" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="flex flex-col items-center max-w-full max-h-[100dvh] sm:max-h-[90vh] p-2 xs:p-4">
                <img
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].alt || `${modelName} photo ${selectedIndex + 1}`}
                  className="max-h-[85dvh] sm:max-h-[80vh] max-w-full object-contain rounded-lg"
                />
                
                {/* Caption and counter */}
                <div className="mt-2 xs:mt-4 text-center safe-area-bottom">
                  {images[selectedIndex].caption && (
                    <p className="text-white text-xs xs:text-sm mb-1 xs:mb-2">{images[selectedIndex].caption}</p>
                  )}
                  <p className="text-white/60 text-xs xs:text-sm">
                    {selectedIndex + 1} / {images.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
