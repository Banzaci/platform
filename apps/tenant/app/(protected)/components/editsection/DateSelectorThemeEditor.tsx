import { SectionTheme } from "@/types";

type Props = {
  theme: SectionTheme;
  onChange: (theme: SectionTheme) => void;
};

export default function DateSelectorThemeEditor({
  theme,
  onChange,
}: Props) {
  function update(
    key: keyof NonNullable<SectionTheme["dateSelector"]>,
    value: string
  ) {
    onChange({
      ...theme,
      dateSelector: {
        ...theme.dateSelector,
        [key]: value,
      },
    });
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="mb-5 font-semibold">
        Date selector
      </h4>

      <div className="grid grid-cols-2 gap-5">
        <label>
          <span className="mb-2 block text-sm font-medium">
            Selected date
          </span>
          <input
            type="color"
            value={
              theme.dateSelector?.selectedColor ??
              "#111111"
            }
            onChange={(e) =>
              update(
                "selectedColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Selected background
          </span>

          <input
            type="color"
            value={
              theme.dateSelector?.selectedBackgroundColor ??
              "#eeeeee"
            }
            onChange={(e) =>
              update(
                "selectedBackgroundColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium">
            Background
          </span>

          <input
            type="color"
            value={
              theme.dateSelector?.backgroundColor ??
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
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Text color
          </span>

          <input
            type="color"
            value={
              theme.dateSelector?.textColor ??
              "#111111"
            }
            onChange={(e) =>
              update(
                "textColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Border color
          </span>

          <input
            type="color"
            value={
              theme.dateSelector?.borderColor ??
              "#dddddd"
            }
            onChange={(e) =>
              update(
                "borderColor",
                e.target.value
              )
            }
            className="h-10 w-full cursor-pointer"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Width
          </span>

          <select
            value={
              theme.dateSelector?.width ??
              "50%"
            }
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
            value={
              theme.dateSelector?.shadow ??
              "sm"
            }
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