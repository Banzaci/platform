/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Trash2, BadgeDollarSign } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { PricePeriod } from "@/types";
import BlockDatesForm from "@/app/(protected)/components/property/BlockDatesForm";
import PricePeriodForm from "@/app/(protected)/components/property/PricePeriodForm";
import DevLabel from "@/helpers/DevLabel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

type BlockedPeriod = {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  source: string;
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
  }, []);

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
  <main className="relative min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
    <DevLabel
      name="PropertyCalendar"
      file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/properties/[propertyId]/calendar/PropertyCalendar.tsx"
    />

    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Property management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Availability calendar
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage blocked dates, external bookings and special pricing.
          </p>
        </div>

        {/* Legend */}
        <div className="hidden items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs shadow-sm md:flex">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            Blocked
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Special price
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            External
          </div>
        </div>
      </div>

      {/* Calendar + editor */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Calendar */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold">
              Calendar
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Select a date range to block dates or create special pricing.
            </p>
          </div>

          <div className="p-6">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              className="mx-auto"
              modifiers={{
                blocked: blockedRanges,
                specialPrice: priceRanges,
              }}
              modifiersClassNames={{
                blocked:
                  "bg-red-50 text-red-700 line-through rounded-lg",
                specialPrice:
                  "bg-amber-50 text-amber-700 rounded-lg",
              }}
              components={{
                DayButton: ({
                  day,
                  modifiers,
                  ...props
                }) => (
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
                        className="absolute right-0 top-0 z-10 cursor-pointer rounded-full bg-amber-100 p-0.5 text-amber-700"
                        onClick={(e) => {
                          e.stopPropagation();

                          const period =
                            findPricePeriod(
                              day.date
                            );

                          if (period) {
                            setSelectedPricePeriod(
                              period
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key !== "Enter" &&
                            e.key !== " "
                          ) {
                            return;
                          }

                          e.preventDefault();
                          e.stopPropagation();

                          const period =
                            findPricePeriod(
                              day.date
                            );

                          if (period) {
                            setSelectedPricePeriod(
                              period
                            );
                          }
                        }}
                      >
                        <BadgeDollarSign className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                ),
              }}
              onDayClick={(date) => {
                const blocked =
                  findBlockedPeriod(date);

                if (blocked) {
                  setSelectedBlockedPeriod(
                    blocked
                  );

                  return;
                }
              }}
            />
          </div>
        </section>

        {/* Controls */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold">
              Add calendar rule
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Use the selected dates from the calendar.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("block")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                mode === "block"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Block dates
            </button>

            <button
              type="button"
              onClick={() => setMode("price")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                mode === "price"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
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
                clearRange={() =>
                  setRange(undefined)
                }
                onSaved={loadPeriods}
              />
            ) : (
              <PricePeriodForm
                tenantId={tenantId}
                propertyId={propertyId}
                range={range}
                clearRange={() =>
                  setRange(undefined)
                }
                onSaved={loadPricePeriods}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Lists */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Blocked periods */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Blocked periods
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Manual and externally synced unavailable dates.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {periods.length}
            </span>
          </div>

          {periods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
              No blocked periods.
            </div>
          ) : (
            <div className="space-y-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() =>
                    setSelectedBlockedPeriod(
                      period
                    )
                  }
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div
                    className={`h-9 w-1 rounded-full ${
                      period.source === "manual"
                        ? "bg-red-400"
                        : "bg-blue-400"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {period.start_date} →{" "}
                      {period.end_date}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="capitalize">
                        {period.source}
                      </span>

                      {period.reason && (
                        <>
                          <span>·</span>
                          <span className="capitalize">
                            {period.reason.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {period.source ===
                    "manual" && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        void removeBlockedPeriod(
                          period.id
                        );
                      }}
                      className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Special prices */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Special prices
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Seasonal and temporary pricing overrides.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {pricePeriods.length}
            </span>
          </div>

          {pricePeriods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
              No special prices.
            </div>
          ) : (
            <div className="space-y-2">
              {pricePeriods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() =>
                    setSelectedPricePeriod(
                      period
                    )
                  }
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 px-4 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <BadgeDollarSign className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {period.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      {period.start_date} →{" "}
                      {period.end_date}
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    {period.daily_price !=
                      null && (
                      <div>
                        {period.daily_price} /
                        day
                      </div>
                    )}
                  </div>

                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      void removePricePeriod(
                        period.id
                      );
                    }}
                    className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Blocked period modal */}
      {selectedBlockedPeriod && (
        <div
          className="fixed inset-0 z-300 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onMouseDown={() =>
            setSelectedBlockedPeriod(null)
          }
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className={`mb-5 h-1 w-12 rounded-full ${
                selectedBlockedPeriod.source ===
                "manual"
                  ? "bg-red-400"
                  : "bg-blue-400"
              }`}
            />

            <h2 className="text-xl font-semibold">
              Blocked period
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Dates
                </div>

                <div className="mt-1 font-medium">
                  {
                    selectedBlockedPeriod.start_date
                  }{" "}
                  →{" "}
                  {
                    selectedBlockedPeriod.end_date
                  }
                </div>
              </div>

              {selectedBlockedPeriod.source && (
                <div>
                  <span className="text-slate-400">
                    Source:
                  </span>{" "}
                  <span className="capitalize">
                    {
                      selectedBlockedPeriod.source
                    }
                  </span>
                </div>
              )}

              {selectedBlockedPeriod.reason && (
                <div>
                  <span className="text-slate-400">
                    Reason:
                  </span>{" "}
                  {selectedBlockedPeriod.reason.replace(
                    "_",
                    " "
                  )}
                </div>
              )}

              {selectedBlockedPeriod.note && (
                <div>
                  <span className="text-slate-400">
                    Note:
                  </span>{" "}
                  {
                    selectedBlockedPeriod.note
                  }
                </div>
              )}
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedBlockedPeriod(
                    null
                  )
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price modal */}
      {selectedPricePeriod && (
        <div
          className="fixed inset-0 z-300 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onMouseDown={() =>
            setSelectedPricePeriod(null)
          }
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BadgeDollarSign className="h-5 w-5" />
            </div>

            <h2 className="text-xl font-semibold">
              {selectedPricePeriod.name}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {selectedPricePeriod.start_date} →{" "}
              {selectedPricePeriod.end_date}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <PriceValue
                label="Daily"
                value={
                  selectedPricePeriod.daily_price
                }
              />

              <PriceValue
                label="Weekly"
                value={
                  selectedPricePeriod.weekly_price
                }
              />

              <PriceValue
                label="Monthly"
                value={
                  selectedPricePeriod.monthly_price
                }
              />
            </div>

            <div className="mt-7 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedPricePeriod(null)
                }
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={async () => {
                  await removePricePeriod(
                    selectedPricePeriod.id
                  );

                  setSelectedPricePeriod(
                    null
                  );
                }}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Remove
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

function PriceValue({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className="mt-1 font-semibold text-slate-800">
        {value ?? "—"}
      </div>
    </div>
  );
}