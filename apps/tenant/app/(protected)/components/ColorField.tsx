import { Palette } from "lucide-react";
import { Field } from "./Field";
import DevLabel from "@/helpers/DevLabel";

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
        <span
          className={`flex-1 font-mono text-sm ${
            value ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {value ? value.toUpperCase() : "No color"}
        </span>
      </div>
    </Field>
  );
}