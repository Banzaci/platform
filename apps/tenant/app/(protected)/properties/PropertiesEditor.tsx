"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import EditProperty, { Property } from "../components/EditProperty";

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
    if (!API_URL) return;

    const token = localStorage.getItem(
      TOKEN_NAME ?? "token"
    );

    const response = await fetch(
      `${API_URL}v1/tenants/${tenantId}/properties`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    setProperties(data);
    setLoading(false);
  }

  async function createProperties() {
    if (!API_URL) return;

    setCreating(true);

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/properties/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            count,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      setProperties(data);
    } catch (error) {
      console.error("Create properties failed:", error);
    } finally {
      setCreating(false);
    }
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
            <div
              key={property.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                {property.name}
              </h2>

              <div className="mt-4 text-sm text-gray-500">
                {property.beds} beds ·{" "}
                {property.max_guests} guests ·{" "}
                {property.units} units
              </div>

              <button
                type="button"
                onClick={() => setEditingProperty(property)}
                className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Edit property
              </button>
            </div>
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