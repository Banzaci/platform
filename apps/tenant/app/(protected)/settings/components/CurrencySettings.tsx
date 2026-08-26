"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";
import { SelectField } from "../../components/SelectField";
import { useSettings } from "@/providers/SettingsProvider";

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "GHS", label: "GHS - Ghanaian Cedi" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "EUR", label: "EUR - Euro" },
];

export default function CurrencySettings() {
  const { tenantId } = useSettings()
  const [currency, setCurrency] = useState<(typeof currencies)[number]>(currencies[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiClient.api<{ currency: string }>(
          `v1/tenants/${tenantId}/currency-settings`
        );
        const c = currencies.find((c)=> c.value === data.currency);
        if(c) setCurrency(c)
      } catch (error) {
        console.error(
          "Could not load currency settings:",
          error
        );

        if (!cancelled) {
          setError(
            "Could not load currency settings."
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
    if (!currency.value) {
      setError(
        "Currency is required."
      );
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await apiClient.api<(typeof currencies)[number]>(
        `v1/tenants/${tenantId}/currency-settings`,
        {
          method: "PUT",
          body: JSON.stringify({
            currency: currency.value,
          }),
        }
      );
      setCurrency(updated);
      setSaved(true);
    } catch (error) {
      console.error(
        "Could not save currency settings:",
        error
      );
      setError(
        "Could not save currency settings."
      );
    } finally {
      setSaving(false);
    }
  }
  console.log(currency)
  if (loading) {
    return (
      <div className="py-8 text-sm text-slate-500">
        Loading currency settings...
      </div>
    );
  }
  if (!currency) {
    return (
      <div className="py-8 text-sm text-red-600">
        Could not load currency settings.
      </div>
    );
  }
  return (
    <section className="relative text-slate-900">
      <DevLabel
        name="currencySettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/settings/components/currencySettings.tsx"
      />
      <div className="mb-2">
        <h2 className="text-xl font-semibold">
          Currency
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose which currency to use.
        </p>
      </div>
      <div className="flex">
        <SelectField
          label="Currency"
          value={currency.value}
          options={currencies}
          onChange={(value) => {
            const c = currencies.find((c)=> c.value === value );
            if(c) setCurrency(c)
          }}
        />
        <div className="ml-4 mt-6 flex items-center gap-4">
          {saved && (
            <span className="text-sm text-emerald-600">
              Currency settings saved
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
              : "Save currency"}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </section>
  );
}