"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

import { apiClient } from "@/libs/api";


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
    <main className="flex min-h-[calc(100vh-64px)] flex-col bg-white text-gray-950">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-5 pb-40 pt-10">
          {messages.length === 0 ? (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                How can I help?
              </h1>

              <p className="mt-3 max-w-lg text-gray-500">
                Ask anything about {tenantName}, rooms,
                facilities, availability or booking.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
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
                    <div className="max-w-[75%] rounded-3xl bg-gray-100 px-5 py-3.5 leading-7">
                      {message.text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] leading-7 text-gray-800">
                      <div>
                        {message.text}

                        {message.properties &&
                          message.properties.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              {message.properties?.map((property) => {
                                const params = new URLSearchParams();

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
                                  `/accomondation/${property.id}` +
                                  (params.size
                                    ? `?${params.toString()}`
                                    : "");

                                return (
                                  <a
                                    key={property.id}
                                    href={propertyUrl}
                                    className="block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                  >
                                    {property.images?.[0]?.url && (
                                      <img
                                        src={property.images[0].url}
                                        alt={property.name}
                                        className="h-40 w-full object-cover"
                                      />
                                    )}

                                    <div className="p-4">
                                      <h3 className="font-semibold">
                                        {property.name}
                                      </h3>

                                      {property.description && (
                                        <p className="mt-2 text-sm text-gray-500">
                                          {property.description}
                                        </p>
                                      )}
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
                <div className="text-sm text-gray-400">
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-4 pb-6 pt-10">
        <form
          onSubmit={submit}
          className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-3xl border bg-white p-3 shadow-lg"
        >
          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Ask anything..."
            rows={1}
            className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 outline-none"
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-400">
          AI can make mistakes. Please verify important details.
        </p>
      </div>
    </main>
  );
}