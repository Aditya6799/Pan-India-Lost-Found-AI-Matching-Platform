"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface ImageGalleryProps {
  images?: GalleryImage[];
  itemName?: string;
  className?: string;
}

export function ImageGallery({
  images = [],
  itemName = "Item photo",
  className = "",
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const hasImages = images && images.length > 0;
  const total = images.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      {/* MAIN LARGE IMAGE */}
      <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-sm dark:border-neutral-800 dark:bg-neutral-800">
        {hasImages ? (
          <>
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt || `${itemName} - Image ${currentIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain transition-transform duration-300"
            />

            {/* Fullscreen Zoom Trigger */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute right-3 top-3 rounded-xl bg-black/60 p-2 text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="View Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Prev/Next Overlay Controls */}
            {total > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image counter pill */}
            {total > 1 && (
              <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {currentIndex + 1} / {total}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
            <Package className="h-16 w-16 stroke-[1.5]" />
            <span className="mt-2 text-sm font-medium">No photo available</span>
          </div>
        )}
      </div>

      {/* THUMBNAIL ROW */}
      {hasImages && total > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                currentIndex === idx
                  ? "border-primary-600 ring-2 ring-primary-500/20"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && hasImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition-all hover:bg-white/20"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Fullscreen image container */}
          <div className="relative h-[85vh] w-[90vw]">
            <Image
              src={images[currentIndex].url}
              alt={itemName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>

          {/* Controls */}
          {total > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
            {currentIndex + 1} of {total}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
