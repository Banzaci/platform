/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;

type Props = {
  section: any;
  sections: any[];
  pageId: string;
  tenantId: string;
};

export default function MoveSection({
  section,
  sections,
  pageId,
  tenantId,
}: Props) {
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
      console.error("Could not move section");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="absolute left-4 top-4 z-30 flex gap-2 opacity-0 transition group-hover:opacity-100">
      <button
        type="button"
        onClick={() => move("up")}
        disabled={index === 0}
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-30"
      >
        ↑
      </button>

      <button
        type="button"
        onClick={() => move("down")}
        disabled={index === sections.length - 1}
        className="rounded-lg bg-black px-3 py-2 text-white disabled:opacity-30"
      >
        ↓
      </button>
    </div>
  );
}