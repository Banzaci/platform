"use client";

import { GlobalTheme, SectionTheme, TenantFont } from "@/types";
import DevLabel from "@/helpers/DevLabel";
import { ColorField } from "../ColorField";
import { Field } from "../Field";

type Props = {
  theme: SectionTheme;
  fonts: TenantFont[];
  onChange: (theme: SectionTheme) => void;
};

export const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

export default function ThemeEditor({
  theme,
  fonts,
  onChange,
}: Props) {
  function updateButton(key: keyof NonNullable<GlobalTheme["button"]>, value: string) {
    onChange({
      ...theme,
      button: {
        ...theme.button,
        [key]: value,
      },
    });
  }

  function resetButton(key: keyof NonNullable<GlobalTheme["button"]>) {
    const nextButton = {
      ...(theme.button ?? {}),
    };
    delete nextButton[key];
    onChange({
      ...theme,
      button: nextButton,
    });
  }

  function update(key: keyof SectionTheme, value: string) {
    onChange({
      ...theme,
      [key]: value,
    });
  }

  function reset(key: keyof SectionTheme) {
    const next = { ...theme };
    delete next[key];
    onChange(next);
  }

  return (
  <div className="relative mt-8 border-t border-gray-200 pt-8 text-black">
    <DevLabel
      name="ThemeEditor"
      file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/editsection/ThemeEditor.tsx"
    />

    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-950">
        Theme
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Override the global design for this section.
      </p>
    </div>

    <div className="space-y-5">
      {/* Colors */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900">
            Colors
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Customize the section background and text colors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorField
            label="Background"
            value={theme.backgroundColor}
            onChange={(value) => update("backgroundColor", value)}
            onReset={() => reset("backgroundColor")}
          />
          <ColorField
            label="Text color"
            value={theme.textColor}
            onChange={(value) => update("textColor", value)}
            onReset={() => reset("textColor")}
          />

          <ColorField
            label="Primary color"
            value={theme.primaryColor}
            onChange={(value) => update("primaryColor", value)}
            onReset={() => reset("primaryColor")}
          />

          <ColorField
            label="Secondary color"
            value={theme.secondaryColor}
            onChange={(value) => update("secondaryColor", value)}
            onReset={() => reset("secondaryColor")}
          />
        </div>
      </section>

      {/* Typography */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900">
            Typography
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Control fonts and text sizing for this section.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Body font"
            overridden={!!theme.fontFamily}
            onReset={() => reset("fontFamily")}
          >
            <select
              value={theme.fontFamily ?? ""}
              onChange={(e) =>
                update("fontFamily", e.target.value)
              }
              className={inputClassName}
            >
              <option value="">Use global font</option>

              {fonts.map((font) => (
                <option key={font.id} value={font.name}>
                  {font.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Heading font"
            overridden={!!theme.headingFontFamily}
            onReset={() => reset("headingFontFamily")}
          >
            <select
              value={theme.headingFontFamily ?? ""}
              onChange={(e) =>
                update("headingFontFamily", e.target.value)
              }
              className={inputClassName}
            >
              <option value="">
                Use global heading font
              </option>

              {fonts.map((font) => (
                <option key={font.id} value={font.name}>
                  {font.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Font size"
            overridden={!!theme.fontSize}
            onReset={() => reset("fontSize")}
          >
            <input
              value={theme.fontSize ?? ""}
              placeholder="16px"
              onChange={(e) =>
                update("fontSize", e.target.value)
              }
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      {/* Button */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900">
            Button
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Override button colors inside this section.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorField
            label="Button color"
            value={theme.button?.backgroundColor}
            onChange={(value) =>
              updateButton("backgroundColor", value)
            }
            onReset={() =>
              resetButton("backgroundColor")
            }
          />

          <ColorField
            label="Button text"
            value={theme.button?.textColor}
            onChange={(value) =>
              updateButton("textColor", value)
            }
            onReset={() =>
              resetButton("textColor")
            }
          />
        </div>
      </section>

      {/* Spacing */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-900">
            Spacing
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Adjust vertical spacing for this section.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Padding top"
            overridden={!!theme.paddingTop}
            onReset={() => reset("paddingTop")}
          >
            <input
              value={theme.paddingTop ?? ""}
              placeholder="80px"
              onChange={(e) =>
                update("paddingTop", e.target.value)
              }
              className={inputClassName}
            />
          </Field>

          <Field
            label="Padding bottom"
            overridden={!!theme.paddingBottom}
            onReset={() => reset("paddingBottom")}
          >
            <input
              value={theme.paddingBottom ?? ""}
              placeholder="80px"
              onChange={(e) =>
                update("paddingBottom", e.target.value)
              }
              className={inputClassName}
            />
          </Field>
        </div>
      </section>
    </div>
  </div>
);
}