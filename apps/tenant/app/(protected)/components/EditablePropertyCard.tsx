/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { GlobalTheme, TenantProperty } from "@/types";
import PropertyCardTheme from "./property/PropertyCardTheme";
import PropertyCard from "@/app/accommodation/PropertyCard";
import EditButton from "./EditButton";
import { apiClient } from "@/libs/api";

type Props = {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  globalTheme: GlobalTheme;
  tenantId: string;
  editable?: boolean;
  onThemeChange: (theme: GlobalTheme) => void;
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
    setSaving(true);
    console.log(JSON.stringify(globalTheme))
    try {
      await apiClient.api<any>(
        `v1/tenants/${tenantId}/theme`,
        {
          method: "PUT",
          body: JSON.stringify(globalTheme),
        }
      );
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