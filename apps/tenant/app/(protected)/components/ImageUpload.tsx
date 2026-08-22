/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/libs/api";

type ImageValue = {
  url: string;
  publicId: string;
};

type Props = {
  tenantId: string;
  value?: ImageValue;
  onChange: (value?: ImageValue) => void;
};

export default function ImageUpload({
  tenantId,
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.api<any>(
        `v1/tenants/${tenantId}/theme`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      onChange({
        url: data.url,
        publicId: data.public_id,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  }

  async function remove() {
    if (!value?.publicId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    const response = await apiClient.api<any>(
      `v1/tenants/${tenantId}/uploads/image`,
      {
        method: "DELETE",
          body: JSON.stringify({
          public_id: value.publicId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    onChange(undefined);
  }
  return (
    <div className="space-y-3">
      {value?.url && (
        <img
          src={value.url}
          alt=""
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
      {value?.url && (
        <button
          type="button"
          onClick={remove}
          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
          title="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            upload(file);
          }
        }}
      />

      {uploading && (
        <p className="text-sm text-gray-500">
          Uploading...
        </p>
      )}
    </div>
  );
}