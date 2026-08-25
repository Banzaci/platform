import { ChevronDown } from "lucide-react";
import { Field } from "./Field";
import DevLabel from "@/helpers/DevLabel";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  options: Option[];
  placeholder?: string;
};

export function SelectField({
  label,
  value,
  onChange,
  onReset,
  options,
  placeholder = "Select",
}: Props) {
  return (
    <Field
      label={label}
      overridden={!!value}
      onReset={onReset}
    >
      <div className="relative flex items-center rounded-xl border border-gray-200 bg-white transition hover:border-gray-300">
        <DevLabel
          name="SF"
          file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/SelectField.tsx"
        />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent px-3 py-3 pr-10 text-sm text-gray-600 outline-none"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400" />
      </div>
    </Field>
  );
}