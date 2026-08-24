"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiClient } from "@/libs/api";
import { Field } from "@/app/components/Field";

type GenerateProjectResponse = {
  tenant_id: string;
  message: string;
};

export default function AITenantDetails() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!prompt.trim() || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result =
        await apiClient.api<GenerateProjectResponse>(
          "v1/tenants/ai-generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: prompt.trim(),
              password,
              email
            }),
          }
        );

      router.push(
        `/tenant/${result.tenant_id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        "Could not create your hotel. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Describe your hotel
          </h1>

          <p className="mt-2 text-gray-500">
            Tell us what you want and we&apos;ll build the first version for you.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Choose a password"
            />
            </div>
            {/* <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              rows={8}
              disabled={isSubmitting}
              placeholder="I want a small eight-room surf hotel in Ghana with a warm design. I need Home, Rooms, Activities, About and Contact."
              className="w-full resize-none px-5 py-5 text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
            /> */}

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-400">
                Describe style, rooms, location and pages.
              </span>

              <button
                type="submit"
                disabled={
                  !prompt.trim() ||
                  isSubmitting ||
                  !email ||
                  !password
                }
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting
                  ? "Building..."
                  : "Build my hotel"}
              </button>
            </div>
          </div>
        </form>
        {error && (
          <p className="mt-4 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Example
            text="8-room surf hotel in Ghana"
          />

          <Example
            text="Minimal boutique hotel in Bali"
          />

          <Example
            text="Beach guesthouse for digital nomads"
          />
        </div>
      </div>
    </main>
  );
}

function Example({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}