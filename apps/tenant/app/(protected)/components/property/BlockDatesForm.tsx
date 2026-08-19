"use client";

import { DateRange } from "react-day-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

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
  async function save() {
    if (!API_URL || !range?.from || !range?.to) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

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

      setNote("");
      clearRange();

      await onSaved();
    } catch (error) {
      console.error("Could not block dates:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-600">
          Reason
        </span>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 shadow-sm text-sm"
        >
          <option value="renovation">Renovation</option>
          <option value="maintenance">Maintenance</option>
          <option value="walk_in">Walk in</option>
          <option value="owner_use">Owner use</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-600">
          Note
        </span>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm text-slate-600 text-sm"
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
        onClick={save}
        disabled={!range?.from || !range?.to || saving}
        className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-slate-200 bg-black hover:text-slate-100 disabled:opacity-40"
      >
        {saving ? "Saving..." : "Block dates"}
      </button>
    </div>
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}