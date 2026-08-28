"use client";

import { useEffect, useState } from "react";
import { Mail, Save } from "lucide-react";
import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";
import { useSettings } from "@/providers/SettingsProvider";
import { revalidateTenant } from "@/helpers/revalidateTenant";

type EmailSettingsValue = {
  booking_email: string;
};

export default function EmailSettings() {
  const { tenantId } = useSettings()
  const [settings, setSettings] =
    useState<EmailSettingsValue | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data =
          await apiClient.api<EmailSettingsValue>(
            `v1/tenants/${tenantId}/email-settings`
          );

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Could not load email settings:",
          error
        );

        if (!cancelled) {
          setError(
            "Could not load email settings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  async function save() {
    if (!settings?.booking_email.trim()) {
      setError(
        "Booking email is required."
      );
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await apiClient.api<EmailSettingsValue>(
          `v1/tenants/${tenantId}/email-settings`,
          {
            method: "PUT",
            body: JSON.stringify({
              booking_email:
                settings.booking_email.trim(),
            }),
          }
        );

      await revalidateTenant(window.location.host);
      window.location.reload();
    } catch (error) {
      console.error(
        "Could not save email settings:",
        error
      );

      setError(
        "Could not save email settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-sm text-slate-500">
        Loading email settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-8 text-sm text-red-600">
        Could not load email settings.
      </div>
    );
  }

  return (
    <section className="relative text-slate-900">
      <DevLabel
        name="EmailSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/settings/components/EmailSettings.tsx"
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Booking email
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose which email address should
          receive new booking notifications.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Notification email
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              New booking notifications will
              be sent to this address.
            </p>
          </div>
        </div>

        <div className="px-6 py-6">
          <label className="mb-2 block text-sm font-medium">
            Booking email
          </label>

          <input
            type="email"
            value={settings.booking_email ?? ""}
            onChange={(event) => {
              setSettings((current) => {
                if (!current) {
                  return current;
                }

                return {
                  ...current,
                  booking_email:
                    event.target.value,
                };
              });

              setSaved(false);
              setError(null);
            }}
            placeholder="booking@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />

          <p className="mt-2 text-xs text-slate-400">
            By default this is the email
            address used when the account was
            created.
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm text-emerald-600">
            Email settings saved
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
            : "Save settings"}
        </button>
      </div>
    </section>
  );
}