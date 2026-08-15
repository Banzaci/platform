"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

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
    if (!API_URL) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/uploads/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    if (!value?.publicId || !API_URL) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem(
      TOKEN_NAME ?? "token"
    );

    const response = await fetch(
      `${API_URL}v1/tenants/${tenantId}/uploads/image`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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