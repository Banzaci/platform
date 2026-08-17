"use client";

import { useState } from "react";

import { apiClient } from "@/libs/api";

type CancellationPolicy = {
  free_cancellation_days: number;
  partial_refund_hours: number;
  partial_refund_percent: number;
};

export default function CancellationPolicyForm({
  tenantId,
  initialPolicy,
}: {
  tenantId: string;
  initialPolicy: CancellationPolicy;
}) {
  const [policy, setPolicy] = useState(initialPolicy);
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

      setSaved(true);
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
    <div className="rounded-2xl border bg-white p-6 text-black">
      <h2 className="text-xl font-semibold">
        Cancellation policy
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Configure how much guests receive back when cancelling.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
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
            className="w-full rounded-lg border px-3 py-2"
          />
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
              className="w-full rounded-lg border px-3 py-2"
            />

            <span className="text-sm text-gray-500">
              hours
            </span>
          </div>
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
              className="w-full rounded-lg border px-3 py-2"
            />

            <span className="text-sm text-gray-500">
              %
            </span>
          </div>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm text-green-600">
            Saved
          </span>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save policy"}
        </button>
      </div>
    </div>
  );
}