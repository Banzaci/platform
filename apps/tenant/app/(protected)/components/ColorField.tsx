import { Field } from "./Field";

export function ColorField({
  label,
  value,
  fallback,
  onChange,
  onReset,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  const color = value ?? fallback;
  return (
    <Field
      label={label}
      overridden={!!value}
      onReset={onReset}
    >
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:border-gray-300">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        />
        <span className="flex-1 font-mono text-sm text-gray-600">
          {color.toUpperCase()}
        </span>
      </div>
    </Field>
  );
}
