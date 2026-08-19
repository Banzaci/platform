type ColorFieldProps = {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
};

export function ColorField({
  label,
  value,
  onChange,
}: ColorFieldProps) {
  const hasColor = Boolean(value);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-gray-300">
        <input
          type="color"
          value={value ?? "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer"
        />

        {!hasColor && (
          <div className="pointer-events-none absolute inset-0 bg-white">
            <span className="absolute left-1/2 top-1/2 h-0.5 w-14 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-500" />
            <span className="absolute left-1/2 top-1/2 h-0.5 w-14 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red-500" />
          </div>
        )}
      </div>
    </label>
  );
}