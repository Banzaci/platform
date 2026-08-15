"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";

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
  const [reason, setReason] = useState("maintenance");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadPeriods();
  }, [tenantId, propertyId]);

  async function blockDates() {
    if (!range?.from || !range?.to || !API_URL) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_NAME ?? "token");

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/${propertyId}/blocked-periods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: formatDate(range.from),
            end_date: formatDate(range.to),
            reason,
            note: note || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setRange(undefined);
      setNote("");

      await loadPeriods();
    } catch (error) {
      console.error("Could not block dates:", error);
    } finally {
      setSaving(false);
    }
  }

  const blockedRanges = periods.map((period) => ({
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
            }}
            modifiersClassNames={{
              blocked:
                "bg-red-100 text-red-700 line-through",
            }}
          />
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Block dates
          </h2>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Reason
              </span>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border px-4 py-3"
              >
                <option value="renovation">
                  Renovation
                </option>
                <option value="maintenance">
                  Maintenance
                </option>
                <option value="walk_in">
                  Walk in
                </option>
                <option value="owner_use">
                  Owner use
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Note
              </span>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-4 py-3"
              />
            </label>

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
              onClick={blockDates}
              disabled={
                !range?.from ||
                !range?.to ||
                saving
              }
              className="w-full rounded-lg bg-black px-5 py-3 text-white disabled:opacity-40"
            >
              {saving ? "Saving..." : "Block dates"}
            </button>
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