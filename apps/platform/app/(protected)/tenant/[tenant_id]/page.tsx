"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { apiClient } from "@/libs/api";
import { Tenant } from "@hotel/types";
import TenantJsonPage from "@/app/components/TenantJsonPage";

export default function TenantPage() {
  const params = useParams<{ tenant_id: string }>();
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}v1/tenants/${params.tenant_id}`;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <a href={apiUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-blue-600 underline"
        >
          {apiUrl}
        </a>
        <TenantJsonPage />
      </div>
    </main>
  );
}