/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GlobalTheme, TenantFont } from "@/types";
import { useState } from "react";
import DevLabel from "@/helpers/DevLabel";
import { apiClient } from "@/libs/api";
import { ColorField } from "./ColorField";
import { Check, X } from "lucide-react";
import { SelectField } from "./SelectField";

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
      window.location.reload();
    } catch (error) {
      console.error("Theme save failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-100 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        ⚙️ Global
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div
            className="
              relative
              flex max-h-[92vh] w-full max-w-2xl
              flex-col overflow-hidden
              rounded-3xl
              bg-white
              text-black
              shadow-2xl
            "
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DevLabel
              name="GlobalEditor"
              file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/GlobalEditor.tsx"
            />
            <div className="flex items-center justify-between bg-gray-100 border-b border-b-gray-200 px-7 pt-5 pb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-950">
                  Global Theme
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Edit the main content shown in this section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5 p-6">
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
              <SelectField
                label="Body font"
                value={form.fonts?.body}
                placeholder="Body font"
                options={fonts.map((font) => ({
                  value: font.name,
                  label: font.name,
                }))}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    fonts: {
                      ...(current.fonts ?? {}),
                      body: value || undefined,
                    },
                  }))
                }
                onReset={() =>
                  setForm((current) => ({
                    ...current,
                    fonts: {
                      ...(current.fonts ?? {}),
                      body: undefined,
                    },
                  }))
                }
              />
              <SelectField
                label="Heading font"
                value={form.fonts?.heading}
                placeholder="Heading font"
                options={fonts.map((font) => ({
                  value: font.name,
                  label: font.name,
                }))}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    fonts: {
                      ...(current.fonts ?? {}),
                      heading: value || undefined,
                    },
                  }))
                }
                onReset={() =>
                  setForm((current) => ({
                    ...current,
                    fonts: {
                      ...(current.fonts ?? {}),
                      heading: undefined,
                    },
                  }))
                }
              />
            </div>
            <div className="px-6">
              <h3 className="text-lg font-semibold text-gray-950">
                Global Theme
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Edit the main content shown in this section.
              </p>
            </div>
              <div className="grid grid-cols-2 gap-5 p-6">
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
                <SelectField
                  label="Navigation font"
                  value={form.navigation?.fontFamily}
                  placeholder="Default font"
                  options={fonts.map((font) => ({
                    value: font.name,
                    label: font.name,
                  }))}
                  onChange={(value) =>
                    updateNavigation(
                      "fontFamily",
                      value || undefined
                    )
                  }
                  onReset={() =>
                    resetNavigation("fontFamily")
                  }
                />
            </div>
            <div className="flex justify-end gap-3 border-t border-t-gray-200 bg-gray-100 px-7 py-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
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
    </div>
  );
}
