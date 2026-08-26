"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import { TenantFont } from "@/types";
import { useSettings } from "@/providers/SettingsProvider";

export default function TenantFonts() {
  const queryClient = useQueryClient();
  const { tenantId } = useSettings()
  const deleteFont = useMutation({
    mutationFn: (fontId: string) =>
      apiClient.api(
        `v1/tenants/${tenantId}/fonts/${fontId}`,
        {
          method: "DELETE",
        }
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tenant-fonts", tenantId],
      });
    },
  });
  const { data: fonts = [], isLoading, error } = useQuery({
    queryKey: ["tenant-fonts", tenantId],
    queryFn: () =>
      apiClient.api<TenantFont[]>(
        `v1/tenants/${tenantId}/fonts`
      ),
  });

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading fonts...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Could not load fonts.</p>;
  }

  if (!fonts.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">
          No fonts uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {fonts
          .map(
            (font) => `
              @font-face {
                font-family: "${font.name}";
                src: url("${font.url}") format("${font.format}");
                font-display: swap;
              }
            `
          )
          .join("\n")}
      </style>

      <div className="space-y-3">
        {fonts.map((font) => (
          <div
            key={font.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-gray-900">
                  {font.name}
                </div>

                <div className="mt-1 text-xs uppercase text-gray-400">
                  {font.format}
                </div>
              </div>

              <button
                type="button"
                disabled={deleteFont.isPending}
                onClick={() => {
                  if (window.confirm(`Delete "${font.name}"?`)) {
                    deleteFont.mutate(font.id);
                  }
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <p
              className="mt-5 text-2xl text-gray-900"
              style={{
                fontFamily: `"${font.name}"`,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </div>
    </>
  );
}