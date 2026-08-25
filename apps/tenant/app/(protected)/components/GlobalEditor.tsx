/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GlobalTheme, TenantFont } from "@/types";
import { useState } from "react";
import DevLabel from "@/helpers/DevLabel";
import { apiClient } from "@/libs/api";
import { ColorField } from "./ColorField";
import { Field } from "./Field";

type GlobalBaseTheme = NonNullable<GlobalTheme["global"]>;
type NavigationKey = keyof NonNullable<GlobalTheme["navigation"]>;

export default function GlobalEditor({
  tenantId,
  globalTheme,
  fonts
}: {
  tenantId: string;
  globalTheme: GlobalTheme;
  fonts: TenantFont[]
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GlobalTheme>(globalTheme);
  const [saving, setSaving] = useState(false);
  console.log(form)
  function updateGlobal<K extends keyof GlobalBaseTheme>(key: K, value: GlobalBaseTheme[K]) {
    setForm((current) => ({
      ...current,
      global: {
        ...(current?.global ?? {}),
        [key]: value,
      },
    }));
  }
  function resetGlobal(key: keyof GlobalBaseTheme) {
    setForm((current) => ({
      ...current,
      global: {
        ...(current?.global ?? {}),
        [key]: undefined,
      },
    }));
  }

  function updateNavigation<K extends NavigationKey>(key: K,
    value: NonNullable<GlobalTheme["navigation"]>[K]
  ) {
    setForm((current) => ({
      ...current,
      navigation: {
        ...(current.navigation ?? {}),
        [key]: value,
      },
    }));
  }

  function resetNavigation(key: NavigationKey) {
    setForm((current) => ({
      ...current,
      navigation: {
        ...(current.navigation ?? {}),
        [key]: undefined,
      },
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
              global: {
                backgroundColor: form?.global.backgroundColor,
                textColor: form?.global.textColor,
                primaryColor: form?.global.primaryColor,
                secondaryColor: form?.global.secondaryColor,
              },
              navigation: form?.navigation,
              fonts: {
                body: form?.fonts?.body || null,
                heading: form?.fonts?.heading || null,
              },
            }
          ),
        }
      );
      setOpen(false);
      // window.location.reload();
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
              <ColorField
                label="Background color"
                value={form?.global?.backgroundColor}
                onChange={(value) =>
                  updateGlobal("backgroundColor", value)
                }
                onReset={() =>
                  resetGlobal("backgroundColor")
                }
              />
              <ColorField
                label="Text color"
                value={form?.global?.textColor}
                onChange={(value) =>
                  updateGlobal("textColor", value)
                }
                onReset={() =>
                  resetGlobal("textColor")
                }
              />

              <ColorField
                label="Primary color"
                value={form?.global?.primaryColor}
                onChange={(value) =>
                  updateGlobal("primaryColor", value)
                }
                onReset={() =>
                  resetGlobal("primaryColor")
                }
              />
              <ColorField
                label="Secondary color"
                value={form?.global?.secondaryColor}
                onChange={(value) =>
                  updateGlobal("secondaryColor", value)
                }
                onReset={() =>
                  resetGlobal("secondaryColor")
                }
              />

              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Font family
                </span>
                <select
                  value={form?.fonts?.body ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fonts: {
                        ...(current.fonts ?? {}),
                        body: e.target.value || undefined,
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
                  value={form?.fonts?.body ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fonts: {
                        ...(current.fonts ?? {}),
                        heading: e.target.value || undefined,
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
              {/* <Field
                label="Font size"
                overridden={!!form.global?.fontSize}
                onReset={() => resetGlobal("fontSize")}
              >
                <input
                  value={form.global?.fontSize ?? ""}
                  onChange={(e) =>
                    updateGlobal("fontSize", e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </Field> */}
              <div className="border-t pt-5">
                <h3 className="mb-4 text-base font-semibold">
                  Navigation
                </h3>
                <div className="space-y-5">
                  <ColorField
                    label="Background color"
                    value={form?.navigation?.backgroundColor}
                    onChange={(value) =>
                      updateNavigation("backgroundColor", value)
                    }
                    onReset={() =>
                      resetNavigation("backgroundColor")
                    }
                  />
                  <ColorField
                    label="Text color"
                    value={form?.navigation?.textColor}
                    onChange={(value) =>
                      updateNavigation("textColor", value)
                    }
                    onReset={() =>
                      resetNavigation("textColor")
                    }
                  />
                  <ColorField
                    label="Hover color"
                    value={form?.navigation?.hoverColor}
                    onChange={(value) =>
                      updateNavigation("hoverColor", value)
                    }
                    onReset={() =>
                      resetNavigation("hoverColor")
                    }
                  />
                  <ColorField
                    label="activeColor color"
                    value={form?.navigation?.activeColor}
                    onChange={(value) =>
                      updateNavigation("activeColor", value)
                    }
                    onReset={() =>
                      resetNavigation("activeColor")
                    }
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">
                      Navigation font
                    </span>
                    <select
                      value={form?.navigation?.fontFamily ?? ""}
                      onChange={(e) =>
                        updateNavigation(
                          "fontFamily",
                          e.target.value || undefined
                        )
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
