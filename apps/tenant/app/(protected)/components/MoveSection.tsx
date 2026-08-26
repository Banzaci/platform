/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";

type Props = {
  section: any;
  sections: any[];
  pageId: string;
};

export default function MoveSection({
  section,
  sections,
  pageId,
}: Props) {
  const { tenantId } = useSettings();
  const index = sections.findIndex(
    (item) => item.id === section.id
  );
  async function move(direction: "up" | "down") {
    const newIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= sections.length
    ) {
      return;
    }

    const updatedSections = [...sections];

    [
      updatedSections[index],
      updatedSections[newIndex],
    ] = [
      updatedSections[newIndex],
      updatedSections[index],
    ];

    await apiClient.api<any>(
      `v1/tenants/${tenantId}/pages/${pageId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          sections: updatedSections,
        }),
      }
    );

    window.location.reload();
  }

  return (
    <div className="absolute left-4 top-4 z-30 flex gap-2 opacity-0 transition group-hover:opacity-100">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={index === 0}
        className="cursor-pointer rounded-lg bg-black px-3 py-2 text-white disabled:opacity-30"
      >
        ↑
      </button>

      <button
        type="button"
        onClick={() => move("down")}
        disabled={index === sections.length - 1}
        className="cursor-pointer rounded-lg bg-black px-3 py-2 text-white disabled:opacity-30"
      >
        ↓
      </button>
    </div>
  );
}