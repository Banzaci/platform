"use client";

import { X } from "lucide-react";
import { SectionTheme } from "@/types";
import DevLabel from "@/helpers/DevLabel";

type Props = {
  theme: SectionTheme;
  onChange: (theme: SectionTheme) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
};

type ThemeGroup =
  | "card"
  | "button"
  | "dateSelector";

export default function PropertyCardTheme({
  theme,
  onChange,
  onClose,
  onSave,
  isSaving,
}: Props) {
  
  function updateThemeGroup(group: ThemeGroup, key: string, value: string) {
    onChange({
      ...theme,
      [group]: {
        ...(theme[group] ?? {}),
        [key]: value,
      },
    });
  }

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
            value={
              theme.card?.backgroundColor ??
              "#ffffff"
            }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "backgroundColor",
                value
              )
            }
          />

          <ColorField
            label="Text"
            value={
              theme.card?.textColor ??
              "#111111"
            }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "textColor",
                value
              )
            }
          />

          <ColorField
            label="Secondary text"
            value={
              theme.card?.secondaryColor ??
              "#666666"
            }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "secondaryColor",
                value
              )
            }
          />

          <ColorField
            label="Border"
            value={
              theme.card?.borderColor ??
              "#e5e7eb"
            }
            onChange={(value) =>
              updateThemeGroup(
                "card",
                "borderColor",
                value
              )
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Border radius
            </label>

            <select
              value={
                theme.card?.borderRadius ??
                "16px"
              }
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
              value={theme.card?.shadow ?? "sm"}
              onChange={(e) =>
                updateCard(
                  "shadow",
                  e.target.value
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
            value={
              theme.button?.backgroundColor ??
              "#111111"
            }
            onChange={(value) =>
              updateThemeGroup(
                "button",
                "backgroundColor",
                value
              )
            }
          />

          <ColorField
            label="Button text"
            value={
              theme.button?.textColor ??
              "#ffffff"
            }
            onChange={(value) =>
              updateThemeGroup(
                "button",
                "textColor",
                value
              )
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium">
              Button radius
            </label>

            <select
              value={
                theme.button?.borderRadius ??
                "12px"
              }
              onChange={(e) =>
                updateThemeGroup(
                  "button",
                  "textColor",
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer"
      />
    </div>
  );
}