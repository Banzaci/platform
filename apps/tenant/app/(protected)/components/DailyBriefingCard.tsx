"use client";

import { revalidateTenant } from "@/helpers/revalidateTenant";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";
import { useQuery } from "@tanstack/react-query";

type DailyBriefing = {
  arrivals: number;
  departures: number;
  guests_staying: number;
  available_properties: number;
  unpaid_bookings: number;
  attention: string[];
};

export default function DailyBriefingCard() {
  const { tenantId } = useSettings()
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["daily-briefing", tenantId],
    queryFn: async () => {
      const response = await apiClient.api<DailyBriefing>(
        `v1/tenants/${tenantId}/daily-briefing`
      );
      await revalidateTenant(window.location.host);
      return response;
    },
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <section className="animate-pulse rounded-3xl border border-neutral-200 bg-white p-6 mb-8">
        <div className="h-5 w-32 rounded bg-neutral-200" />
        <div className="mt-3 h-8 w-64 rounded bg-neutral-200" />

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6" mb-8>
        <p className="text-sm font-medium text-red-600">
          Could not load daily briefing.
        </p>
      </section>
    );
  }

  const stats = [
    {
      label: "Arrivals",
      value: data.arrivals,
    },
    {
      label: "Departures",
      value: data.departures,
    },
    {
      label: "Guests staying",
      value: data.guests_staying,
    },
    {
      label: "Available rooms",
      value: data.available_properties,
    },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm mb-8">
      <div className="border-b border-neutral-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Daily briefing
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
              Today at your property
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Everything you need to keep an eye on today.
            </p>
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            Today
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-neutral-100 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white px-6 py-5"
          >
            <p className="text-sm text-neutral-500">
              {stat.label}
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">
              Needs attention
            </h3>

            {data.attention.length > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {data.attention.length} items
              </span>
            )}
          </div>

          {data.attention.length > 0 ? (
            <div className="space-y-2">
              {data.attention.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200 px-4 py-3"
                >
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />

                  <p className="text-sm leading-6 text-neutral-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-8 text-center">
              <p className="text-sm font-medium text-neutral-700">
                Everything looks good
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                Nothing needs your attention right now.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-neutral-950 p-5 text-white">
          <p className="text-sm font-medium text-neutral-400">
            Payments
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {data.unpaid_bookings}
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            unpaid booking
            {data.unpaid_bookings === 1 ? "" : "s"}
          </p>

          <div className="my-5 h-px bg-white/10" />

          <p className="text-sm leading-6 text-neutral-300">
            {data.unpaid_bookings > 0
              ? "You have bookings that may need payment follow-up."
              : "All current bookings are paid or have no payment issue."}
          </p>
        </div>
      </div>
    </section>
  );
}