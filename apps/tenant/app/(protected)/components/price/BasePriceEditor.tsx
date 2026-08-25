"use client";

export type BasePrice = {
  daily_price: number | null;
  weekly_price: number | null;
  monthly_price: number | null;
};

export function isValidBasePrice(
  value: BasePrice
) {
  return (
    value.daily_price != null &&
    value.daily_price > 0 &&
    value.weekly_price != null &&
    value.weekly_price > 0 &&
    value.monthly_price != null &&
    value.monthly_price > 0
  );
}

type Props = {
  value: BasePrice;
  onChange: (value: BasePrice) => void;
};

export default function BasePriceEditor({
  value,
  onChange,
}: Props) {
  function update(
    key: keyof BasePrice,
    newValue: number | null
  ) {
    onChange({
      ...value,
      [key]: newValue,
    });
  }

  function discount(
    regularPrice: number,
    price: number | null
  ) {
    if (!price || regularPrice <= 0) {
      return null;
    }

    const percentage =
      ((regularPrice - price) / regularPrice) * 100;

    if (percentage <= 0) {
      return null;
    }

    return Math.round(percentage);
  }

  const weeklyDiscount = discount(
    value.daily_price * 7,
    value.weekly_price
  );

  const monthlyDiscount = discount(
    value.daily_price * 30,
    value.monthly_price
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <PriceField
          label="Nightly"
          value={value.daily_price}
          onChange={(price) =>
            update("daily_price", price)
          }
        />

        <PriceField
          label="Weekly"
          value={value.weekly_price}
          onChange={(price) =>
            update("weekly_price", price)
          }
          discount={weeklyDiscount}
        />

        <PriceField
          label="Monthly"
          value={value.monthly_price}
          onChange={(price) =>
            update("monthly_price", price)
          }
          discount={monthlyDiscount}
        />
      </div>

      {(weeklyDiscount !== null ||
        monthlyDiscount !== null) && (
        <p className="text-xs text-gray-400">
          Discounts are calculated against the nightly rate.
        </p>
      )}
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  discount,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  discount?: number | null;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        {discount !== null && discount !== undefined && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            {discount}% off
          </span>
        )}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-gray-400">
          $
        </span>

        <input
          type="number"
          min={0}
          step="0.01"
          value={value ?? ""}
          onChange={(e) => {
            const inputValue = e.target.value;

            onChange(
              inputValue === ""
                ? null
                : Number(inputValue)
            );
          }}
          className="
            w-full rounded-xl border border-gray-200 bg-white
            py-3 pl-8 pr-4 text-sm text-gray-900
            outline-none transition
            hover:border-gray-300
            focus:border-gray-900 focus:ring-1 focus:ring-gray-900
          "
        />
      </div>
    </label>
  );
}