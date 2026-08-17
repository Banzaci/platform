"use client";

import { SectionTheme } from "@/types";
import { useState } from "react";
import { API_URL, TOKEN_NAME } from "../types";


export default function GlobalEditor({
  tenantId,
  theme,
}: {
  tenantId: string;
  theme: SectionTheme;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(theme);
  const [saving, setSaving] = useState(false);

  function update(key: keyof SectionTheme, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function save() {
    if (!API_URL) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_NAME ?? "token");

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/theme`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Theme save failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Global editor button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-100 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        ⚙️ Global
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-6 text-black">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Global Theme
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Background color
                </span>

                <input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(e) =>
                    update("backgroundColor", e.target.value)
                  }
                  className="h-10 w-full cursor-pointer"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Text color
                </span>

                <input
                  type="color"
                  value={form.textColor}
                  onChange={(e) =>
                    update("textColor", e.target.value)
                  }
                  className="h-10 w-full cursor-pointer"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Primary color
                </span>

                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    update("primaryColor", e.target.value)
                  }
                  className="h-10 w-full cursor-pointer"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Secondary color
                </span>

                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) =>
                    update("secondaryColor", e.target.value)
                  }
                  className="h-10 w-full cursor-pointer"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Font family
                </span>

                <input
                  value={form.fontFamily}
                  onChange={(e) =>
                    update("fontFamily", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Heading font
                </span>

                <input
                  value={form.headingFontFamily}
                  onChange={(e) =>
                    update("headingFontFamily", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Font size
                </span>

                <input
                  value={form.fontSize}
                  onChange={(e) =>
                    update("fontSize", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-5 py-3"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save theme"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
