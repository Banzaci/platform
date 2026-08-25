"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import PropertyImagesEditor, { EditablePropertyImage } from "./PropertyImagesEditor";
import BasePriceEditor, { BasePrice, isValidBasePrice } from "./price/BasePriceEditor";
import { Property } from "@/types";
import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";

type Props = {
  tenantId: string;
  property: Property;
  onClose: () => void;
  onSaved: (property: Property) => void;
};

type ImageResponse = {
  url: string;
  public_id: string;
};

type EditableProperty = Omit<Property, "images"> & {
  images: EditablePropertyImage[];
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
  const [form, setForm] = useState<EditableProperty>(property);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [basePrice, setBasePrice] = useState<BasePrice>({
    daily_price: property.base_price?.daily_price ?? 0,
    weekly_price: property.base_price?.weekly_price ?? null,
    monthly_price: property.base_price?.monthly_price ?? null,
  });

  function update<K extends keyof EditableProperty>(
    key: K,
    value: EditableProperty[K]
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

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "property");

    return apiClient.api<ImageResponse>(
      `v1/tenants/${tenantId}/uploads/image`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async function save() {
    setSaving(true);
    try {
      const uploadedImages = await Promise.all(
        form.images.map(async (image) => {
          if (!image.file) {
            return {
              url: image.url,
              publicId: image.publicId!,
            };
          }

          const uploaded = await uploadImage(image.file);

          return {
            url: uploaded.url,
            publicId: uploaded.public_id,
          };
        })
      );
      console.log("FORM IMAGES:", form.images);
      console.log("UPLOADED IMAGES:", uploadedImages);
      const response = await apiClient.api<Property>(
        `v1/tenants/${tenantId}/properties/${property.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            max_guests: form.max_guests,
            bedrooms: form.bedrooms,
            beds: form.beds,
            bathrooms: form.bathrooms,
            units: form.units,
            amenities: form.amenities,
            images: uploadedImages,
            is_open: form.is_open,
          }),
        }
      );

      await apiClient.api<Property>(
        `v1/tenants/${tenantId}/properties/${property.id}/base-price`,
        {
          method: "PUT",
          body: JSON.stringify(basePrice),
        }
      );

      onSaved(response);
      if (imageToDelete) {
        await deleteImage(imageToDelete);
      }
      window.location.reload();
    } catch (error) {
      console.error("Update property failed:", error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(publicId: string) {
    await apiClient.api(
      `v1/tenants/${tenantId}/uploads/image`,
      {
        method: "DELETE",
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );
  }

  const canSave = isValidBasePrice(basePrice);

  return (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-6">
    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-black/5 bg-[#f7f7f8] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between border-b border-black/5 bg-white px-6 py-5 sm:px-8">
        <div className="relative">
          <DevLabel
            name="EditProperty"
            file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/components/EditProperty.tsx"
          />
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-950">
            Edit property
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage details, capacity, pricing and amenities.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 p-5 sm:p-8">

          {/* Property details */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-950">
                Property details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                The main information guests will see.
              </p>
            </div>

            <div className="space-y-5">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    update("description", e.target.value)
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </Field>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-950">
                Photos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add high-quality photos to showcase the property.
              </p>
            </div>

            <PropertyImagesEditor
              tenantId={tenantId}
              images={form.images}
              onChange={(images) => update("images", images)}
              onDelete={(publicId) => setImageToDelete(publicId)}
            />
          </section>

          {/* Capacity */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-950">
                Capacity
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure occupancy and room details.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-950">
                Pricing
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the standard nightly rate for this property.
              </p>
            </div>

            <BasePriceEditor
              value={basePrice}
              onChange={setBasePrice}
            />
          </section>

          {/* Amenities */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-950">
                Amenities
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose what guests can expect during their stay.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {amenities.map((amenity) => {
                const selected = form.amenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                      selected
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{amenity}</span>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected
                          ? "border-white/30 bg-white text-gray-900"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 border-t border-black/5 bg-white px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="hidden text-xs text-gray-400 sm:block">
            Changes won't be visible until you save.
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="min-w-[130px] rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </footer>
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
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-gray-700">
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full rounded-xl border border-gray-200 bg-white
          px-3.5 py-3 text-sm text-gray-900
          outline-none transition
          hover:border-gray-300
          focus:border-gray-900 focus:ring-1 focus:ring-gray-900
        "
      />
    </Field>
  );
}