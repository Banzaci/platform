/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createPortal } from "react-dom";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

type Props = {
  section: any;
  sections: any[];
  pageId: string;
  tenantId: string;
};

const SECTION_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "image-text", label: "Image + Text" },
  { type: "gallery", label: "Gallery" },
  { type: "room-grid", label: "Room Grid" },
  { type: "amenities", label: "Amenities" },
  { type: "cta", label: "Call to action" },
  { type: "card-grid", label: "Card Grid" },
  { type: "contact-info", label: "Contact Info" },
  { type: "contact-form", label: "Contact Form" },
];

function createSection(type: string) {
  const id = `${type}-${crypto.randomUUID()}`;

  switch (type) {
    case "hero":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "New heading" },
          text: { en: "Add your text here." },
          image: "",
          button: {
            label: { en: "Learn more" },
            href: "#",
          },
        },
        theme: {},
      };

    case "image-text":
      return {
        id,
        type,
        layout: "image-left",
        content: {
          image: "",
          heading: { en: "New section" },
          text: { en: "Add your text here." },
        },
        theme: {},
      };

    case "gallery":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Gallery" },
          images: [],
        },
        theme: {},
      };

    case "room-grid":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Our Rooms" },
          text: { en: "Choose your room." },
          limit: 6,
        },
        theme: {},
      };

    case "amenities":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Amenities" },
          items: [],
        },
        theme: {},
      };

    case "cta":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Ready to book?" },
          text: { en: "Book your stay with us." },
          button: {
            label: { en: "Book now" },
            href: "/booking",
          },
        },
        theme: {},
      };

    case "card-grid":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Explore" },
          items: [],
        },
        theme: {},
      };

    case "contact-info":
      return {
        id,
        type,
        layout: null,
        content: {
          address: { en: "" },
          phone: { en: "" },
          email: { en: "" },
        },
        theme: {},
      };

    case "contact-form":
      return {
        id,
        type,
        layout: null,
        content: {
          heading: { en: "Send us a message" },
          submitLabel: { en: "Send message" },
          successMessage: {
            en: "Thank you. We will get back to you soon.",
          },
        },
        theme: {},
      };

    default:
      throw new Error(`Unknown section type: ${type}`);
  }
}

export default function AddSection({
  section,
  sections,
  pageId,
  tenantId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addSection(type: string) {
    if (!API_URL) return;

    const currentIndex = sections.findIndex(
      (item) => item.id === section.id
    );

    if (currentIndex === -1) return;

    const newSection = createSection(type);

    const updatedSections = [
      ...sections.slice(0, currentIndex + 1),
      newSection,
      ...sections.slice(currentIndex + 1),
    ];

    setSaving(true);

    try {
      const token = localStorage.getItem(TOKEN_NAME ?? "token");

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
      console.error("Add section failed:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black px-4 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100"
      >
        <Plus className="h-4 w-4" />
        Add section
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-6 text-black"
            onMouseDown={() => setOpen(false)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Add section
                </h2>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-2xl text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SECTION_TYPES.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    disabled={saving}
                    onClick={() => addSection(item.type)}
                    className="rounded-xl border p-4 text-left transition hover:border-black hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div className="font-medium">
                      {item.label}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {item.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}