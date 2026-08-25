"use client";

import { useEffect, useState } from "react";
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
};

type Props = {
  value?: ImageValue;
  onChange: (value?: ImageValue) => void;
};

export default function ImageUpload({
  value,
  onChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value?.url ?? null
  );

  function selectImage(file: File) {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    onChange({
      url,
      file,
      publicId: value?.publicId,
    });
  }

  function remove() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    onChange({
      deletePublicId: value?.publicId,
    });
  }

  useEffect(() => {
    if (!value?.file) {
      setPreviewUrl(value?.url ?? null);
    }
  }, [value?.url, value?.file]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          <img
            src={previewUrl}
            alt=""
            className="h-48 w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition group-hover:bg-black/30">
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-gray-700 opacity-0 shadow-sm transition hover:bg-gray-50 group-hover:opacity-100">
              <Upload className="h-4 w-4" />
              Replace

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

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
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              title="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {value?.file && (
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              Unsaved
            </span>
          )}
        </div>
      ) : (
        <label
          className="
            flex h-40 w-full cursor-pointer flex-col
            items-center justify-center rounded-2xl
            border border-dashed border-gray-300 bg-gray-50
            transition hover:border-gray-400 hover:bg-gray-100
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
              const file = e.target.files?.[0];

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