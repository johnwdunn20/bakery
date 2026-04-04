"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Photo {
  url: string;
  alt?: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoLightbox({
  photos,
  initialIndex = 0,
  open,
  onOpenChange,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  React.useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          onOpenChange(false);
          break;
        case "ArrowLeft":
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
          break;
        case "ArrowRight":
          setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, photos.length, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const showNav = photos.length > 1;

  function goToPrev() {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current || photos.length <= 1) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartRef.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => onOpenChange(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(false);
        }}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 text-white text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {showNav && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12 hidden sm:flex"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPhoto.url}
          alt={currentPhoto.alt || `Photo ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          loading="lazy"
          decoding="async"
        />
      </div>

      {showNav && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12 hidden sm:flex"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </Button>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden transition-all shrink-0",
                index === currentIndex
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                  : "opacity-60 hover:opacity-100"
              )}
              aria-label={`View photo ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
