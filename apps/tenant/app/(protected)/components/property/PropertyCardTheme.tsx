"use client";

import { X } from "lucide-react";
import { GlobalTheme } from "@/types";
import DevLabel from "@/helpers/DevLabel";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { ColorField } from "../ColorField";
import { SelectField } from "../SelectField";

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
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={onClose}>
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
          name="PropertyCardTheme"
          file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/property/PropertyCardTheme.tsx"
        />
        <div className="flex items-center justify-between bg-gray-100 border-b border-b-gray-200 px-7 pt-5 pb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-950">
              Property card design
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Edit the property content shown in this section.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5 p-6">
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
          <SelectField
            label="Border radius"
            value={card_radius}
            options={[
              { value: "0px", label: "None" },
              { value: "8px", label: "Small" },
              { value: "16px", label: "Medium" },
              { value: "24px", label: "Large" },
              { value: "32px", label: "Extra large" },
            ]}
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "borderRadius",
                value
              )
            }
            onReset={() =>
              resetCard("borderRadius")
            }
          />
          <SelectField
            label="Shadow"
            value={card_shadow}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "shadow",
                value as "none" | "sm" | "md" | "lg"
              )
            }
            onReset={() =>
              resetCard("shadow")
            }
          />
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
          <SelectField
            label="Button radius"
            value={button_radius}
            options={[
              { value: "0px", label: "None" },
              { value: "8px", label: "Small" },
              { value: "12px", label: "Medium" },
              { value: "16px", label: "Large" },
              { value: "24px", label: "Extra large" },
            ]}
            onChange={(value) =>
              updateThemeGroup(
                "button",
                "borderRadius",
                value
              )
            }
            onReset={() =>
              resetButton("borderRadius")
            }
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-t-gray-200 bg-gray-100 px-7 py-5">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}