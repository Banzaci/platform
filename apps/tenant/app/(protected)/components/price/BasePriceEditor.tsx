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
    <div className="border-t pt-6">
      <h3 className="mb-5 text-lg font-semibold">
        Base price
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <PriceField
          label="Daily price"
          value={value.daily_price}
          onChange={(price) =>
            update("daily_price", price)
          }
        />

        <PriceField
          label="Weekly price"
          value={value.weekly_price}
          onChange={(price) =>
            update("weekly_price", price)
          }
        />

        <PriceField
          label="Monthly price"
          value={value.monthly_price}
          onChange={(price) =>
            update("monthly_price", price)
          }
        />
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        {weeklyDiscount !== null && (
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Weekly {weeklyDiscount}% discount
          </span>
        )}

        {monthlyDiscount !== null && (
          <span className="rounded-full bg-gray-100 px-3 py-1">
            Monthly {monthlyDiscount}% discount
          </span>
        )}
      </div>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      <input
        type="number"
        min={0}
        step="0.01"
        value={value ?? ""}
        onChange={(e) => {
          const value = e.target.value;

          onChange(
            value === ""
              ? null
              : Number(value)
          );
        }}
        className="w-full rounded-lg border px-4 py-3"
      />
    </label>
  );
}