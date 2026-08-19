/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { SectionTheme, TenantProperty } from "@/types";
import PropertyCardTheme from "./property/PropertyCardTheme";
import { API_URL, TOKEN_NAME } from "../types";
import PropertyCard from "@/app/accommodation/PropertyCard";
import EditButton from "./EditButton";

type Props = {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  globalTheme: SectionTheme;
  tenantId: string;
  editable?: boolean;
  onThemeChange: (theme: SectionTheme) => void;
};

export default function EditablePropertyCard({
  property,
  checkIn,
  checkOut,
  globalTheme,
  editable = false,
  tenantId,
  onThemeChange
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!API_URL) return;

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
          body: JSON.stringify(globalTheme),
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
        <EditButton onClick={() => setOpen(true)} />
      )}

      <PropertyCard
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        globalTheme={globalTheme}
      />

      {open && (
        <PropertyCardTheme
          globalTheme={globalTheme}
          onChange={onThemeChange}
          onSave={save}
          isSaving={saving}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}