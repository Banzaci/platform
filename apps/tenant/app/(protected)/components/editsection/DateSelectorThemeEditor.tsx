import DevLabel from "@/helpers/DevLabel";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { GlobalTheme } from "@/types";
import { ColorField } from "../ColorField";
import { SelectField } from "../SelectField";

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
        <SelectField
          label="Width"
          value={date_width}
          placeholder="Body font"
          options={[
              { value: "50%", label: "50%" },
              { value: "75%", label: "75%" },
              { value: "100%", label: "100%" },
            ]}
          onChange={(value) =>
            updateDate(
              "width",
              value as "50%" | "100%" | undefined
            )
          }
        />
        <SelectField
            label="Shadow"
            value={date_shadow}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
            onChange={(value) =>
              updateDate(
                "shadow",
                value as "none" | "sm" | "md" | "lg" | undefined
              )
            }
          />
      </div>
    </div>
  );
}