"use client";

import { useEffect, useState } from "react";
import { Trash2, BadgeDollarSign } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { PricePeriod } from "@/types";
import BlockDatesForm from "@/app/(protected)/components/property/BlockDatesForm";
import PricePeriodForm from "@/app/(protected)/components/property/PricePeriodForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

type BlockedPeriod = {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  note: string | null;
};

export default function PropertyCalendar({
  tenantId,
  propertyId,
}: {
  tenantId: string;
  propertyId: string;
}) {
  const [range, setRange] = useState<DateRange>();
  const [periods, setPeriods] = useState<BlockedPeriod[]>([]);
  const [selectedBlockedPeriod, setSelectedBlockedPeriod] = useState<BlockedPeriod | null>(null);
  const [reason, setReason] = useState("maintenance");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"block" | "price">("block");
  const [pricePeriods, setPricePeriods] = useState<PricePeriod[]>([]);
  const [selectedPricePeriod, setSelectedPricePeriod] = useState<PricePeriod | null>(null);

  async function loadPricePeriods() {
    if (!API_URL) return;

    const token = localStorage.getItem(
      TOKEN_NAME ?? "token"
    );

    const response = await fetch(
      `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/price-periods`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(await response.text());
      return;
    }

    setPricePeriods(await response.json());
  }

  async function removeBlockedPeriod(id: string) {
    if (!API_URL) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this blocked period?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/blocked-periods/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Uppdatera direkt utan extra GET
      setPeriods((current) =>
        current.filter((period) => period.id !== id)
      );
    } catch (error) {
      console.error(
        "Could not remove blocked period:",
        error
      );
    }
  }

  async function loadPeriods() {
    if (!API_URL) return;

    const token = localStorage.getItem(TOKEN_NAME ?? "token");

    const response = await fetch(
      `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/blocked-periods`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error(await response.text());
      return;
    }

    setPeriods(await response.json());
  }

  async function removePricePeriod(id: string) {
    if (!API_URL) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this special price?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/price-periods/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setPricePeriods((current) =>
        current.filter((period) => period.id !== id)
      );
    } catch (error) {
      console.error(
        "Could not remove special price:",
        error
      );
    }
  }

  useEffect(() => {
    loadPeriods(); // TODO
    loadPricePeriods();
  }, [tenantId, propertyId]);

  function findBlockedPeriod(date: Date) {
    const value = formatDate(date);

    return periods.find(
      (period) =>
        value >= period.start_date &&
        value <= period.end_date
    );
  }

  function findPricePeriod(date: Date) {
    const value = formatDate(date);

    return pricePeriods.find(
      (period) =>
        value >= period.start_date &&
        value <= period.end_date
    );
  }

  const blockedRanges = periods.map((period) => ({
    from: new Date(`${period.start_date}T00:00:00`),
    to: new Date(`${period.end_date}T00:00:00`),
  }));

  const priceRanges = pricePeriods.map((period) => ({
    from: new Date(`${period.start_date}T00:00:00`),
    to: new Date(`${period.end_date}T00:00:00`),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 text-cyan-900">
      <h1 className="text-3xl font-semibold">
        Availability calendar
      </h1>

      <p className="mt-2 text-gray-500">
        Select a start and end date to close this property.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-white p-6">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            modifiers={{
              blocked: blockedRanges,
              specialPrice: priceRanges,
            }}
            modifiersClassNames={{
              blocked: "bg-red-100 text-red-700 line-through",
            }}
            components={{
              DayButton: ({ day, modifiers, ...props }) => (
                <button
                  {...props}
                  className={`${props.className ?? ""} relative`}
                >
                  {day.date.getDate()}

                  {modifiers.specialPrice && (
                    <span
                      role="button"
                      tabIndex={0}
                      title="View special price"
                      className="absolute right-0 top-0 z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();

                        const period = findPricePeriod(day.date);

                        if (period) {
                          setSelectedPricePeriod(period);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") {
                          return;
                        }

                        e.preventDefault();
                        e.stopPropagation();

                        const period = findPricePeriod(day.date);

                        if (period) {
                          setSelectedPricePeriod(period);
                        }
                      }}
                    >
                      <BadgeDollarSign
                        className="h-3.5 w-3.5"
                        aria-label="Special price"
                      />
                    </span>
                  )}
                </button>
              ),
            }}
            onDayClick={(date) => {
              const blocked = findBlockedPeriod(date);
              if (blocked) {
                setSelectedBlockedPeriod(blocked);
                return;
              }
            }}
          />
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("block")}
              className={`flex-1 rounded-md px-3 py-2 text-sm ${
                mode === "block"
                  ? "bg-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Block dates
            </button>

            <button
              type="button"
              onClick={() => setMode("price")}
              className={`flex-1 rounded-md px-3 py-2 text-sm ${
                mode === "price"
                  ? "bg-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Special price
            </button>
          </div>
          <div className="mt-5">
            {mode === "block" ? (
              <BlockDatesForm
                tenantId={tenantId}
                propertyId={propertyId}
                range={range}
                reason={reason}
                note={note}
                saving={saving}
                setReason={setReason}
                setNote={setNote}
                setSaving={setSaving}
                clearRange={() => setRange(undefined)}
                onSaved={loadPeriods}
              />
            ) : (
              <PricePeriodForm
                tenantId={tenantId}
                propertyId={propertyId}
                range={range}
                clearRange={() => setRange(undefined)}
                onSaved={loadPricePeriods}
              />
            )}
          </div>
        </div>
        {periods.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold">
              Blocked periods
            </h2>

            <div className="space-y-3">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-start justify-between gap-4 rounded-xl border p-4"
                >
                  <div>
                    <div className="font-medium">
                      {period.start_date}
                      {" → "}
                      {period.end_date}
                    </div>

                    {period.reason && (
                      <div className="mt-1 text-sm capitalize text-gray-500">
                        {period.reason.replace("_", " ")}
                      </div>
                    )}

                    {period.note && (
                      <div className="mt-1 text-sm text-gray-500">
                        {period.note}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeBlockedPeriod(period.id)
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Remove blocked period"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {pricePeriods.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="mb-4 text-lg font-semibold">
              Special prices
            </h2>

            <div className="space-y-3">
              {pricePeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-start justify-between gap-4 rounded-xl border p-4"
                >
                  <div>
                    <div className="font-medium">
                      {period.name}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      {period.start_date} → {period.end_date}
                    </div>

                    <div className="mt-3 text-sm">
                      {period.daily_price != null && (
                        <div>Daily: {period.daily_price}</div>
                      )}

                      {period.weekly_price != null && (
                        <div>Weekly: {period.weekly_price}</div>
                      )}

                      {period.monthly_price != null && (
                        <div>Monthly: {period.monthly_price}</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removePricePeriod(period.id)
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    title="Remove special price"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedBlockedPeriod && (
          <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-semibold">
                Blocked period
              </h2>

              <div className="mt-5 space-y-2 text-sm">
                <div>
                  {selectedBlockedPeriod.start_date}
                  {" → "}
                  {selectedBlockedPeriod.end_date}
                </div>

                {selectedBlockedPeriod.reason && (
                  <div>
                    Reason:{" "}
                    {selectedBlockedPeriod.reason.replace("_", " ")}
                  </div>
                )}

                {selectedBlockedPeriod.note && (
                  <div>
                    Note: {selectedBlockedPeriod.note}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBlockedPeriod(null)
                  }
                  className="rounded-lg px-5 py-3"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await removeBlockedPeriod(
                      selectedBlockedPeriod.id
                    );

                    setSelectedBlockedPeriod(null);
                  }}
                  className="rounded-lg bg-red-600 px-5 py-3 text-white"
                >
                  Remove block
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedPricePeriod && (
          <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-semibold">
                {selectedPricePeriod.name}
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="text-gray-500">
                  {selectedPricePeriod.start_date}
                  {" → "}
                  {selectedPricePeriod.end_date}
                </div>

                {selectedPricePeriod.daily_price != null && (
                  <div>
                    Daily: {selectedPricePeriod.daily_price}
                  </div>
                )}

                {selectedPricePeriod.weekly_price != null && (
                  <div>
                    Weekly: {selectedPricePeriod.weekly_price}
                  </div>
                )}

                {selectedPricePeriod.monthly_price != null && (
                  <div>
                    Monthly: {selectedPricePeriod.monthly_price}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPricePeriod(null)}
                  className="rounded-lg px-5 py-3"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await removePricePeriod(
                      selectedPricePeriod.id
                    );

                    setSelectedPricePeriod(null);
                  }}
                  className="rounded-lg bg-red-600 px-5 py-3 text-white"
                >
                  Remove special price
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}