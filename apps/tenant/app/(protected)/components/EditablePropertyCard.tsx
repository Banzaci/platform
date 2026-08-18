/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { SectionTheme, TenantProperty } from "@/types";
import PropertyCardTheme from "./property/PropertyCardTheme";
import { API_URL, TOKEN_NAME } from "../types";
import PropertyCard from "@/app/accommodation/PropertyCard";

type Props = {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  theme: SectionTheme;
  tenantId: string;
  editable?: boolean;
  onThemeChange: (theme: SectionTheme) => void;
};

export default function EditablePropertyCard({
  property,
  checkIn,
  checkOut,
  theme,
  editable = false,
  tenantId,
  onThemeChange
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!API_URL) return;
    console.log(JSON.stringify(theme))

    setSaving(true);

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/theme`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(theme),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(
        "Property theme save failed:",
        error
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {editable && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-lg"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      <PropertyCard
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        theme={theme}
      />

      {open && (
        <PropertyCardTheme
          theme={theme}
          onChange={onThemeChange}
          onSave={save}
          isSaving={saving}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}