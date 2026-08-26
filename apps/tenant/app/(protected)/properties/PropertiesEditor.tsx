/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import EditProperty from "../components/EditProperty";
import { Property } from "@/types";
import PropertyCardEdit from "../components/property/PropertyCardEdit";
import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";
import { useSettings } from "@/providers/SettingsProvider";

export default function PropertiesEditor() {
  const { tenantId } = useSettings()
  const [properties, setProperties] = useState<Property[]>([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  async function loadProperties() {
    try {
      const data = await apiClient.api<Property[]>(
        `v1/tenants/${tenantId}/properties`
      );

      setProperties(data);
    } finally {
      setLoading(false);
    }
  }

  async function createProperties() {
    setCreating(true);

    try {
      const data = await apiClient.api<Property[]>(
        `v1/tenants/${tenantId}/properties/bulk`,
        {
          method: "POST",
          body: JSON.stringify({ count }),
        }
      );
      setProperties(data);
    } finally {
      setCreating(false);
    }
  }

  async function copyProperty(propertyId: string) {
    const copied = await apiClient.api<Property>(
      `v1/tenants/${tenantId}/properties/${propertyId}/copy`,
      {
        method: "POST",
      }
    );

    setProperties((current) => [
      ...current,
      copied,
    ]);
  }

  async function togglePropertyOpen(property: Property) {
    const updated = await apiClient.api<Property>(
      `v1/tenants/${tenantId}/properties/${property.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          is_open: !property.is_open,
        }),
      }
    );

    setProperties((current) =>
      current.map((item) =>
        item.id === updated.id
          ? updated
          : item
      )
    );
  }

  async function deleteProperty(property: Property) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    await apiClient.api<void>(
      `v1/tenants/${tenantId}/properties/${property.id}`,
      {
        method: "DELETE",
      }
    );

    setProperties((current) =>
      current.filter(
        (item) => item.id !== property.id
      )
    );
  }

  useEffect(() => {
    loadProperties();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        Loading...
      </div>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-7xl px-6 py-10 text-gray-900">
      <DevLabel
        name="PropertiesPageClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/(protected)/properties/PropertiesEditor.tsx"
      />

      <div className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Properties
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Manage the rooms, apartments, villas and other
            properties your guests can book.
          </p>
        </div>

        {properties.length > 0 && (
          <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
            {properties.length}{" "}
            {properties.length === 1
              ? "property"
              : "properties"}
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="flex min-h-150 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50/60 p-8">
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Plus className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Create your properties
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              A property can be a room, bungalow, apartment,
              villa or house. Choose how many unique properties
              you want to start with.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) =>
                  setCount(Number(e.target.value))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center outline-none transition focus:border-gray-900 sm:w-28"
              />

              <button
                type="button"
                onClick={createProperties}
                disabled={creating || count < 1}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />

                {creating
                  ? "Creating..."
                  : "Create properties"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {properties.map((property) => (
            <PropertyCardEdit
              key={property.id}
              property={property}
              onEdit={() =>
                setEditingProperty(property)
              }
              onCopy={() =>
                copyProperty(property.id)
              }
              onToggleOpen={() =>
                togglePropertyOpen(property)
              }
              onDelete={() =>
                deleteProperty(property)
              }
              onCalendar={() => {
                window.location.href =
                  `/properties/${property.id}/calendar`;
              }}
            />
          ))}
        </div>
      )}

      {editingProperty && (
        <EditProperty
          property={editingProperty}
          onClose={() =>
            setEditingProperty(null)
          }
          onSaved={(updatedProperty) => {
            setProperties((current) =>
              current.map((property) =>
                property.id ===
                updatedProperty.id
                  ? updatedProperty
                  : property
              )
            );

            setEditingProperty(null);
          }}
        />
      )}
    </main>
  );
}