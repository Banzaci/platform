"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/libs/api";

type GenerateProjectResponse = {
  tenant_id: string;
  message: string;
};

export default function AIInputTextArea() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim() || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await apiClient.api<GenerateProjectResponse>(
        "v1/tenants/generate",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: prompt.trim(),
          }),
        }
      );

      router.push(`/tenant/${result.tenant_id}`);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex items-center justify-center bg-[#f7f7f8] px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            What do you want to create?
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Describe your hotel and we&apos;ll create the starting point for
            you.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="I want to create a new project called Laughing Goat Ghana, 9 rooms, a contact page, an about us page and the first page should have 3 images in a row with text..."
              disabled={isSubmitting}
              rows={7}
              className="w-full resize-none rounded-2xl px-5 py-5 text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60"
            />

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-400">
                Describe your hotel in your own words
              </span>

              <button
                type="submit"
                disabled={!prompt.trim() || isSubmitting}
                className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Creating..." : "Create project"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Example: hotel name, number of rooms, pages and layout
        </div>
      </div>
    </main>
  );
}