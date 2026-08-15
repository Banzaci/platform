"use client";

import { CalendarDays, Trash2 } from "lucide-react";
import PropertySlideshow from "./PropertySlideshow";
import { Property } from "@/types";

type Props = {
  property: Property;
  onEdit: () => void;
  onCalendar: () => void;
  onCopy: () => void;
  onToggleOpen: () => void;
  onDelete: () => void;
};

export default function PropertyCard({
  property,
  onEdit,
  onCalendar,
  onCopy,
  onToggleOpen,
  onDelete,
}: Props) {
  const price = property.base_price;

  function calculateDiscount(
    regularPrice: number,
    actualPrice: number | null
  ) {
    if (!actualPrice || regularPrice <= 0) {
      return null;
    }

    const discount =
      ((regularPrice - actualPrice) /
        regularPrice) *
      100;

    if (discount <= 0) {
      return null;
    }

    return Math.round(discount);
  }

  const weeklyDiscount =
    price?.daily_price && price.weekly_price
      ? calculateDiscount(
          price.daily_price * 7,
          price.weekly_price
        )
      : null;

  const monthlyDiscount =
    price?.daily_price && price.monthly_price
      ? calculateDiscount(
          price.daily_price * 30,
          price.monthly_price
        )
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm relative">
      <PropertySlideshow
        images={property.images ?? []}
        alt={property.name}
      />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {property.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {property.max_guests} guests ·{" "}
              {property.bedrooms} bedrooms ·{" "}
              {property.beds} beds ·{" "}
              {property.units} units
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              property.is_open
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {property.is_open ? "Open" : "Closed"}
          </button>
        </div>

        {price ? (
          <div className="mt-6 space-y-2">
            <div className="font-semibold">
              {price.daily_price} / night
            </div>

            {price.weekly_price && (
              <div className="text-sm text-gray-600">
                {price.weekly_price} / week

                {weeklyDiscount && (
                  <span className="ml-2 text-green-700">
                    {weeklyDiscount}% off
                  </span>
                )}
              </div>
            )}

            {price.monthly_price && (
              <div className="text-sm text-gray-600">
                {price.monthly_price} / month

                {monthlyDiscount && (
                  <span className="ml-2 text-green-700">
                    {monthlyDiscount}% off
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-amber-600">
            No price configured
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Edit property
          </button>

          <button
            type="button"
            onClick={onCalendar}
            title="Availability calendar"
            className="rounded-lg border p-2.5 hover:bg-gray-50"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="absolute top-1 right-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
            title="Delete property"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}