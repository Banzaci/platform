"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

type PropertyImage = {
  url: string;
  publicId: string;
};

export default function PropertySlideshow({
  images,
  alt,
}: {
  images: PropertyImage[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  if (!images?.length) {
    return (
      <div className="flex aspect-4/3 items-center justify-center bg-gray-100">
        <ImageIcon className="h-8 w-8 text-gray-400" />
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
    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        src={images[index].url}
        alt={alt}
        className="h-full w-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, imageIndex) => (
              <button
                key={imageIndex}
                type="button"
                onClick={() => setIndex(imageIndex)}
                className={`h-2 w-2 rounded-full ${
                  imageIndex === index
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}