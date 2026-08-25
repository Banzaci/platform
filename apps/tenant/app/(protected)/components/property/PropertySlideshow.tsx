"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X
} from "lucide-react";

export type PropertyImage = {
  url: string;
  publicId: string;
  position?: {
    x: number;
    y: number;
  };
};

export default function PropertySlideshow({
  images,
  alt,
}: {
  images: PropertyImage[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (!images?.length) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden bg-gray-100 min-h-70`}
      >
        <ImageIcon className="h-7 w-7 text-gray-300" />
      </div>
    );
  }

  function previous() {
    setIndex((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }

  function next() {
    setIndex((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }
  return (
    <div className="group relative h-full w-full min-h-70 overflow-hidden bg-gray-100">
      {images.map((image, imageIndex) => (
        <img
          key={image.publicId ?? image.url}
          src={image.url}
          alt={alt}
          onClick={() => setLightboxOpen(true)}
          style={{
            objectPosition: `${image.position?.x ?? 50}% ${image.position?.y ?? 50}%`,
          }}
          className={`absolute inset-0 h-full w-full cursor-pointer object-cover transition-all duration-500 ease-out ${
            imageIndex === index
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-[1.03] opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
            {images.map((_, imageIndex) => (
              <button
                key={imageIndex}
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Image ${imageIndex + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  imageIndex === index
                    ? "h-1.5 w-4 bg-white"
                    : "h-1.5 w-1.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close slideshow"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative h-full w-full">
            {images.map((image, imageIndex) => (
              <img
                key={image.publicId ?? image.url}
                src={image.url}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className={`absolute inset-0 h-full w-full object-contain p-8 transition-all duration-500 ease-out ${
                  imageIndex === index
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-[0.98] opacity-0"
                }`}
              />
            ))}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    previous();
                  }}
                  className="absolute left-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div
                  className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {images.map((_, imageIndex) => (
                    <button
                      key={imageIndex}
                      type="button"
                      onClick={() => setIndex(imageIndex)}
                      aria-label={`Image ${imageIndex + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        imageIndex === index
                          ? "h-2 w-6 bg-white"
                          : "h-2 w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}