"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { apiClient } from "@/libs/api";

export default function TenantJsonPage() {
  const params = useParams<{ tenant_id: string }>();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["tenant-pages", params.tenant_id],
    queryFn: () => apiClient.api<unknown>(`v1/tenants/${params.tenant_id}/pages`),
  });

  if (isLoading) return null;
  if (error || !pages) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-red-600">Kunde inte hämta sidorna.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
        {JSON.stringify(pages, null, 2)}
      </pre>
    </main>
  );
}