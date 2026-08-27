"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import { Field } from "./Field";
import DevLabel from "./DevLabel";

type GenerateProjectResponse = {
  tenant_id: string;
  message: string;
};

type PageInput = {
  name: string;
};

export default function TenantDetails() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ shortDescription, setShortDescription] = useState("");
  const [pages, setPages] = useState<PageInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addPage() {
    setPages((current) => [
      ...current,
      {
        name: "",
      },
    ]);
  }

  function updatePage(
    index: number,
    value: string
  ) {
    setPages((current) =>
      current.map((page, pageIndex) =>
        pageIndex === index
          ? {
              ...page,
              name: value,
            }
          : page
      )
    );
  }

  function removePage(
    index: number
  ) {
    setPages((current) =>
      current.filter(
        (_, pageIndex) =>
          pageIndex !== index
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result =
        await apiClient.api<GenerateProjectResponse>(
          "v1/tenants/generate",
          {
            method: "POST",
            body: JSON.stringify({
              name: name.trim(),
              username: username.trim(),
              password,
              short_description: shortDescription.trim(),
              pages: pages.map((page) => page.name.trim()).filter(Boolean),
            }),
          }
        );
        
      router.push(
        `/tenant/${result.tenant_id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex justify-center my-4">
      <DevLabel
        name="TenantDetails"
        file="/Users/michellarsson/Projects/hotels/apps/platform/app/components/TenantDetails.tsx"
      />
      <div className="w-full max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Hotel details
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Short description
                  </span>
                  <textarea
                    value={shortDescription}
                    onChange={(event) =>
                      setShortDescription(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    placeholder="A beautiful hotel in Ghana."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pages
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add the pages you want
                  created for the hotel.
                </p>
              </div>
            </div>
            <Field
              label="Name"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Laughing Goat Ghana"
            />
            <Field
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="laughinggoat"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Choose a password"
            />
            {pages.length > 0 ? (
              <div className="mt-5 space-y-3">
                {pages.map(
                  (page, index) => {
                    const slug = toSlug(page.name);
                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <label className="block">
                              <span className="mb-2 block text-sm font-medium text-gray-700">
                                Page name
                              </span>

                              <input
                                type="text"
                                value={
                                  page.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updatePage(
                                    index,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="About us"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400"
                              />
                            </label>

                            {page.name.trim() && (
                              <div className="mt-2 text-xs text-gray-400">
                                slug:{" "}
                                <span className="font-mono">
                                  {slug}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removePage(
                                index
                              )
                            }
                            className="mt-7 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center text-sm text-gray-400">
                No pages added yet.
              </div>
            )}
              <button
                type="button"
                onClick={addPage}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Add page
              </button>
              <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                !name.trim() ||
                !username.trim() ||
                !password ||
                isSubmitting
              }
              className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? "Creating..."
                : "Create hotel"}
            </button>
          </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          
        </form>
      </div>
    </main>
  );
}

function toSlug(
  value: string
) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}