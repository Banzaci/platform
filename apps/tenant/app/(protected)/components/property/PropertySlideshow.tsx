"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
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
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  if (!images?.length) {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden bg-gray-100`}
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
    <div className="group relative h-full w-full overflow-hidden bg-gray-100">
      <img
        src={images[index].url}
        alt={alt}
        style={{
          objectPosition: `${images[index].position?.x ?? 50}% ${images[index].position?.y ?? 50}%`,
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, imageIndex) => (
              <button
                key={imageIndex}
                type="button"
                onClick={() =>
                  setIndex(imageIndex)
                }
                aria-label={`Image ${imageIndex + 1}`}
                className={`rounded-full transition-all ${
                  imageIndex === index
                    ? "h-1.5 w-4 bg-white"
                    : "h-1.5 w-1.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}