/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Save } from "lucide-react";
import { useSettings } from "@/providers/SettingsProvider";
import { apiClient } from "@/libs/api";

const roles = ["owner", "admin", "staff"] as const;

type TenantRole = (typeof roles)[number];

type MemberForm = {
  username: string;
  password: string;
  role: TenantRole;
  permissions: Record<string, boolean>;
};

export default function CreateMembersForm() {
  const { tenantId } = useSettings()

  const queryClient = useQueryClient();

  const [form, setForm] = useState<MemberForm>({
    username: "",
    password: "",
    role: "staff",
    permissions: {}
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const { data: permissions = [] } = useQuery<string[]>({
    queryKey: ["permissions", tenantId],
    queryFn: () =>
      apiClient.api<string[]>(
        `v1/tenants/${tenantId}/permissions`
      ),
  });

  const createMember = useMutation({
    mutationFn: async (data: MemberForm) => {
      return apiClient.api(
        `v1/tenants/${tenantId}/members`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    onSuccess: async () => {
      setForm({
        username: "",
        password: "",
        role: "staff",
        permissions: {},
      });

      setSaved(true);
      setError(null);

      await queryClient.invalidateQueries({
        queryKey: ["members", tenantId],
      });
    },

    onError: (error) => {
      setSaved(false);

      setError(
        error instanceof Error
          ? error.message
          : "Could not create member"
      );
    },
  });

  function update<K extends keyof MemberForm>(
    key: K,
    value: MemberForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError(null);
  }

  function save() {
    if (!form.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!form.password.trim()) {
      setError("Password is required");
      return;
    }

    createMember.mutate(form);
  }

  return (
    <section className="relative text-slate-900">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Add member
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a new account and choose what
          role the member should have.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Member account
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Create login details and assign a
              role to the new member.
            </p>
          </div>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                update(
                  "username",
                  event.target.value
                )
              }
              placeholder="Username"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                update(
                  "password",
                  event.target.value
                )
              }
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Role
            </label>

            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => {
                const selected = form.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      update("role", role)
                    }
                    className={[
                      "rounded-xl border px-4 py-3 text-sm font-medium capitalize transition",
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {role}
                  </button>
                );
              })}
            </div>

            {form.role === "staff" && (
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {permissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <span className="text-sm text-slate-700">
                      {permission}
                    </span>

                    <input
                      type="checkbox"
                      checked={
                        form.permissions[permission] ?? false
                      }
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          permissions: {
                            ...current.permissions,
                            [permission]:
                              event.target.checked,
                          },
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        {saved && (
          <span className="text-sm text-emerald-600">
            Member created
          </span>
        )}

        <button
          type="button"
          onClick={save}
          disabled={createMember.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40"
        >
          <Save className="h-4 w-4" />

          {createMember.isPending
            ? "Creating..."
            : "Create member"}
        </button>
      </div>
    </section>
  );
}