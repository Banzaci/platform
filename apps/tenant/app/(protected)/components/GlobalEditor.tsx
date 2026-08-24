/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SectionTheme, TenantFont } from "@/types";
import { useState } from "react";
import DevLabel from "@/helpers/DevLabel";
import { apiClient } from "@/libs/api";

export default function GlobalEditor({
  tenantId,
  theme,
  fonts
}: {
  tenantId: string;
  theme: SectionTheme;
  fonts: TenantFont[]
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
    setSaving(true);
    try {
      await apiClient.api<any>(
        `v1/tenants/${tenantId}/theme`,
        {
          method: "PUT",
          body: JSON.stringify(
            {
              backgroundColor: form.backgroundColor,
              textColor: form.textColor,
              primaryColor: form.primaryColor,
              secondaryColor: form.secondaryColor,
              navigation: form.navigation,
              fonts: {
                body: form.fonts?.body || null,
                heading: form.fonts?.heading || null,
              },
            }
          ),
        }
      );
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
      <DevLabel
        name="GlobalEditor"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/GlobalEditor.tsx"
      />
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

                <select
                  value={form.fonts?.body ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fonts: {
                        ...current.fonts,
                        body: e.target.value || null,
                      },
                    }))
                  }
                  className="w-full rounded-lg border px-4 py-3"
                >
                  <option value="">Default font</option>

                  {fonts.map((font) => (
                    <option
                      key={font.id}
                      value={font.name}
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Heading font
                </span>

                <select
                  value={form.fonts?.heading ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fonts: {
                        ...current.fonts,
                        heading: e.target.value || null,
                      },
                    }))
                  }
                  className="w-full rounded-lg border px-4 py-3"
                >
                  <option value="">Default heading font</option>

                  {fonts.map((font) => (
                    <option
                      key={font.id}
                      value={font.name}
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
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
              <div className="border-t pt-5">
                <h3 className="mb-4 text-base font-semibold">
                  Navigation
                </h3>

                <div className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Background color
                    </span>

                    <input
                      type="color"
                      value={form.navigation.backgroundColor}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          navigation: {
                            ...current.navigation,
                            backgroundColor: e.target.value,
                          },
                        }))
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
                      value={form.navigation.textColor}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          navigation: {
                            ...current.navigation,
                            textColor: e.target.value,
                          },
                        }))
                      }
                      className="h-10 w-full cursor-pointer"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Hover color
                    </span>

                    <input
                      type="color"
                      value={form.navigation.hoverColor}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          navigation: {
                            ...current.navigation,
                            hoverColor: e.target.value,
                          },
                        }))
                      }
                      className="h-10 w-full cursor-pointer"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Active color
                    </span>

                    <input
                      type="color"
                      value={form.navigation.activeColor}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          navigation: {
                            ...current.navigation,
                            activeColor: e.target.value,
                          },
                        }))
                      }
                      className="h-10 w-full cursor-pointer"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Navigation font
                    </span>

                    <select
                      value={form.navigation.fontFamily ?? ""}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          navigation: {
                            ...current.navigation,
                            fontFamily: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border px-4 py-3"
                    >
                      <option value="">Default font</option>

                      {fonts.map((font) => (
                        <option
                          key={font.id}
                          value={font.name}
                        >
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
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
