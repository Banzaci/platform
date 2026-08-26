"use client";

import { useState } from "react";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";

export default function FontUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { tenantId } = useSettings()
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/fonts`,
        {
          method: "POST",
          body: formData,
        }
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <label className="mb-2 inline-flex cursor-pointer items-center rounded-lg border px-4 py-2 text-sm">
      {isUploading ? "Uploading..." : "Upload font"}

      <input
        type="file"
        accept=".woff,.woff2,font/woff,font/woff2"
        onChange={handleUpload}
        className="hidden"
      />
    </label>
  );
}