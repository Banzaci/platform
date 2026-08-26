"use client";

import {
  CalendarDays,
  Settings2,
  Trash2,
} from "lucide-react";
import PropertySlideshow from "./PropertySlideshow";
import { Property } from "@/types";
import DevLabel from "@/helpers/DevLabel";
import CalendarSyncSettings from "./CalendarSyncSettings";
import { useState } from "react";

type Props = {
  property: Property;
  onEdit: () => void;
  onCalendar: () => void;
  onCopy: () => void;
  onToggleOpen: () => void;
  onDelete: () => void;
};

export default function PropertyCardEdit({
  property,
  onEdit,
  onCalendar,
  onCopy,
  onToggleOpen,
  onDelete, 
}: Props) {
  const price = property.base_price;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    <article className="relative flex min-h-44 overflow-hidden rounded-xl border-b-gray-200 bg-white shadow-sm">
      <DevLabel
        name="PropertyCardEdit"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/property/PropertyCardEdit.tsx"
      />

      <div className="relative w-56 shrink-0 self-stretch overflow-hidden bg-gray-100">
        <PropertySlideshow
          images={property.images ?? []}
          alt={property.name}
        />
      </div>
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">
              {property.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {property.max_guests} guests ·{" "}
              {property.bedrooms} bedrooms ·{" "}
              {property.beds} beds ·{" "}
              {property.units} units
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              property.is_open
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {property.is_open ? "Open" : "Closed"}
          </button>
        </div>

        {/* Price */}
        {price ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            <span className="font-semibold text-gray-900">
              {price.daily_price} / night
            </span>

            {price.weekly_price && (
              <span className="text-gray-500">
                {price.weekly_price} / week
                {weeklyDiscount && (
                  <span className="ml-1 text-green-700">
                    ({weeklyDiscount}% off)
                  </span>
                )}
              </span>
            )}

            {price.monthly_price && (
              <span className="text-gray-500">
                {price.monthly_price} / month
                {monthlyDiscount && (
                  <span className="ml-1 text-green-700">
                    ({monthlyDiscount}% off)
                  </span>
                )}
              </span>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-amber-600">
            No price configured
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer rounded-lg border p-2 transition border-slate-300 text-xs text-gray-600 hover:bg-gray-50 hover:text-black bg-slate-100"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={onCalendar}
            title="Availability calendar"
            className="cursor-pointer rounded-lg border p-2 transition border-slate-300 text-xs text-gray-600 hover:bg-gray-50 hover:text-black bg-slate-100"
          >
            <CalendarDays className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="cursor-pointer rounded-lg border p-2 transition border-slate-300 text-xs text-gray-600 hover:bg-gray-50 hover:text-black bg-slate-100"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Room settings"
            className={`
              cursor-pointer rounded-lg border p-2 transition border-slate-300
              ${
                isSettingsOpen
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black bg-slate-100"
              }
            `}
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete property"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        { isSettingsOpen && <CalendarSyncSettings
            calendarToken={property.calendar_token}
            propertyId={property.id}
          />}
      </div>
    </article>
  );
}