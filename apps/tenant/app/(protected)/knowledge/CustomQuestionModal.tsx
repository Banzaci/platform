"use client";

import { useState } from "react";

import { apiClient } from "@/libs/api";
import type {
  KnowledgeItem,
  LocalizedText,
} from "./KnowledgeEditor";

type Props = {
  tenantId: string;
  language: string;
  onClose: () => void;
  onCreated: (item: KnowledgeItem) => void;
};

export default function CustomQuestionModal({
  tenantId,
  language,
  onClose,
  onCreated,
}: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!question.trim() || !answer.trim()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const questionValue: LocalizedText = {
        [language]: question.trim(),
      };

      const answerValue: LocalizedText = {
        [language]: answer.trim(),
      };

      const created =
        await apiClient.api<KnowledgeItem>(
          `v1/tenants/${tenantId}/knowledge`,
          {
            method: "POST",
            body: JSON.stringify({
              template_key: null,
              category: "custom",
              intent: null,
              question: questionValue,
              answer: answerValue,
              is_active: true,
              priority: 0,
              source: "manual",
            }),
          }
        );

      onCreated(created);
    } catch (error) {
      console.error(
        "Could not create custom question:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not create custom question."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 text-slate-900 shadow-2xl"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <div>
          <h2 className="text-xl font-semibold">
            Custom question
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add a question that is not included in the standard questions.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Question
            </label>

            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              placeholder="Can guests rent bicycles?"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Answer
            </label>

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              rows={4}
              placeholder="Yes, bicycles can be rented at reception."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-7 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={save}
            disabled={
              saving ||
              !question.trim() ||
              !answer.trim()
            }
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : "Add question"}
          </button>
        </div>
      </div>
    </div>
  );
}