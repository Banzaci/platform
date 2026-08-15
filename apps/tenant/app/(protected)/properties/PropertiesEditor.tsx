"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import EditProperty from "../components/EditProperty";
import { Property } from "@/types";
import PropertyCard from "../components/property/PropertyCard";
import { apiClient } from "@/libs/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

export default function PropertiesEditor({
  tenantId,
}: {
  tenantId: string;
}) {
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
  }, [tenantId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        Loading...
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 text-cyan-900">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold">
          Properties
        </h1>

        <p className="mt-2 text-gray-500">
          Manage the properties your guests can book.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">
            How many unique properties?
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            A property can be a room, bungalow, apartment,
            villa or house.
          </p>

          <div className="mt-6 flex gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(Number(e.target.value))
              }
              className="w-28 rounded-lg border px-4 py-3"
            />

            <button
              type="button"
              onClick={createProperties}
              disabled={creating || count < 1}
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />

              {creating
                ? "Creating..."
                : "Create properties"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={() => setEditingProperty(property)}
              onCopy={() => copyProperty(property.id)}
              onToggleOpen={() => togglePropertyOpen(property)}
              onDelete={() => deleteProperty(property)}
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
          tenantId={tenantId}
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSaved={(updatedProperty) => {
            setProperties((current) =>
              current.map((property) =>
                property.id === updatedProperty.id
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