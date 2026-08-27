"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/api";
import { Tenant } from "@hotel/types";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DevLabel from "@/app/components/DevLabel";
import TenantDetails from "@/app/components/TenantDetails";
import { PageLoader } from "@hotel/ui";

export default function DashboardPage() {
  const router = useRouter();
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteTenant = useMutation({
    mutationFn: (tenantId: string) =>
      apiClient.api(
        `v1/tenants/${tenantId}`,
        {
          method: "DELETE",
        }
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tenants"],
      });
      window.location.reload();
    },
  });

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => apiClient.api<Tenant[]>("v1/tenants"),
  });

  if (isLoading) {
    return <PageLoader />
  }

  return (
  <main className="relative min-h-screen">
    <DevLabel
      name="DashboardPage"
      file="/Users/michellarsson/Projects/hotels/apps/platform/app/(protected)/dashboard/page.tsx"
    />
    <div className="mx-auto w-full max-w-2xl">
      <TenantDetails />
      {/* <AITenantDetails /> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setIsAddTenantOpen(true)}
          className="mb-5 flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
        >
          + Add hotel
        </button>
        {tenants?.length ? (
          <ul className="divide-y divide-gray-100">
            {tenants.map((tenant) => {
              return (
              <li
                key={tenant.id}
                className={`group flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${
                  tenant.deleted ? "opacity-50 line-through" : "text-gray-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/tenant/${tenant.id}`
                    )
                  }
                  className="min-w-0 flex-1 rounded-lg px-3 py-3 text-left transition hover:bg-gray-50"
                >
                  <div className="truncate font-medium text-gray-900">
                    {tenant.name}
                  </div>

                  <div className="mt-0.5 truncate text-xs text-gray-400">
                    {tenant.subdomain}
                  </div>
                </button>
                <button
                  type="button"
                  title="Delete hotel"
                  disabled={deleteTenant.isPending}
                  onClick={() => {
                    const message = tenant.deleted
                      ? `Permanently delete "${tenant.name}"? This cannot be undone.`
                      : `Delete "${tenant.name}"?`;

                    if (window.confirm(message)) {
                      deleteTenant.mutate(tenant.id);
                    }
                  }}
                  className="rounded-lg p-2.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
            })}
          </ul>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No hotels yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create your first hotel to get started.
            </p>
          </div>
        )}
      </div>
    </div>

    {isAddTenantOpen && (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
        onClick={() =>
          setIsAddTenantOpen(false)
        }
      >
        <div className="flex min-h-full items-start justify-center py-8">
          <div
            className="w-full max-w-4xl rounded-2xl bg-white shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* <AITenantDetails /> */}
            <TenantDetails />
          </div>
        </div>
      </div>
    )}
  </main>
);
}