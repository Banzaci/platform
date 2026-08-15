"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/api";
import { Tenant } from "@hotel/types";

export default function DashboardPage() {
  const router = useRouter();
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["my-tenants"],
    queryFn: () => apiClient.api<Tenant[]>("v1/tenants"),
  });
  
  useEffect(() => {
    if (!isLoading && !tenants?.length) {
      setIsAddTenantOpen(true);
    }
  }, [isLoading, tenants]);

  if (isLoading) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto flex max-w-4xl gap-6">
        <div className="w-64 shrink-0 space-y-2">
          <button
            onClick={() => setIsAddTenantOpen(true)}
            className="w-full rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 text-left text-sm text-neutral-500 hover:bg-neutral-50"
          >
            + Add tenant
          </button>

          <ul className="space-y-2">
            {tenants?.map((tenant) => (
              <li key={tenant.id}>
                <button
                  onClick={() => router.push(`/tenant/${tenant.id}`)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left text-sm hover:bg-neutral-50"
                >
                  {tenant.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}