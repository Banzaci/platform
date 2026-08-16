/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import ContentEditor from "./ContentEditor";
import ThemeEditor from "./ThemeEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

export default function EditSection({
  section,
  pageId,
  tenantId,
  sections,
}: {
  section: any;
  pageId: string;
  tenantId: string;
  sections: any[];
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(section.content ?? {});
  const [theme, setTheme] = useState(section.theme ?? {});
  const [saving, setSaving] = useState(false);

  function cancel() {
    setContent(section.content ?? {});
    setTheme(section.theme ?? {});
    setOpen(false);
  }

  async function save() {
    if (!API_URL) return;

    setSaving(true);

    const updatedSections = sections.map((item) => {
      if (item.id !== section.id) {
        return item;
      }

      return {
        ...item,
        content,
        theme,
      };
    });

    try {
      const token = localStorage.getItem(TOKEN_NAME ?? "token");

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/pages/${pageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sections: updatedSections,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute right-4 top-4 z-20 rounded-lg bg-black px-4 py-2 text-sm text-white opacity-0 transition group-hover:opacity-100"
      >
        ✏️ Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Edit {section.type}
              </h2>

              <button
                type="button"
                onClick={cancel}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <ContentEditor
              section={section}
              content={content}
              onChange={setContent}
              tenantId={tenantId}
            />

            <ThemeEditor
              theme={theme}
              onChange={setTheme}
              sectionType={section.type}
            />

            <div className="mt-8 flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={cancel}
                disabled={saving}
                className="rounded-lg px-5 py-3 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}