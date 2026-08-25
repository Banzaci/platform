"use client";

import {
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import ImageUpload from "./ImageUpload";
import { PropertyImage } from "@/types";

type Props = {
  tenantId: string;
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
};

export default function PropertyImagesEditor({
  tenantId,
  images,
  onChange,
}: Props) {
  function moveImage(
    index: number,
    direction: "left" | "right"
  ) {
    const newIndex =
      direction === "left"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= images.length
    ) {
      return;
    }

    const next = [...images];

    [next[index], next[newIndex]] = [
      next[newIndex],
      next[index],
    ];

    onChange(next);
  }

  function removeImage(index: number) {
    onChange(
      images.filter((_, i) => i !== index)
    );
  }

  return (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Images
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          The first image will be used as the cover.
        </p>
      </div>

      {images.length > 0 && (
        <span className="text-xs text-gray-400">
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      )}
    </div>

    {images.length > 0 && (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.publicId}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
          >
            <img
              src={image.url}
              alt=""
              className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />

            {/* Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />

            {/* Cover badge */}
            {index === 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                Cover
              </span>
            )}

            {/* Position */}
            <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-white/90 px-1.5 text-[11px] font-medium text-gray-700 shadow-sm backdrop-blur">
              {index + 1}
            </span>

            {/* Actions */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between p-3 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveImage(index, "left")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Move image left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => moveImage(index, "right")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Move image right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-600"
                aria-label="Delete image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    <ImageUpload
        tenantId={tenantId}
        onChange={(image) => {
          if (!image) return;
          onChange([
            ...images,
            image,
          ]);
        }}
      />
  </div>
);
}