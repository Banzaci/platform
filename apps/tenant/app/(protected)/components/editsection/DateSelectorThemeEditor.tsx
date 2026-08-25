import DevLabel from "@/helpers/DevLabel";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { GlobalTheme } from "@/types";
import { ColorField } from "../ColorField";

type Props = {
  globalTheme: GlobalTheme;
  onChange: (globalTheme: GlobalTheme) => void;
};

export default function DateSelectorThemeEditor({
  globalTheme,
  onChange,
}: Props) {
  function update(key: keyof NonNullable<GlobalTheme["dateSelector"]>, value: string) {
    onChange({
      ...globalTheme,
      dateSelector: {
        ...globalTheme.dateSelector,
        [key]: value,
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
    <div className="relative mt-8 border-t pt-6">
      <DevLabel
        name="DateSelectorThemeEditor"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/editsection/DateSelectorThemeEditor.tsx"
      />
      <h4 className="mb-5 font-semibold">
        Date selector
      </h4>

      <div className="grid grid-cols-2 gap-5">
        <ColorField
          label="Selected color"
          value={date_selected_color}
          onChange={(value) =>
            update(
              "selectedColor",
              value
            )
          }
          onReset={() => reset("backgroundColor")}
        />
        <ColorField
          label="Secondary color"
          value={date_secondary}
          onChange={(value) =>
            update(
              "secondaryColor",
              value
            )
          }
        />
        <ColorField
          label="Selected background color"
          value={date_selected_background}
          onChange={(value) =>
            update(
              "selectedBackgroundColor",
              value
            )
          }
        />
        <ColorField
          label="Background color"
          value={date_background}
          onChange={(value) =>
            update(
              "backgroundColor",
              value
            )
          }
        />
        <ColorField
          label="Text color"
          value={date_text}
          onChange={(value) =>
            update(
              "textColor",
              value
            )
          }
        />
        <ColorField
          label="Border color"
          value={date_border}
          onChange={(value) =>
            update(
              "borderColor",
              value
            )
          }
        />
        <label>
          <span className="mb-2 block text-sm font-medium">
            Width
          </span>
          <select
            value={ date_width ?? "50%" }
            onChange={(e) =>
              update(
                "width",
                e.target.value
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
          <select
            value={ date_shadow ?? "sm" }
            onChange={(e) =>
              update(
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
        </label>
      </div>
    </div>
  );
}