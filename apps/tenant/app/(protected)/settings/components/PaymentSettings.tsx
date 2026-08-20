"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  Landmark,
  Save,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";

type Props = {
  tenantId: string;
};

type PaymentMethodKey =
  | "online"
  | "pay_on_property"
  | "pay_withbank_transfer";

type PaymentMethod = {
  id: string;
  key: PaymentMethodKey;
  name: string;
  description: string | null;
  enabled: boolean;
};

type PaymentSettingsValue = {
  methods: PaymentMethod[];

  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  iban: string | null;
  swift: string | null;
  bank_instructions: string | null;
};

export default function PaymentSettings({
  tenantId,
}: Props) {
  const [settings, setSettings] =
    useState<PaymentSettingsValue | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data =
          await apiClient.api<PaymentSettingsValue>(
            `v1/tenants/${tenantId}/payment-settings`
          );

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Could not load payment settings:",
          error
        );
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

  function updatePaymentMethod(
    key: PaymentMethodKey,
    value: boolean
  ) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        methods: current.methods.map(
          (method) =>
            method.key === key
              ? {
                  ...method,
                  enabled: value,
                }
              : method
        ),
      };
    });

    setSaved(false);
  }

  function updateBankField(
    key:
      | "bank_name"
      | "account_name"
      | "account_number"
      | "iban"
      | "swift"
      | "bank_instructions",
    value: string
  ) {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [key]: value,
      };
    });

    setSaved(false);
  }

  async function save() {
    if (!settings) {
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const updated =
        await apiClient.api<PaymentSettingsValue>(
          `v1/tenants/${tenantId}/payment-settings`,
          {
            method: "PUT",
            body: JSON.stringify({
              methods: settings.methods.map(
                (method) => ({
                  key: method.key,
                  enabled: method.enabled,
                })
              ),

              bank_name:
                settings.bank_name,

              account_name:
                settings.account_name,

              account_number:
                settings.account_number,

              iban:
                settings.iban,

              swift:
                settings.swift,

              bank_instructions:
                settings.bank_instructions,
            }),
          }
        );

      setSettings(updated);
      setSaved(true);
    } catch (error) {
      console.error(
        "Could not save payment settings:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-sm text-slate-500">
        Loading payment settings...
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-8 text-sm text-red-600">
        Could not load payment settings.
      </div>
    );
  }

  const bankTransferEnabled =
    settings.methods.find(
      (method) =>
        method.key ===
        "pay_withbank_transfer"
    )?.enabled ?? false;

  return (
    <section className="relative text-slate-900">
      <DevLabel
        name="PaymentSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/payment/PaymentSettings.tsx"
      />
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Payment methods
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose how guests can pay for
          their bookings.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {settings.methods.map(
            (method) => (
              <PaymentMethod
                key={method.id}
                icon={getPaymentMethodIcon(
                  method.key
                )}
                title={method.id}
                description={
                  method.description ?? ""
                }
                enabled={method.enabled}
                onChange={(value) =>
                  updatePaymentMethod(
                    method.key,
                    value
                  )
                }
              />
            )
          )}
        </div>

        {bankTransferEnabled && (
          <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-6">
            <div className="mb-5">
              <h3 className="font-semibold">
                Bank details
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                These details will be shown
                to guests choosing bank
                transfer.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Bank name"
                value={
                  settings.bank_name ?? ""
                }
                onChange={(value) =>
                  updateBankField(
                    "bank_name",
                    value
                  )
                }
              />

              <Field
                label="Account name"
                value={
                  settings.account_name ??
                  ""
                }
                onChange={(value) =>
                  updateBankField(
                    "account_name",
                    value
                  )
                }
              />

              <Field
                label="Account number"
                value={
                  settings.account_number ??
                  ""
                }
                onChange={(value) =>
                  updateBankField(
                    "account_number",
                    value
                  )
                }
              />

              <Field
                label="IBAN"
                value={
                  settings.iban ?? ""
                }
                onChange={(value) =>
                  updateBankField(
                    "iban",
                    value
                  )
                }
              />

              <Field
                label="SWIFT / BIC"
                value={
                  settings.swift ?? ""
                }
                onChange={(value) =>
                  updateBankField(
                    "swift",
                    value
                  )
                }
              />

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Payment instructions
                </label>

                <textarea
                  value={
                    settings.bank_instructions ??
                    ""
                  }
                  onChange={(event) =>
                    updateBankField(
                      "bank_instructions",
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  placeholder="Please include your booking reference when making the transfer."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm text-emerald-600">
            Settings saved
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

function PaymentMethod({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 px-6 py-5 transition hover:bg-slate-50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">
          {title}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          {description}
        </div>
      </div>

      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        className="h-5 w-5 cursor-pointer accent-slate-900"
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
      />
    </div>
  );
}

function getPaymentMethodIcon(
  key: PaymentMethodKey
) {
  switch (key) {
    case "online":
      return (
        <CreditCard className="h-5 w-5" />
      );

    case "pay_on_property":
      return (
        <Building2 className="h-5 w-5" />
      );

    case "pay_withbank_transfer":
      return (
        <Landmark className="h-5 w-5" />
      );
  }
}