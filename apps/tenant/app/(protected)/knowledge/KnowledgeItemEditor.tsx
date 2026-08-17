"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";

import { apiClient } from "@/libs/api";
import {
  KnowledgeItem,
  LocalizedText,
} from "./KnowledgeEditor";

type Language = "en" | "sv";

export default function KnowledgeItemEditor({
  tenantId,
  item,
  onUpdated,
  onDeleted,
}: {
  tenantId: string;
  item: KnowledgeItem;
  onUpdated: (item: KnowledgeItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [language, setLanguage] =
    useState<Language>("en");

  const [question, setQuestion] =
    useState<LocalizedText>(item.question ?? {});

  const [answer, setAnswer] =
    useState<LocalizedText>(item.answer ?? {});

  const [category, setCategory] =
    useState(item.category);

  const [isActive, setIsActive] =
    useState(item.is_active);

  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    try {
      const updated =
        await apiClient.api<KnowledgeItem>(
          `v1/tenants/${tenantId}/knowledge/${item.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              category,
              question,
              answer,
              is_active: isActive,
            }),
          }
        );

      onUpdated(updated);
    } catch (error) {
      console.error("Could not save knowledge:", error);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      "Delete this knowledge item?"
    );

    if (!confirmed) return;

    await apiClient.api<void>(
      `v1/tenants/${tenantId}/knowledge/${item.id}`,
      {
        method: "DELETE",
      }
    );

    onDeleted(item.id);
  }

  return (
    <article className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="facilities">Facilities</option>
          <option value="location">Location</option>
          <option value="restaurant">Restaurant</option>
          <option value="check-in">Check-in</option>
          <option value="activities">Activities</option>
          <option value="policies">Policies</option>
          <option value="transport">Transport</option>
          <option value="other">Other</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
          />
          Active
        </label>
      </div>

      <div className="mt-5 flex gap-2 border-b">
        <LanguageButton
          active={language === "en"}
          onClick={() => setLanguage("en")}
        >
          English
        </LanguageButton>

        <LanguageButton
          active={language === "sv"}
          onClick={() => setLanguage("sv")}
        >
          Svenska
        </LanguageButton>
      </div>

      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Question
          </span>

          <input
            value={question[language] ?? ""}
            onChange={(e) =>
              setQuestion((current) => ({
                ...current,
                [language]: e.target.value,
              }))
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Answer
          </span>

          <textarea
            value={answer[language] ?? ""}
            onChange={(e) =>
              setAnswer((current) => ({
                ...current,
                [language]: e.target.value,
              }))
            }
            rows={4}
            placeholder={
              language === "en"
                ? "Example: The beach is about 3 minutes away on foot."
                : "Exempel: Stranden ligger cirka 3 minuters promenad bort."
            }
            className="w-full rounded-xl border px-4 py-3"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-between border-t pt-5">
        <button
          type="button"
          onClick={remove}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </article>
  );
}

function LanguageButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-sm font-medium ${
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400"
      }`}
    >
      {children}
    </button>
  );
}