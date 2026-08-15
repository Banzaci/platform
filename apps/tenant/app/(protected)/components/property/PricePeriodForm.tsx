"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

type Props = {
  tenantId: string;
  propertyId: string;
  range?: DateRange;
  onSaved: () => Promise<void> | void;
  clearRange: () => void;
};

export default function PricePeriodForm({
  tenantId,
  propertyId,
  range,
  onSaved,
  clearRange,
}: Props) {
  const [name, setName] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [weeklyPrice, setWeeklyPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!API_URL || !range?.from || !range?.to) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/price-periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            start_date: formatDate(range.from),
            end_date: formatDate(range.to),
            daily_price:
              dailyPrice === ""
                ? null
                : Number(dailyPrice),
            weekly_price:
              weeklyPrice === ""
                ? null
                : Number(weeklyPrice),
            monthly_price:
              monthlyPrice === ""
                ? null
                : Number(monthlyPrice),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setName("");
      setDailyPrice("");
      setWeeklyPrice("");
      setMonthlyPrice("");
      clearRange();

      await onSaved();
    } catch (error) {
      console.error(
        "Could not create price period:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          Name
        </span>

        <input
          value={name}
          placeholder="Christmas"
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />
      </label>

      <div className="grid gap-4">
        <PriceField
          label="Daily price"
          value={dailyPrice}
          onChange={setDailyPrice}
        />

        <PriceField
          label="Weekly price"
          value={weeklyPrice}
          onChange={setWeeklyPrice}
        />

        <PriceField
          label="Monthly price"
          value={monthlyPrice}
          onChange={setMonthlyPrice}
        />
      </div>

      {range?.from && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <div>
            From: {formatDate(range.from)}
          </div>

          <div>
            To:{" "}
            {range.to
              ? formatDate(range.to)
              : "Select end date"}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={
          !name ||
          !range?.from ||
          !range?.to ||
          saving
        }
        className="w-full rounded-lg bg-black px-5 py-3 text-white disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save special price"}
      </button>
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-4 py-3"
      />
    </label>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}