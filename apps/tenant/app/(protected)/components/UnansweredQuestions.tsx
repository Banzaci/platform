"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";

type UnansweredQuestion = {
  id: string;
  question: string;
  language: string;
  count: number;
  created_at: string;
  updated_at: string;
};

type Response = {
  items: UnansweredQuestion[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
};

export default function UnansweredQuestions() {
  const { tenantId } = useSettings()
  const [items, setItems] = useState<UnansweredQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const data =
          await apiClient.api<Response>(
            `v1/tenants/${tenantId}/unanswered-questions?page=${page}&page_size=${pageSize}`
          );

        if (cancelled) return;

        setItems(data.items);
        setPages(data.pages);
        setTotal(data.total);
      } catch (error) {
        console.error(
          "Could not load unanswered questions:",
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
  }, [tenantId, page]);

  async function deleteQuestion(id: string) {
    try {
      await apiClient.api(
        `v1/tenants/${tenantId}/unanswered-questions/${id}`,
        {
          method: "DELETE",
        }
      );

      setItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      setTotal((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Could not delete unanswered question:",
        error
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl py-2 mt-4 text-slate-900">
      <div className="mb-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Unanswered questions
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Questions guests asked that could not be answered.
          Most frequent questions are shown first.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-medium">
            {total} unanswered questions
          </div>
          <div className="text-xs text-slate-400">
            Sorted by frequency
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-400">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No unanswered questions yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex items-start gap-4 px-5 py-4"
              >
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                  {item.count}×
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {item.question}
                  </div>

                  <div className="mt-1 flex gap-3 text-xs text-slate-400">
                    <span>
                      {item.language.toUpperCase()}
                    </span>

                    <span>
                      Last asked{" "}
                      {new Date(
                        item.updated_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteQuestion(item.id)}
                  title="Delete section"
                  className="cursor-pointer rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700 absolute bottom-1 right-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="text-sm text-slate-500">
            Page {page} of {pages}
          </div>

          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.min(
                  pages,
                  current + 1
                )
              )
            }
            disabled={page >= pages}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}