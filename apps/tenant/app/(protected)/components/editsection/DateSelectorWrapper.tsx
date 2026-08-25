"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Pencil, X } from "lucide-react";
import { createPortal } from "react-dom";

import { GlobalTheme, SectionTheme } from "@/types";
import DateSelector from "@/app/accommodation/DateSelector";
import DateSelectorThemeEditor from "./DateSelectorThemeEditor";
import EditButton from "../EditButton";

type Props = {
  range?: DateRange;
  setRange: (range: DateRange | undefined) => void;
  globalTheme: GlobalTheme;
  editable?: boolean;
  onThemeChange: (theme: GlobalTheme) => void;
  onSave: () => Promise<void>;
};

export default function DateSelectorWrapper({
  range,
  setRange,
  globalTheme,
  editable = false,
  onThemeChange,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onSave();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full">
      {editable && (
        <EditButton onClick={() => setOpen(true)} />
      )}

      <DateSelector
        range={range}
        setRange={setRange}
        globalTheme={globalTheme}
      />

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={() => setOpen(false)}
          >
            <div
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white text-black shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between bg-gray-100 border-b border-b-gray-200 px-7 pt-5 pb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-950">
                    Date selector design
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Edit the main content shown in this section.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-7 py-6">
                <DateSelectorThemeEditor
                  globalTheme={globalTheme}
                  onChange={onThemeChange}
                />
              </div>

              <div className="flex justify-end gap-3 border-t bg-gray-50 px-7 py-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}