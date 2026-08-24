"use client";

import { ChangeEvent, useState } from "react";

import { apiClient } from "@/libs/api";

type UploadLogoResponse = {
  id: string;
  name: string;
  logo_url: string | null;
};

export default function TenantLogoUpload({
  tenantId,
  currentLogoUrl,
}: {
  tenantId: string;
  currentLogoUrl?: string | null;
}) {
  const [logoUrl, setLogoUrl] = useState(
    currentLogoUrl ?? null
  );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    setUploading(true);
    setError("");

    try {
      const result =
        await apiClient.api<UploadLogoResponse>(
          `v1/tenants/${tenantId}/logo`,
          {
            method: "POST",
            body: formData,
          }
        );

      setLogoUrl(result.logo_url);
    } catch (error) {
      console.error(error);

      setError(
        "Could not upload logo."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-4">
      <h3 className="font-medium text-gray-900">
        Logo
      </h3>

      <div className="mt-4 flex items-center gap-5">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Hotel logo"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-400">
              No logo
            </span>
          )}
        </div>

        <label className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          {uploading
            ? "Uploading..."
            : "Upload logo"}

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}