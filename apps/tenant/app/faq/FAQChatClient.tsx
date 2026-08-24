"use client";

import { FormEvent, useState } from "react";
import { Send, Sparkle, Sparkles } from "lucide-react";

import { apiClient } from "@/libs/api";
import DevLabel from "@/helpers/DevLabel";


type ChatProperty = {
  id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  units: number;
  amenities: string[];
  images: {
    url: string;
    publicId: string;
  }[];
};

type AvailabilityQuery = {
  check_in: string;
  check_out: string;
  guests: number;
  units: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  properties?: ChatProperty[];
  query?: AvailabilityQuery;
};

type ChatResponse = {
  status:
    | "faq"
    | "follow_up"
    | "availability"
    | "select_property"
    | "booking_ready"
    | "booking_confirmed"
    | "unknown"
    | "error";

  answer?: string;
  message?: string;
  question?: string;

  properties?: ChatProperty[];
  query?: AvailabilityQuery;
};

function getSessionId() {
  const key = "faq-chat-session";

  const existing = sessionStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();

  sessionStorage.setItem(key, id);

  return id;
}

export default function FAQChatClient({
  tenantId,
  tenantName,
}: {
  tenantId: string;
  tenantName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = text.trim();

    if (!value || sending) return;

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: value,
      },
    ]);

    setText("");
    setSending(true);

    try {
      const result =
        await apiClient.api<ChatResponse>(
          `v1/tenants/${tenantId}/ai/chat`,
          {
            method: "POST",
            body: JSON.stringify({
              text: value,
              session_id: getSessionId(),
              language: "en",
            }),
          }
        );

      const responseText =
        result.answer ??
        result.question ??
        result.message ??
        "I couldn't answer that.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: responseText,
          properties: result.properties,
          query: result.query,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Something went wrong.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] flex-col">
      <DevLabel
        name="FAQChatClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/faq/FAQChatClient.tsx"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-5 pb-44 pt-8">
          {messages.length === 0 ? (
            <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Sparkle className="h-5 w-5" />
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                How can I help?
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Ask anything about {tenantName}, rooms,
                facilities, availability, getting here or booking.
              </p>

              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {[
                  "What rooms are available?",
                  "How far is the beach?",
                  "How do I get here?",
                  "What facilities do you have?",
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setText(question)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  {message.role === "user" ? (
                    <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-slate-900 px-5 py-3.5 text-sm leading-7 text-white shadow-sm sm:text-base">
                      {message.text}
                    </div>
                  ) : (
                    <div className="flex max-w-[92%] gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm leading-7 text-slate-700 sm:text-base">
                          {message.text}
                        </div>

                        {message.properties &&
                          message.properties.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              {message.properties.map((property) => {
                                const params =
                                  new URLSearchParams();

                                if (message.query?.check_in) {
                                  params.set(
                                    "checkIn",
                                    message.query.check_in
                                  );
                                }

                                if (message.query?.check_out) {
                                  params.set(
                                    "checkOut",
                                    message.query.check_out
                                  );
                                }

                                const propertyUrl =
                                  `/accommodation/${property.id}` +
                                  (params.size
                                    ? `?${params.toString()}`
                                    : "");

                                return (
                                  <a
                                    key={property.id}
                                    href={propertyUrl}
                                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                  >
                                    {property.images?.[0]?.url && (
                                      <div className="overflow-hidden">
                                        <img
                                          src={property.images[0].url}
                                          alt={property.name}
                                          className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                        />
                                      </div>
                                    )}

                                    <div className="p-4">
                                      <h3 className="font-semibold text-slate-900">
                                        {property.name}
                                      </h3>

                                      {property.description && (
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                          {property.description}
                                        </p>
                                      )}

                                      <div className="mt-4 text-sm font-medium text-slate-900">
                                        View room →
                                      </div>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 from-slate-50 px-4 pb-5 pt-12">
        <form
          onSubmit={submit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-[26px] border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60"
        >
          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder={`Ask ${tenantName} anything...`}
            rows={1}
            className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                event.currentTarget.form?.requestSubmit();
              }
            }}
          />

          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
          AI can make mistakes. Please verify important details.
        </p>
      </div>
    </main>
  );
}