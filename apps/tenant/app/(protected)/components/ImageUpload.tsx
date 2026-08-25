"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";

export type ImageValue = {
  url?: string;
  publicId?: string;
  file?: File;
  deletePublicId?: string;
  position?: {
    x: number;
    y: number;
  };
};

type Props = {
  value?: ImageValue;

  // Ny bild till exempelvis PropertyImagesEditor
  onSelect?: (image: ImageValue) => void;

  // Ändring av single image / position
  onChange?: (image: ImageValue) => void;

  onRemove?: () => void;

  compact?: boolean;
};

export default function ImageUpload({
  value,
  onChange,
  onSelect,
  onRemove,
  compact = false,
}: Props) {
  const draggingRef = useRef(false);

  // Endast blob-URL som DENNA komponent själv äger.
  const ownedBlobUrlRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value?.url ?? null
  );

  const [position, setPosition] = useState({
    x: value?.position?.x ?? 50,
    y: value?.position?.y ?? 50,
  });

  /*
   * Synka när parent skickar in en annan bild.
   * Fungerar både för:
   * - Cloudinary URL
   * - blob URL från PropertyImagesEditor
   */
  useEffect(() => {
    setPreviewUrl(value?.url ?? null);
  }, [value?.url]);

  /*
   * Synka sparad position.
   */
  useEffect(() => {
    setPosition({
      x: value?.position?.x ?? 50,
      y: value?.position?.y ?? 50,
    });
  }, [value?.position?.x, value?.position?.y]);

  /*
   * Cleanup endast för blob som denna komponent fortfarande äger.
   */
  useEffect(() => {
    return () => {
      if (ownedBlobUrlRef.current) {
        URL.revokeObjectURL(
          ownedBlobUrlRef.current
        );
      }
    };
  }, []);

  function selectImage(file: File) {
    const url = URL.createObjectURL(file);

    const nextPosition = {
      x: 50,
      y: 50,
    };

    const image: ImageValue = {
      url,
      file,
      publicId: value?.publicId,
      position: nextPosition,
    };

    /*
     * PropertyImagesEditor:
     *
     * ImageUpload används endast som picker.
     * Parent tar över ägarskapet av blob-URL:en.
     *
     * Vi ska därför INTE:
     * - setPreviewUrl(url)
     * - revoke url här
     */
    if (onSelect) {
      onSelect(image);
      return;
    }

    /*
     * Hero / vanlig single image.
     *
     * ImageUpload äger preview-URL:en.
     */
    if (ownedBlobUrlRef.current) {
      URL.revokeObjectURL(
        ownedBlobUrlRef.current
      );
    }

    ownedBlobUrlRef.current = url;

    setPosition(nextPosition);
    setPreviewUrl(url);

    onChange?.(image);
  }

  function remove() {
    if (ownedBlobUrlRef.current) {
      URL.revokeObjectURL(
        ownedBlobUrlRef.current
      );

      ownedBlobUrlRef.current = null;
    }

    setPreviewUrl(null);

    onRemove?.();
  }

  function updatePosition(
    x: number,
    y: number
  ) {
    const nextPosition = {
      x,
      y,
    };

    setPosition(nextPosition);

    onChange?.({
      ...value,
      url:
        previewUrl ??
        value?.url ??
        "",
      position: nextPosition,
    });
  }

  function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    draggingRef.current = true;

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  }

  function handlePointerMove(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (!draggingRef.current) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((e.clientY - rect.top) /
        rect.height) *
      100;

    updatePosition(
      Math.max(0, Math.min(100, x)),
      Math.max(0, Math.min(100, y))
    );
  }

  function handlePointerUp(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    draggingRef.current = false;

    if (
      e.currentTarget.hasPointerCapture(
        e.pointerId
      )
    ) {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    }
  }

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          {/* Draggable image */}
          <div
            className="relative cursor-move touch-none overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              src={previewUrl}
              alt=""
              draggable={false}
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
              }}
              className="pointer-events-none h-48 w-full select-none object-cover"
            />
          </div>

          {/* Controls */}
          {!compact && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition group-hover:bg-black/30">
              <label className="pointer-events-auto flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-gray-700 opacity-0 shadow-sm transition hover:bg-gray-50 group-hover:opacity-100">
                <Upload className="h-4 w-4" />

                Replace

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      selectImage(file);
                    }

                    e.target.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={remove}
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {value?.file && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              Unsaved
            </span>
          )}
        </div>
      ) : (
        <label
          className="
            flex h-40 w-full cursor-pointer
            flex-col items-center justify-center
            rounded-2xl border border-dashed
            border-gray-300 bg-gray-50
            transition
            hover:border-gray-400
            hover:bg-gray-100
          "
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
            <ImagePlus className="h-5 w-5 text-gray-500" />
          </div>

          <span className="text-sm font-medium text-gray-700">
            Upload image
          </span>

          <span className="mt-1 text-xs text-gray-400">
            PNG, JPG or WebP
          </span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                selectImage(file);
              }

              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}