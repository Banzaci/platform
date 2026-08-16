/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import PropertyCard from "@/app/accomondation/PropertyCard";
import { SectionTheme, TenantProperty } from "@/types";
import PropertyCardTheme from "./property/PropertyCardTheme";
import { API_URL, TOKEN_NAME } from "../types";

type Props = {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  theme: SectionTheme;
  tenantId: string;
  pageId: string;
  section: any;
  sections: any[];
  editable?: boolean;
};

export default function EditablePropertyCard({
  property,
  checkIn,
  checkOut,
  theme,
  editable = false,
  tenantId,
  pageId,
  section,
  sections,
}: Props) {
  const [open, setOpen] = useState(false);
  const [localTheme, setLocalTheme] =
    useState<SectionTheme>(theme);

  const [isSaving, setIsSaving] = useState(false);

  function onThemeChange(nextTheme: SectionTheme) {
    setLocalTheme(nextTheme);
  }

  async function onSave() {
    if (!API_URL) return;

    setIsSaving(true);

    const updatedSections = sections.map((item) => {
      if (item.id !== section.id) {
        return item;
      }

      return {
        ...item,
        theme: localTheme,
      };
    });

    try {
      const token = localStorage.getItem(
        TOKEN_NAME ?? "token"
      );

      const response = await fetch(
        `${API_URL}v1/tenants/${tenantId}/pages/${pageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sections: updatedSections,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(
        "Save property card theme failed:",
        error
      );
    } finally {
      setIsSaving(false);
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
        theme={localTheme}
      />

      {open && (
        <PropertyCardTheme
          theme={localTheme}
          onChange={onThemeChange}
          onSave={onSave}
          isSaving={isSaving}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}