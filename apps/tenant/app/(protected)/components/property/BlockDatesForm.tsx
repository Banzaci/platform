/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import DevLabel from "@/helpers/DevLabel";
import { DateRange } from "react-day-picker";
import { apiClient } from "@/libs/api";

type Props = {
  tenantId: string;
  propertyId: string;
  range?: DateRange;
  reason: string;
  note: string;
  saving: boolean;
  setReason: (value: string) => void;
  setNote: (value: string) => void;
  setSaving: (value: boolean) => void;
  onSaved: () => Promise<void> | void;
  clearRange: () => void;
};

export default function BlockDatesForm({
  tenantId,
  propertyId,
  range,
  reason,
  note,
  saving,
  setReason,
  setNote,
  setSaving,
  onSaved,
  clearRange,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");

  async function save() {
    if (!range?.from || !range?.to) {
      return;
    }

    setSaving(true);

    try {

      if (reason === "walk_in") {
        const response = await apiClient.api<any>(
          `v1/tenants/${tenantId}/bookings`,
          {
            method: "POST",
            body: JSON.stringify({
              property_id: propertyId,
              check_in: formatDate(range.from),
              check_out: formatDate(range.to),
              guests: 1,
              units: 1,
              total_price: Number(price),
              guest_name: name.trim() || null,
              guest_email: email.trim() || null,
              special_requests: note.trim() || null,
              payment_method: "pay_on_property",
              is_walk_in: true,
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error(
            await response.text()
          );
        }

        setName("");
        setEmail("");
        setPrice("");
        setNote("");
        clearRange();

        await onSaved();

        return;
      }

      const response = await apiClient.api<any>(
        `v1/tenants/${tenantId}/properties/${propertyId}/blocked-periods`,
        {
          method: "POST",
          body: JSON.stringify({
            start_date: formatDate(range.from),
            end_date: formatDate(range.to),
            reason,
            note: note || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await response.text()
        );
      }

      setNote("");
      clearRange();

      await onSaved();
    } catch (error) {
      console.error(
        reason === "walk_in"
          ? "Could not create walk-in booking:"
          : "Could not block dates:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative space-y-5">
      <DevLabel
        name="CalendarSyncSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/property/BlockDatesForm.tsx"
      />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-600">
          Reason
        </span>

        <select
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-sm"
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

      {reason === "walk_in" ? (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Name
            </span>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Price
            </span>

            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">
              Note
            </span>

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm"
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Note
          </span>

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm"
          />
        </label>
      )}

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
        onClick={save}
        disabled={
          !range?.from ||
          !range?.to ||
          saving ||
          (reason === "walk_in" &&
            (!name.trim() ||
              !price.trim()))
        }
        className="cursor-pointer rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-slate-100 disabled:opacity-40"
      >
        {saving
          ? "Saving..."
          : reason === "walk_in"
            ? "Create booking"
            : "Block dates"}
      </button>
    </div>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}