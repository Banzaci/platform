import DevLabel from "@/helpers/DevLabel";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { GlobalTheme } from "@/types";
import { ColorField } from "../ColorField";

type DateKey = keyof NonNullable<GlobalTheme["dateSelector"]>;
type Props = {
  globalTheme: GlobalTheme;
  onChange: (globalTheme: GlobalTheme) => void;
};

export default function DateSelectorThemeEditor({
  globalTheme,
  onChange,
}: Props) {
  function updateDate<K extends DateKey>(key: K, value: NonNullable<GlobalTheme["dateSelector"]>[K]) {
    onChange({
      ...globalTheme,
      dateSelector: {
        ...(globalTheme.dateSelector ?? {}),
        [key]: value,
      },
    });
  }

  function resetDate(key: DateKey) {
    onChange({
      ...globalTheme,
      dateSelector: {
        ...(globalTheme.dateSelector ?? {}),
        [key]: undefined,
      },
    });
  }

  const {
    date_background,
    date_border,
    date_secondary,
    date_selected_background,
    date_selected_color,
    date_shadow, 
    date_text, 
    date_width,
  } = resolveSectionTheme(globalTheme);
  return (
    <div className="relative">
      <DevLabel
        name="DateSelectorThemeEditor"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/editsection/DateSelectorThemeEditor.tsx"
      />
      <div className="grid grid-cols-2 gap-5">
        <ColorField
          label="Selected color"
          value={date_selected_color}
          onChange={(value) =>
            updateDate("selectedColor", value)
          }
          onReset={() =>
            resetDate("selectedColor")
          }
        />
        <ColorField
          label="Secondary color"
          value={date_secondary}
          onChange={(value) =>
            updateDate("secondaryColor", value)
          }
          onReset={() =>
            resetDate("secondaryColor")
          }
        />
        <ColorField
          label="Selected background color"
          value={date_selected_background}
          onChange={(value) =>
            updateDate("selectedBackgroundColor", value)
          }
          onReset={() =>
            resetDate("selectedBackgroundColor")
          }
        />
        <ColorField
          label="Background color"
          value={date_background}
          onChange={(value) =>
            updateDate("backgroundColor", value)
          }
          onReset={() =>
            resetDate("backgroundColor")
          }
        />
        <ColorField
          label="Text color"
          value={date_text}
          onChange={(value) =>
            updateDate("textColor", value)
          }
          onReset={() =>
            resetDate("textColor")
          }
        />
        <ColorField
          label="Border color"
          value={date_border}
          onChange={(value) =>
            updateDate("borderColor", value)
          }
          onReset={() =>
            resetDate("borderColor")
          }
        />
        <label>
          <span className="mb-2 block text-sm font-medium">
            Width
          </span>
          <select
            value={ date_width ?? "50%" }
            onChange={(e) =>
              updateDate(
                "width",
                e.target.value as "50%" | "100%" | undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="50%">50%</option>
            <option value="100%">100%</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Shadow
          </span>
          <select //TODO make component
            value={ date_shadow ?? "sm" }
            onChange={(e) =>
              updateDate(
                "shadow",
                e.target.value as "none" | "sm" | "md" | "lg" | undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
    </div>
  );
}