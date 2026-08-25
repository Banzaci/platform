import DevLabel from "@/helpers/DevLabel";
import { Field } from "./Field";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

export function TextField({
  label,
  value,
  onChange,
  onReset,
  placeholder,
  multiline = false,
  rows = 4,
}: Props) {
  return (
    <div className="relative">
      <DevLabel
        name="TF"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/TextField.tsx"
      />

      <Field
        label={label}
        overridden={!!value}
        onReset={onReset}
      >
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300">
          {multiline ? (
            <textarea
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className="w-full resize-none bg-transparent px-3 py-3 text-sm text-gray-600 outline-none placeholder:text-gray-400"
            />
          ) : (
            <input
              type="text"
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-sm text-gray-600 outline-none placeholder:text-gray-400"
            />
          )}
        </div>
      </Field>
    </div>
  );
}