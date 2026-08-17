"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { apiClient } from "@/libs/api";
import KnowledgeItemEditor from "./KnowledgeItemEditor";

export type LocalizedText = Record<string, string>;

export type KnowledgeItem = {
  id: string;
  tenant_id: string;
  category: string;
  question: LocalizedText;
  answer: LocalizedText;
  is_active: boolean;
  priority: number;
  source: string;
};

const DEFAULT_QUESTIONS = [
  {
    category: "facilities",
    question: {
      en: "Do you have a swimming pool?",
      sv: "Har ni en swimmingpool?",
    },
  },
  {
    category: "facilities",
    question: {
      en: "Do you have WiFi?",
      sv: "Har ni WiFi?",
    },
  },
  {
    category: "location",
    question: {
      en: "How far is the beach?",
      sv: "Hur långt är det till stranden?",
    },
  },
  {
    category: "restaurant",
    question: {
      en: "Do you have a restaurant?",
      sv: "Har ni en restaurang?",
    },
  },
  {
    category: "restaurant",
    question: {
      en: "What are the restaurant opening hours?",
      sv: "Vilka öppettider har restaurangen?",
    },
  },
  {
    category: "check-in",
    question: {
      en: "What time is check-in?",
      sv: "Vilken tid är incheckning?",
    },
  },
  {
    category: "check-in",
    question: {
      en: "What time is check-out?",
      sv: "Vilken tid är utcheckning?",
    },
  },
  {
    category: "policies",
    question: {
      en: "Are pets allowed?",
      sv: "Är husdjur tillåtna?",
    },
  },
];

export default function KnowledgeEditor({
  tenantId,
}: {
  tenantId: string;
}) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiClient.api<KnowledgeItem[]>(
        `v1/tenants/${tenantId}/knowledge`
      );

      setItems(data);
    } catch (error) {
      console.error("Could not load knowledge:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchKnowledge() {
      try {
        const data = await apiClient.api<KnowledgeItem[]>(
          `v1/tenants/${tenantId}/knowledge`
        );

        if (!cancelled) {
          setItems(data);
        }
      } catch (error) {
        console.error("Could not load knowledge:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchKnowledge();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  async function createFromTemplate(
    template: typeof DEFAULT_QUESTIONS[number]
  ) {
    const created = await apiClient.api<KnowledgeItem>(
      `v1/tenants/${tenantId}/knowledge`,
      {
        method: "POST",
        body: JSON.stringify({
          category: template.category,
          question: template.question,
          answer: {
            en: "",
            sv: "",
          },
          is_active: true,
          priority: 0,
          source: "manual",
        }),
      }
    );

    setItems((current) => [...current, created]);
  }

  async function createCustom() {
    const created = await apiClient.api<KnowledgeItem>(
      `v1/tenants/${tenantId}/knowledge`,
      {
        method: "POST",
        body: JSON.stringify({
          category: "other",
          question: {
            en: "New question",
            sv: "Ny fråga",
          },
          answer: {
            en: "",
            sv: "",
          },
          is_active: true,
          priority: 0,
          source: "manual",
        }),
      }
    );

    setItems((current) => [...current, created]);
  }

  function updateLocal(updated: KnowledgeItem) {
    setItems((current) =>
      current.map((item) =>
        item.id === updated.id ? updated : item
      )
    );
  }

  function removeLocal(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        Loading knowledge...
      </div>
    );
  }

  const existingEnglishQuestions = new Set(
    items.map((item) => item.question?.en)
  );

  const unusedTemplates = DEFAULT_QUESTIONS.filter(
    (template) =>
      !existingEnglishQuestions.has(template.question.en)
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-gray-950">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">
            Hotel knowledge
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Add information your AI assistant should know about
            your hotel, facilities, policies and services.
          </p>
        </div>

        <button
          type="button"
          onClick={createCustom}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Custom question
        </button>
      </div>

      {unusedTemplates.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">
            Suggested questions
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {unusedTemplates.map((template) => (
              <button
                key={template.question.en}
                type="button"
                onClick={() => createFromTemplate(template)}
                className="rounded-xl border bg-white p-4 text-left transition hover:bg-gray-50"
              >
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  {template.category}
                </div>

                <div className="mt-1 font-medium">
                  {template.question.en}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 space-y-4">
        {items.map((item) => (
          <KnowledgeItemEditor
            key={item.id}
            tenantId={tenantId}
            item={item}
            onUpdated={updateLocal}
            onDeleted={removeLocal}
          />
        ))}
      </section>
    </main>
  );
}