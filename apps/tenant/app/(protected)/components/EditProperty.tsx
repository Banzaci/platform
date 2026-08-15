"use client";

import { useState } from "react";
import { X } from "lucide-react";
import PropertyImagesEditor, { PropertyImage } from "./PropertyImagesEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

export type Property = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  units: number;
  amenities: string[];
  is_open: boolean;
  images: PropertyImage[];
};

type Props = {
  tenantId: string;
  property: Property;
  onClose: () => void;
  onSaved: (property: Property) => void;
};

const amenities = [
  "WiFi",
  "Air conditioning",
  "Pool",
  "Kitchen",
  "Parking",
  "Balcony",
  "Terrace",
  "Garden",
  "Sea view",
  "Workspace",
  "Private bathroom",
];

export default function EditProperty({
  tenantId,
  property,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState(property);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Property>(
    key: K,
    value: Property[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleAmenity(amenity: string) {
    const exists = form.amenities.includes(amenity);

    update(
      "amenities",
      exists
        ? form.amenities.filter((item) => item !== amenity)
        : [...form.amenities, amenity]
    );
  }

  async function save() {
    if (!API_URL) return;

    setSaving(true);

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/${property.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            max_guests: form.max_guests,
            bedrooms: form.bedrooms,
            beds: form.beds,
            bathrooms: form.bathrooms,
            units: form.units,
            amenities: form.amenities,
            is_open: form.is_open,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updated = await response.json();

      onSaved(updated);
      onClose();
    } catch (error) {
      console.error("Update property failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Edit property
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            />
          </Field>
          <PropertyImagesEditor
            tenantId={tenantId}
            images={form.images}
            onChange={(images) =>
              update("images", images)
            }
          />
          <Field label="Description">
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                update("description", e.target.value)
              }
              rows={5}
              className="w-full rounded-lg border px-4 py-3"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <NumberField
              label="Guests"
              value={form.max_guests}
              onChange={(value) => update("max_guests", value)}
            />

            <NumberField
              label="Bedrooms"
              value={form.bedrooms}
              onChange={(value) => update("bedrooms", value)}
            />

            <NumberField
              label="Beds"
              value={form.beds}
              onChange={(value) => update("beds", value)}
            />

            <NumberField
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(value) => update("bathrooms", value)}
            />

            <NumberField
              label="Units"
              value={form.units}
              onChange={(value) => update("units", value)}
            />
          </div>

          <Field label="Amenities">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-3"
                >
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />

                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-5 py-3"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save property"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
      </span>

      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full rounded-lg border px-3 py-3"
      />
    </Field>
  );
}