"use client";

import { useState } from "react";

import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";
import { useSettings } from "@/providers/SettingsProvider";
import { revalidateTenant } from "@/helpers/revalidateTenant";

type CancellationPolicy = {
  free_cancellation_days: number;
  partial_refund_hours: number;
  partial_refund_percent: number;
};

export default function CancellationPolicyForm({
  initialPolicy,
}: {
  initialPolicy: CancellationPolicy;
}) {
  const { tenantId } = useSettings()
  const [policy, setPolicy] = useState(initialPolicy ?? {
    free_cancellation_days: 14,
    partial_refund_hours: 48,
    partial_refund_percent: 50,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);

    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/cancellation-policy`,
        {
          method: "PUT",
          body: JSON.stringify(policy),
        }
      );

      await revalidateTenant(window.location.host);
      window.location.reload();
    } catch (error) {
      console.error(
        "Could not save cancellation policy:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
  <section className="relative text-slate-900">
    <DevLabel
      name="CancellationPolicyForm"
      file="/Users/michellarsson/Projects/hotels/apps/tenant/app/booking/[bookingId]/settings/CancellationPolicyForm.tsx"
    />

    <div className="mb-6">
      <h2 className="text-xl font-semibold">
        Cancellation policy
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Configure how much guests receive back when cancelling.
      </p>
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 px-6 py-6 md:grid-cols-3">
        <label>
          <span className="mb-2 block text-sm font-medium">
            Free cancellation days
          </span>

          <input
            type="number"
            min={0}
            value={policy.free_cancellation_days}
            onChange={(e) =>
              setPolicy((current) => ({
                ...current,
                free_cancellation_days:
                  Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />

          <p className="mt-2 text-xs text-slate-400">
            Full refund before this many days.
          </p>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Partial refund until
          </span>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={policy.partial_refund_hours}
              onChange={(e) =>
                setPolicy((current) => ({
                  ...current,
                  partial_refund_hours:
                    Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />

            <span className="shrink-0 text-sm text-slate-500">
              hours
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Partial refund applies until this many hours before check-in.
          </p>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium">
            Partial refund
          </span>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={policy.partial_refund_percent}
              onChange={(e) =>
                setPolicy((current) => ({
                  ...current,
                  partial_refund_percent:
                    Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />

            <span className="shrink-0 text-sm text-slate-500">
              %
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Percentage refunded during the partial refund period.
          </p>
        </label>
      </div>
    </div>

    <div className="mt-6 flex items-center justify-end gap-4">
      {saved && (
        <span className="text-sm text-emerald-600">
          Policy saved
        </span>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save policy"}
      </button>
    </div>
  </section>
);
}