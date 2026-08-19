"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import DevLabel from "@/helpers/DevLabel";
import { apiClient } from "@/libs/api";

type CalendarSource = {
  id: string;
  name: string;
  url: string;
  last_synced_at?: string | null;
  last_error?: string | null;
};

type Props = {
  tenantId: string;
  propertyId: string;
  calendarToken: string;
};

export default function CalendarSyncSettings({
  tenantId,
  propertyId,
  calendarToken,
}: Props) {
  const [sources, setSources] = useState<CalendarSource[]>([]);
  const [provider, setProvider] = useState("Booking.com");
  const [url, setUrl] = useState("");
  const [exportProvider, setExportProvider] =
  useState("Booking.com");

const exportUrl =
  `${process.env.NEXT_PUBLIC_API_URL}calendar/${calendarToken}.ics?provider=${encodeURIComponent(exportProvider)}`;
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  //curl -i "http://localhost:8000/api/v1/calendar/DIN-CALENDAR-TOKEN.ics"
  
  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.api<CalendarSource[]>(
          `v1/tenants/${tenantId}/properties/${propertyId}/calendar-sync`
        );

        setSources(data);
      } catch (error) {
        console.error(
          "Could not load calendar sources:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [tenantId, propertyId]);

  async function add() {
    if (!url.trim()) return;

    setAdding(true);

    try {
      const source = await apiClient.api<CalendarSource>(
        `v1/tenants/${tenantId}/properties/${propertyId}/calendar-sync`,
        {
          method: "POST",
          body: JSON.stringify({
            name: provider,
            url: url.trim(),
          }),
        }
      );

      setSources((current) => [
        ...current,
        source,
      ]);

      setUrl("");
    } catch (error) {
      console.error(
        "Could not add calendar source:",
        error
      );
    } finally {
      setAdding(false);
    }
  }

  async function remove(
    sourceId: string
  ) {
    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/properties/${propertyId}/calendar-sync/${sourceId}`,
        {
          method: "DELETE",
        }
      );

      setSources((current) =>
        current.filter(
          (source) =>
            source.id !== sourceId
        )
      );
    } catch (error) {
      console.error(
        "Could not delete calendar source:",
        error
      );
    }
  }

  return (
    <div className="relative border-t border-slate-200 bg-slate-50/60 px-5 py-5 mt-4">
      <DevLabel
        name="CalendarSyncSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/property/CalendarSyncSettings.tsx"
      />
      <div className="flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Export calendar
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Paste this URL into Booking.com, Airbnb or another calendar.
          </p>
          <div className="mt-3 flex gap-2">
            <select
              value={exportProvider}
              onChange={(e) =>
                setExportProvider(e.target.value)
              }
              className="w-36 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="Booking.com">
                Booking.com
              </option>

              <option value="Airbnb">
                Airbnb
              </option>

              <option value="Vrbo">
                Vrbo
              </option>
            </select>
            <input
              readOnly
              value={exportUrl}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600"
            />

            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(exportUrl)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Import calendars
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Connect Booking.com, Airbnb or another iCal source.
          </p>
        </div>
          {sources.length > 0 && (
            <div className="mb-3 space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="
                    flex items-center gap-3
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-3 py-2.5
                  "
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {source.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {source.url}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      remove(source.id)
                    }
                    className="
                      shrink-0 rounded-lg
                      p-2
                      text-slate-300
                      transition
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={provider}
              onChange={(e) =>
                setProvider(
                  e.target.value
                )
              }
              className="
                w-36 shrink-0
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2.5
                text-sm text-slate-700
                outline-none
                transition
                focus:border-slate-400
              "
            >
              <option value="Booking.com">
                Booking.com
              </option>

              <option value="Airbnb">
                Airbnb
              </option>

              <option value="Vrbo">
                Vrbo
              </option>
            </select>
            <input
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              placeholder="Calendar export URL"
              className="
                min-w-0 flex-1
                rounded-xl
                border border-slate-200
                bg-white
                px-3 py-2.5
                text-sm text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-slate-400
              "
            />

            <button
              type="button"
              onClick={add}
              disabled={!url.trim()}
              className="
                shrink-0
                rounded-xl
                bg-slate-900
                px-4 py-2.5
                text-sm font-semibold
                text-white
                transition
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Add
            </button>
          </div>

          {sources.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">
              No external calendars connected yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}