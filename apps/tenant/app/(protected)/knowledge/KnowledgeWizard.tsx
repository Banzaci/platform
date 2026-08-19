"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

export type LocalizedText = Record<string, string>;

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

type Props = {
  templates: KnowledgeTemplate[];
  items: KnowledgeItem[];
  language: string;

  onAnswer: (
    template: KnowledgeTemplate,
    answer: string
  ) => Promise<void>;

  onAddCustom: () => void;
};

export default function KnowledgeWizard({
  templates,
  items,
  language,
  onAnswer,
  onAddCustom,
}: Props) {
  const [index, setIndex] = useState(0);

  const [yesNo, setYesNo] =
    useState<"yes" | "no" | null>(null);

  const [value, setValue] = useState("");
  const [customAnswer, setCustomAnswer] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const template = templates[index];

  const savedItem = useMemo(() => {
    if (!template) return null;

    return (
      items.find(
        (item) =>
          item.template_key ===
          template.key
      ) ?? null
    );
  }, [items, template]);

  const savedAnswer =
    savedItem?.answer?.[language] ?? "";

  const progress = templates.length
    ? ((index + 1) / templates.length) * 100
    : 0;

  function getTemplateState(
    target: KnowledgeTemplate
  ) {
    const item =
      items.find(
        (item) =>
          item.template_key === target.key
      ) ?? null;

    const answer =
      item?.answer?.[language] ?? "";

    if (target.type === "yes_no") {
      const yes =
        target.yes_answer?.[language] ?? "";

      const no =
        target.no_answer?.[language] ?? "";

      if (answer && answer === yes) {
        return {
          yesNo: "yes" as const,
          value: "",
          customAnswer: "",
        };
      }

      if (answer && answer === no) {
        return {
          yesNo: "no" as const,
          value: "",
          customAnswer: "",
        };
      }

      if (answer) {
        return {
          yesNo: null,
          value: "",
          customAnswer: answer,
        };
      }

      return {
        yesNo: null,
        value: "",
        customAnswer: "",
      };
    }

    return {
      yesNo: null,
      value: answer,
      customAnswer: "",
    };
  }

  function loadQuestion(nextIndex: number) {
    const target =
      templates[nextIndex];

    if (!target) return;

    const state =
      getTemplateState(target);

    setIndex(nextIndex);
    setYesNo(state.yesNo);
    setValue(state.value);
    setCustomAnswer(
      state.customAnswer
    );
  }

  function next() {
    if (
      index >=
      templates.length - 1
    ) {
      return;
    }

    loadQuestion(index + 1);
  }

  function previous() {
    if (index <= 0) {
      return;
    }

    loadQuestion(index - 1);
  }

  function skip() {
    next();
  }

  function getAnswer() {
    if (!template) {
      return "";
    }

    if (customAnswer.trim()) {
      return customAnswer.trim();
    }

    if (template.type === "yes_no") {
      if (yesNo === "yes") {
        return (
          template.yes_answer?.[
            language
          ] ?? ""
        );
      }

      if (yesNo === "no") {
        return (
          template.no_answer?.[
            language
          ] ?? ""
        );
      }

      return "";
    }

    return value.trim();
  }

  async function saveAndNext() {
    if (!template) return;

    const answer = getAnswer();

    if (!answer) {
      return;
    }

    setSaving(true);

    try {
      await onAnswer(
        template,
        answer
      );

      if (
        index <
        templates.length - 1
      ) {
        loadQuestion(index + 1);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!template) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold">
          No questions available
        </h2>
      </div>
    );
  }

  const currentDisplayAnswer =
    getAnswer() || savedAnswer;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Hotel knowledge
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Tell us about your property
          </h1>
        </div>

        <button
          type="button"
          onClick={onAddCustom}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Custom question
        </button>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">
            Question {index + 1} of{" "}
            {templates.length}
          </span>

          <span className="text-slate-400">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-7 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {template.category}
            </div>

            {savedItem && (
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Answered
              </div>
            )}
          </div>

          <h2 className="mt-2 text-2xl font-semibold leading-snug text-slate-900">
            {template.question[
              language
            ] ?? template.question.en}
          </h2>
        </div>

        <div className="space-y-6 px-7 py-7">
          {template.type ===
            "yes_no" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setYesNo("yes");
                    setCustomAnswer("");
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    yesNo === "yes"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">
                    Yes
                  </div>

                  {template
                    .yes_answer?.[
                    language
                  ] && (
                    <div
                      className={`mt-1 text-sm ${
                        yesNo === "yes"
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        template
                          .yes_answer[
                          language
                        ]
                      }
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setYesNo("no");
                    setCustomAnswer("");
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    yesNo === "no"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">
                    No
                  </div>

                  {template
                    .no_answer?.[
                    language
                  ] && (
                    <div
                      className={`mt-1 text-sm ${
                        yesNo === "no"
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        template
                          .no_answer[
                          language
                        ]
                      }
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Custom answer
                </label>

                <textarea
                  value={
                    customAnswer
                  }
                  onChange={(e) => {
                    setCustomAnswer(
                      e.target.value
                    );

                    if (
                      e.target.value
                    ) {
                      setYesNo(null);
                    }
                  }}
                  placeholder="Optional — this replaces the default answer."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-slate-400"
                />
              </div>
            </>
          )}

          {template.type ===
            "text" && (
            <textarea
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value
                )
              }
              placeholder="Write your answer..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-slate-400"
            />
          )}

          {template.type ===
            "number" && (
            <input
              type="number"
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          )}

          {template.type ===
            "time" && (
            <input
              type="time"
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          )}

          {template.type ===
            "select" && (
            <select
              value={value}
              onChange={(e) =>
                setValue(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            >
              <option value="">
                Select an option
              </option>

              {template.options?.map(
                (
                  option,
                  optionIndex
                ) => (
                  <option
                    key={
                      optionIndex
                    }
                    value={
                      option[
                        language
                      ] ??
                      option.en
                    }
                  >
                    {option[
                      language
                    ] ??
                      option.en}
                  </option>
                )
              )}
            </select>
          )}

          {savedItem &&
            currentDisplayAnswer && (
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Saved answer
                </div>

                <div className="mt-1 text-sm text-slate-700">
                  {
                    currentDisplayAnswer
                  }
                </div>
              </div>
            )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-7 py-5">
          <button
            type="button"
            onClick={previous}
            disabled={index === 0}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:invisible"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={skip}
              disabled={
                index ===
                templates.length -
                  1
              }
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={
                saveAndNext
              }
              disabled={
                saving ||
                !getAnswer()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving..."
                : savedItem
                  ? "Update & next"
                  : "Save & next"}

              {!saving && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}