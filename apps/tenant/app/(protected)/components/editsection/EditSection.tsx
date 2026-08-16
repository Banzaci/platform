/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";

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
  const [content, setContent] = useState(
    section.content ?? {}
  );
  const [theme, setTheme] = useState(
    section.theme ?? {}
  );
  const [saving, setSaving] = useState(false);

  function openEditor() {
    setContent(section.content ?? {});
    setTheme(section.theme ?? {});
    setOpen(true);
  }

  function cancel() {
    setContent(section.content ?? {});
    setTheme(section.theme ?? {});
    setOpen(false);
  }

  async function save() {
    if (!API_URL) return;

    setSaving(true);

    const updatedSections = sections.map((item) =>
      item.id === section.id
        ? {
            ...item,
            content,
            theme,
          }
        : item
    );

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

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
      console.error("Save section failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="
          absolute right-4 top-4 z-30
          flex items-center gap-2
          rounded-full
          bg-black/90
          px-4 py-2
          text-sm font-medium text-white
          shadow-lg
          opacity-0
          backdrop-blur
          transition
          hover:bg-black
          group-hover:opacity-100
        "
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
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
            {/* Header */}
            <div className="flex items-center justify-between border-b px-7 py-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Section
                </div>

                <h2 className="mt-1 text-xl font-semibold capitalize">
                  Edit {section.type.replaceAll("-", " ")}
                </h2>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
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
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t bg-gray-50 px-7 py-5">
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
        </div>
      )}
    </>
  );
}