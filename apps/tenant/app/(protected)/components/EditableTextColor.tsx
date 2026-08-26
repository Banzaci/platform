"use client";

import { useState } from "react";
import { Check, Palette, X } from "lucide-react";

type Props = {
  text: string;
  currentColor?: string;
  isEdit: boolean;
  onSave: (color: string) => Promise<void> | void;
};

export default function EditableTextColor({
  text,
  currentColor,
  isEdit,
  onSave,
}: Props) {
  const [color, setColor] = useState(
    currentColor ?? "#000000"
  );

  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  function startEditing() {
    setColor(currentColor ?? "#000000");
    setEditing(true);
  }

  function cancel() {
    setColor(currentColor ?? "#000000");
    setEditing(false);
  }

  async function save() {
    try {
      setSaving(true);
      await onSave(color);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!isEdit) {
    return (
      <span
        style={{
          color: currentColor,
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        style={{
          color: editing
            ? color
            : currentColor,
        }}
      >
        {text}
      </span>

      {!editing ? (
        <button
          type="button"
          onClick={startEditing}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
          title="Edit color"
        >
          <Palette className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-lg">
            <span
              className="absolute inset-0"
              style={{
                backgroundColor: color,
              }}
            />

            <Palette className="relative z-10 h-4 w-4 text-white" />

            <input
              type="color"
              value={color}
              onChange={(e) =>
                setColor(e.target.value)
              }
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 disabled:opacity-50"
            title="Save color"
          >
            <Check className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}