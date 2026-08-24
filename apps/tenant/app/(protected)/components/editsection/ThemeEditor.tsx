"use client";

import { SectionTheme, TenantFont } from "@/types";
import DevLabel from "@/helpers/DevLabel";

type Props = {
  theme: SectionTheme;
  fonts: TenantFont[];
  onChange: (theme: SectionTheme) => void;
};

export default function ThemeEditor({
  theme,
  fonts,
  onChange,
}: Props) {
  function updateButton(
    key: keyof NonNullable<SectionTheme["button"]>,
    value: string
  ) {
    onChange({
      ...theme,
      button: {
        ...theme.button,
        [key]: value,
      },
    });
  }

  function resetButton(
    key: keyof NonNullable<SectionTheme["button"]>
  ) {
    const nextButton = {
      ...(theme.button ?? {}),
    };

    delete nextButton[key];

    onChange({
      ...theme,
      button: nextButton,
    });
  }

  function update(
    key: keyof SectionTheme,
    value: string
  ) {
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
    <div className="relative mt-8 border-t pt-6 text-black">
      <DevLabel
        name="ThemeEditor"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/editsection/ThemeEditor.tsx"
      />

      <h3 className="mb-5 text-lg font-semibold">
        Theme
      </h3>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Background
            </span>

            {theme.backgroundColor && (
              <button
                type="button"
                onClick={() =>
                  reset("backgroundColor")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.backgroundColor ??
              "#ffffff"
            }
            onChange={(e) =>
              update(
                "backgroundColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Text color
            </span>

            {theme.textColor && (
              <button
                type="button"
                onClick={() =>
                  reset("textColor")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.textColor ??
              "#000000"
            }
            onChange={(e) =>
              update(
                "textColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Primary color
            </span>

            {theme.primaryColor && (
              <button
                type="button"
                onClick={() =>
                  reset("primaryColor")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.primaryColor ??
              "#000000"
            }
            onChange={(e) =>
              update(
                "primaryColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Secondary color
            </span>

            {theme.secondaryColor && (
              <button
                type="button"
                onClick={() =>
                  reset("secondaryColor")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.secondaryColor ??
              "#666666"
            }
            onChange={(e) =>
              update(
                "secondaryColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Body font
            </span>

            {theme.fontFamily && (
              <button
                type="button"
                onClick={() =>
                  reset("fontFamily")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <select
            value={theme.fontFamily ?? ""}
            onChange={(e) =>
              update(
                "fontFamily",
                e.target.value
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Use global font
            </option>

            {fonts.map((font) => (
              <option
                key={font.id}
                value={font.name}
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Heading font
            </span>

            {theme.headingFontFamily && (
              <button
                type="button"
                onClick={() =>
                  reset(
                    "headingFontFamily"
                  )
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <select
            value={
              theme.headingFontFamily ??
              ""
            }
            onChange={(e) =>
              update(
                "headingFontFamily",
                e.target.value
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Use global heading font
            </option>

            {fonts.map((font) => (
              <option
                key={font.id}
                value={font.name}
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Button color
            </span>

            {theme.button?.backgroundColor && (
              <button
                type="button"
                onClick={() =>
                  resetButton(
                    "backgroundColor"
                  )
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.button?.backgroundColor ??
              "#111111"
            }
            onChange={(e) =>
              updateButton(
                "backgroundColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Button text color
            </span>

            {theme.button?.textColor && (
              <button
                type="button"
                onClick={() =>
                  resetButton(
                    "textColor"
                  )
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={
              theme.button?.textColor ??
              "#ffffff"
            }
            onChange={(e) =>
              updateButton(
                "textColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Font size
            </span>

            {theme.fontSize && (
              <button
                type="button"
                onClick={() =>
                  reset("fontSize")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            value={theme.fontSize ?? ""}
            placeholder="16px"
            onChange={(e) =>
              update(
                "fontSize",
                e.target.value
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Padding top
            </span>

            {theme.paddingTop && (
              <button
                type="button"
                onClick={() =>
                  reset("paddingTop")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            value={
              theme.paddingTop ?? ""
            }
            placeholder="80px"
            onChange={(e) =>
              update(
                "paddingTop",
                e.target.value
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Padding bottom
            </span>

            {theme.paddingBottom && (
              <button
                type="button"
                onClick={() =>
                  reset("paddingBottom")
                }
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            value={
              theme.paddingBottom ?? ""
            }
            placeholder="80px"
            onChange={(e) =>
              update(
                "paddingBottom",
                e.target.value
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}