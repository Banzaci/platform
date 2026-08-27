"use client";

import { useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";
import { useSettings } from "@/providers/SettingsProvider";
import { revalidateTenant } from "@/helpers/revalidateTenant";

export default function PasswordSettings() {
  const { tenantId } = useSettings()
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSaved(false);

    if (!currentPassword.trim()) {
      setError("Current password is required.");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/password`,
        {
          method: "PUT",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      await revalidateTenant(window.location.host);
      window.location.reload();
    } catch (error) {
      console.error(
        "Could not update password:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not update password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="relative text-slate-900">
      <DevLabel
        name="PasswordSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/settings/components/PasswordSettings.tsx"
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Password
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Change the password used to sign in to your account.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Change password
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Enter your current password before choosing a new one.
            </p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
          </div>

          <Field
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
          />

          <Field
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {error && (
            <div className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm text-emerald-600">
            Password updated
          </span>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
        >
          <Save className="h-4 w-4" />

          {saving
            ? "Saving..."
            : "Update password"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        autoComplete="new-password"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
      />
    </div>
  );
}