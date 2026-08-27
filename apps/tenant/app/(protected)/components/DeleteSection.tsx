/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";
import { revalidateTenant } from "@/helpers/revalidateTenant";

type Props = {
  section: any;
  sections: any[];
  pageId: string;
};

export default function DeleteSection({
  section,
  sections,
  pageId,
}: Props) {
  const { tenantId } = useSettings();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    const updatedSections = sections.filter(
      (item) => item.id !== section.id
    );

    setDeleting(true);

    try {
      await apiClient.api<any>(
        `v1/tenants/${tenantId}/pages/${pageId}`,
        {
          method: "PUT",
          body: JSON.stringify({sections: updatedSections}),
        }
      );
      await revalidateTenant(window.location.host);
      window.location.reload();
    } catch (error) {
      console.error("Delete section failed:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Delete section"
        className="cursor-pointer rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700 absolute bottom-1 right-1"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-400 flex items-center justify-center bg-black/50 p-6 text-black">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">
              Delete section?
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this{" "}
              <strong>{section.type}</strong> section?
              This cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="rounded-lg px-5 py-3"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-3 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}