"use client";

import {
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import ImageUpload from "./ImageUpload";




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
      <h3 className="mb-3 text-sm font-medium">
        Images
      </h3>

      {images.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.publicId}
              className="relative overflow-hidden rounded-xl border bg-gray-50"
            >
              <img
                src={image.url}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />

              {index === 0 && (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                  Cover
                </span>
              )}

              <div className="flex items-center justify-between p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      moveImage(index, "left")
                    }
                    className="rounded p-2 hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={
                      index === images.length - 1
                    }
                    onClick={() =>
                      moveImage(index, "right")
                    }
                    className="rounded p-2 hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
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