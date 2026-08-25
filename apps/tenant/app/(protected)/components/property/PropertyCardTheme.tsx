"use client";

import { X } from "lucide-react";
import { GlobalTheme } from "@/types";
import DevLabel from "@/helpers/DevLabel";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { ColorField } from "../ColorField";

type Props = {
  globalTheme: GlobalTheme;
  onChange: (theme: GlobalTheme) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
};

type ThemeGroup =
  | "card"
  | "button"
  | "dateSelector";

export default function PropertyCardTheme({
  globalTheme,
  onChange,
  onClose,
  onSave,
  isSaving,
}: Props) {
  function updateThemeGroup< G extends ThemeGroup, K extends keyof NonNullable<GlobalTheme[G]>>(
    group: G,
    key: K,
    value: NonNullable<GlobalTheme[G]>[K]
  ) {
    onChange({
      ...globalTheme,
      [group]: {
        ...(globalTheme[group] ?? {}),
        [key]: value,
      },
    });
  }

  function resetCard(key: keyof NonNullable<GlobalTheme["card"]>) {
    onChange({
      ...globalTheme,
      card: {
        ...globalTheme.card,
        [key]: undefined,
      },
    });
  }

  function resetButton(key: keyof NonNullable<GlobalTheme["button"]>) {
    onChange({
      ...globalTheme,
      button: {
        ...globalTheme.card,
        [key]: undefined,
      },
    });
  }

  const {
    card_text_color,
    card_background_color,
    card_secondary_color,
    card_border_color,
    card_radius,
    card_shadow,
    button_background,
    button_radius,
    button_text,
  } = resolveSectionTheme(globalTheme);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 text-black shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DevLabel
          name="PropertyCardTheme"
          file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/property/PropertyCardTheme.tsx"
        />
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Property card design
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <ColorField
            label="Background"
            value={card_background_color}
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "backgroundColor",
                value
              )
            }
            onReset={() => resetCard("backgroundColor")}
          />
          <ColorField
            label="Text"
            value={ card_text_color }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "textColor",
                value
              )
            }
            onReset={() => resetCard("textColor")}
          />

          <ColorField
            label="Secondary text"
            value={ card_secondary_color }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "secondaryColor",
                value
              )
            }
            onReset={() => resetCard("secondaryColor")}
          />

          <ColorField
            label="Border"
            value={ card_border_color }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "borderColor",
                value
              )
            }
            onReset={() => resetCard("borderColor")}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Border radius
            </label>

            <select
              value={ card_radius ?? 0 }
              onChange={(e) =>
                updateThemeGroup(
                  "card",
                  "borderRadius",
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="0px">None</option>
              <option value="8px">Small</option>
              <option value="16px">Medium</option>
              <option value="24px">Large</option>
              <option value="32px">Extra large</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Shadow
            </label>

            <select
              value={card_shadow ?? "sm"}
              onChange={(e) =>
                updateThemeGroup(
                  "card",
                  "shadow",
                  e.target.value as "none" | "sm" | "md" | "lg"
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <ColorField
            label="Button background"
            value={ button_background }
            onChange={(value) =>
              updateThemeGroup(
                "button",
                "backgroundColor",
                value
              )
            }
            onReset={() => resetButton("backgroundColor")}
          />

          <ColorField
            label="Button text"
            value={ button_text }
            onChange={(value) =>
              updateThemeGroup(
                "button",
                "textColor",
                value
              )
            }
            onReset={() => resetButton("textColor")}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Button radius
            </label>

            <select
              value={ button_radius ?? 0 }
              onChange={(e) =>
                updateThemeGroup(
                  "button",
                  "borderRadius",
                  e.target.value
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="0px">None</option>
              <option value="8px">Small</option>
              <option value="12px">Medium</option>
              <option value="16px">Large</option>
              <option value="24px">Extra large</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-black px-5 py-2.5 text-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}