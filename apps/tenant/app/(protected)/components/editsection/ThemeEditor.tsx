"use client";

import { Theme } from "@/types";


type Props = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

export default function ThemeEditor({
  theme,
  onChange,
}: Props) {
  function update(
    key: keyof Theme,
    value: string
  ) {
    onChange({
      ...theme,
      [key]: value,
    });
  }

  function reset(key: keyof Theme) {
    const next = { ...theme };
    delete next[key];

    onChange(next);
  }

  return (
    <div className="mt-8 border-t pt-6 text-black">
      <h3 className="mb-5 text-lg font-semibold">
        Theme
      </h3>

      <div className="grid grid-cols-2 gap-5">
        {/* Background */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Background
            </span>

            {theme.backgroundColor && (
              <button
                type="button"
                onClick={() => reset("backgroundColor")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={theme.backgroundColor ?? "#ffffff"}
            onChange={(e) =>
              update("backgroundColor", e.target.value)
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        {/* Text color */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Text color
            </span>

            {theme.textColor && (
              <button
                type="button"
                onClick={() => reset("textColor")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={theme.textColor ?? "#000000"}
            onChange={(e) =>
              update("textColor", e.target.value)
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        {/* Primary */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Primary color
            </span>

            {theme.primaryColor && (
              <button
                type="button"
                onClick={() => reset("primaryColor")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={theme.primaryColor ?? "#000000"}
            onChange={(e) =>
              update("primaryColor", e.target.value)
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        {/* Secondary */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Secondary color
            </span>

            {theme.secondaryColor && (
              <button
                type="button"
                onClick={() => reset("secondaryColor")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            type="color"
            value={theme.secondaryColor ?? "#666666"}
            onChange={(e) =>
              update("secondaryColor", e.target.value)
            }
            className="h-10 w-full cursor-pointer"
          />
        </div>

        {/* Font size */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Font size
            </span>

            {theme.fontSize && (
              <button
                type="button"
                onClick={() => reset("fontSize")}
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
              update("fontSize", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Padding top */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Padding top
            </span>

            {theme.paddingTop && (
              <button
                type="button"
                onClick={() => reset("paddingTop")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            value={theme.paddingTop ?? ""}
            placeholder="80px"
            onChange={(e) =>
              update("paddingTop", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Padding bottom */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              Padding bottom
            </span>

            {theme.paddingBottom && (
              <button
                type="button"
                onClick={() => reset("paddingBottom")}
                className="text-xs text-gray-500 hover:text-black"
              >
                Use global
              </button>
            )}
          </div>

          <input
            value={theme.paddingBottom ?? ""}
            placeholder="80px"
            onChange={(e) =>
              update("paddingBottom", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}