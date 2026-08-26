import { Palette, Copy } from "lucide-react";
import DevLabel from "@/helpers/DevLabel";
import { Field } from "./Field";

export function ColorField({
  label,
  value,
  onChange,
  onReset,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  function updateColor(nextValue: string) {
    const color = nextValue.trim();

    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      onChange(color);
    }
  }

  return (
    <Field
      label={label}
      overridden={!!value}
      onReset={onReset}
    >
      <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-gray-300">
        <DevLabel
          name="CF"
          file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/ColorField.tsx"
        />

        {value ? (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          />
        ) : (
          <label className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600">
            <Palette className="h-4 w-4" />
            <input
              type="color"
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        )}

        <input
          type="text"
          value={value?.toUpperCase() ?? ""}
          placeholder="No color"
          onChange={(e) => {
            const nextValue = e.target.value;

            if (nextValue === "") {
              return;
            }

            updateColor(nextValue);
          }}
          onPaste={(e) => {
            e.preventDefault();

            const pasted =
              e.clipboardData.getData("text");

            updateColor(pasted);
          }}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-gray-600 outline-none placeholder:text-gray-400"
        />
        {value && (
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(value)
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            title="Copy color"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
    </Field>
  );
}