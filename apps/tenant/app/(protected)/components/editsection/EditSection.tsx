/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import ContentEditor from "./ContentEditor";
import ThemeEditor from "./ThemeEditor";
import EditButton from "../EditButton";
import { apiClient } from "@/libs/api";
import { SectionType } from "../../types/section";
import { useSettings } from "@/providers/SettingsProvider";

type ImageResponse = {
  url: string;
  public_id: string;
};

export default function EditSection({
  section,
  pageId,
  sections,
}: {
  section: SectionType;
  pageId: string;
  sections: SectionType[];
}) {
  const { tenantId } = useSettings();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(section.content ?? {});
  const [localTheme, setLocalTheme] = useState(section.theme ?? {});
  const [saving, setSaving] = useState(false);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.api<ImageResponse>(
      `v1/tenants/${tenantId}/uploads/image`,
      {
        method: "POST",
        body: formData,
      }
    );
  }
  
  function openEditor() {
    setContent(section.content ?? {});
    setOpen(true);
  }

  function cancel() {
    setContent(section.content ?? {});
    setOpen(false);
  }

  async function deleteImage(publicId: string) {
    await apiClient.api(
      `v1/tenants/${tenantId}/uploads/image`,
      {
        method: "DELETE",
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );
  }

  async function save() {
    setSaving(true);
    try {
      let updatedContent = content;
      const image = content.image;
      if (image?.file) {
        const uploaded = await uploadImage(image.file);
        updatedContent = {
          ...content,
          image: {
            url: uploaded.url,
            publicId: uploaded.public_id,
            position: content?.image?.position,
          },
        };
      }

      // Bild borttagen
      else if (image?.deletePublicId) {
        updatedContent = {
          ...content,
          image: undefined,
        };
      }

      const updatedSections = sections.map((item) =>
        item.id === section.id
          ? {
              ...item,
              content: updatedContent,
              theme: localTheme,
            }
          : item
      );

      await apiClient.api<any>(
        `v1/tenants/${tenantId}/pages/${pageId}`,
        {
          method: "PUT",
          body: JSON.stringify({ sections: updatedSections,}),
        }
      );

      if (image?.file && image.publicId) {
        await deleteImage(image.publicId);
      }

      if (image?.deletePublicId) {
        await deleteImage(image.deletePublicId);
      }
      window.location.reload();
    } catch (error) {
      console.error("Save section failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <EditButton onClick={openEditor} />
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={cancel}
          >
            <div
              className="
                flex max-h-[92vh] w-full max-w-2xl
                flex-col overflow-hidden
                rounded-3xl
                bg-white
                text-black
                shadow-2xl
              "
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-gray-100 border-b border-b-gray-200 px-7 pt-5 pb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-950">
                    Edit {section.type.replaceAll("-", " ")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit the main content shown in this section.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cancel}
                  disabled={saving}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-7 py-6">
                <ContentEditor
                  section={section}
                  content={content}
                  onChange={setContent}
                />
                <ThemeEditor
                  theme={localTheme}
                  onChange={setLocalTheme}
                />
              </div>
              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-t-gray-200 bg-gray-100 px-7 py-5">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={saving}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}