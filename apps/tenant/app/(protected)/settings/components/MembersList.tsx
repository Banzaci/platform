"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Users } from "lucide-react";
import { useSettings } from "@/providers/SettingsProvider";
import { apiClient } from "@/libs/api";

type TenantRole = "owner" | "admin" | "staff";

type Member = {
  id: string;
  username: string;
  role: TenantRole;
  permissions: Record<string, boolean>;
  created_at: string;
  can_delete: boolean;
};

export default function MembersList() {
  const { tenantId } = useSettings()
  const queryClient = useQueryClient();

  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery<Member[]>({
    queryKey: ["members", tenantId],
    queryFn: async () => {
      return apiClient.api<Member[]>(
        `v1/tenants/${tenantId}/members`
      );
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (memberId: string) => {
      return apiClient.api(
        `v1/tenants/${tenantId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["members", tenantId],
      });
    },
  });

  return (
    <section className="relative text-slate-900">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Members
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View the users who have access to this
          property and their assigned roles.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Team members
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Accounts that can sign in and access
              this tenant.
            </p>
          </div>
        </div>

        <div>
          {isLoading && (
            <div className="px-6 py-8 text-sm text-slate-500">
              Loading members...
            </div>
          )}

          {isError && (
            <div className="px-6 py-8">
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load members.
              </div>
            </div>
          )}

          {!isLoading &&
            !isError &&
            members.length === 0 && (
              <div className="px-6 py-8 text-sm text-slate-500">
                No members found.
              </div>
            )}

          {!isLoading &&
            !isError &&
            members.length > 0 && (
              <div className="divide-y divide-slate-100">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-4 px-6 py-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {member.username}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Added{" "}
                        {new Date(
                          member.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
                        {member.role}
                      </span>

                      {member.can_delete && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteMember.mutate(member.id)
                          }
                          disabled={deleteMember.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          title="Delete member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}