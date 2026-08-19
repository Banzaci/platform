"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import KnowledgeWizard from "./KnowledgeWizard";
import CustomQuestionModal from "./CustomQuestionModal";

export type LocalizedText = Record<string, string>;

export type KnowledgeItem = {
  id: string;
  tenant_id: string;
  template_key: string | null;
  category: string;
  intent: string | null;
  question: LocalizedText;
  answer: LocalizedText;
  is_active: boolean;
  priority: number;
  source: string;
};

export type KnowledgeTemplate = {
  key: string;
  category: string;
  type:
    | "yes_no"
    | "text"
    | "number"
    | "time"
    | "select";

  question: LocalizedText;

  yes_answer?: LocalizedText;
  no_answer?: LocalizedText;

  options?: LocalizedText[];
};

export default function KnowledgeEditor({
  tenantId,
}: {
  tenantId: string;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unanswered" | "custom">("all");
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [templates, setTemplates] = useState<KnowledgeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [knowledge, templates] =
          await Promise.all([
            apiClient.api<KnowledgeItem[]>(
              `v1/tenants/${tenantId}/knowledge`
            ),

            apiClient.api<KnowledgeTemplate[]>(
              `v1/tenants/${tenantId}/knowledge/templates`
            ),
          ]);

        if (cancelled) return;

        setItems(knowledge);
        setTemplates(templates);
      } catch (error) {
        console.error(
          "Could not load knowledge:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  async function saveKnowledgeAnswer(
    template: KnowledgeTemplate,
    answer: string
  ) {
    const created =
      await apiClient.api<KnowledgeItem>(
        `v1/tenants/${tenantId}/knowledge`,
        {
          method: "POST",

          body: JSON.stringify({
            template_key:
              template.key,

            category:
              template.category,

            intent:
              template.key,

            question:
              template.question,

            answer: {
              [language]:
                answer,
            },

            is_active: true,

            priority: 0,

            source: "template",
          }),
        }
      );

    setItems((current) => [
      ...current,
      created,
    ]);
  }

  async function deleteCustomQuestion(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this custom question?"
    );

    if (!confirmed) return;

    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/knowledge/${id}`,
        {
          method: "DELETE",
        }
      );

      setItems((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(
        "Could not delete custom question:",
        error
      );
    }
  }

  const filteredTemplates = useMemo(() => {
    if (filter === "all") {
      return templates;
    }

    if (filter === "unanswered") {
      return templates.filter(
        (template) =>
          !items.some(
            (item) =>
              item.template_key === template.key
          )
      );
    }

    return [];
  }, [filter, templates, items]);

  const customItems = useMemo(() => {
    return items.filter(
      (item) => item.category === "custom"
    );
  }, [items]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading knowledge...
      </div>
    );
  }


  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex justify-end">
        <select
          value={language}
          onChange={(e) =>
            setLanguage(
              e.target.value
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="en">
            English
          </option>
          <option value="sv">
            Svenska
          </option>
        </select>
      </div>
      <div className="text-sm text-slate-400 mb-2 ml-2">
        {
          templates.filter(
            (template) =>
              !items.some(
                (item) =>
                  item.template_key === template.key
              )
          ).length
        }{" "}
        unanswered
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            All questions
          </button>
          <button
            type="button"
            onClick={() => setFilter("unanswered")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "unanswered"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Unanswered
          </button>
          <button
            type="button"
            onClick={() => setFilter("custom")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === "custom"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Custom questions
          </button>
        </div>
      </div>
      {filter === "custom" ? (
        <div className="space-y-3">
          {customItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {item.question[language] ??
                    item.question.en}
                </div>

                <div className="mt-2 text-sm text-slate-500">
                  {item.answer[language] ??
                    item.answer.en}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  deleteCustomQuestion(item.id)
                }
                title="Delete custom question"
                className="shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {customItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No custom questions yet.
            </div>
          )}
        </div>
      ) : (
        <KnowledgeWizard
          templates={filteredTemplates}
          items={items}
          language={language}
          onAnswer={saveKnowledgeAnswer}
          onAddCustom={() => setCustomOpen(true)}
        />
      )}
      {customOpen && (
        <CustomQuestionModal
          tenantId={tenantId}
          language={language}
          onClose={() => setCustomOpen(false)}
          onCreated={(created) => {
            setItems((current) => [
              ...current,
              created,
            ]);

            setCustomOpen(false);
          }}
        />
      )}
    </main>
  );
}