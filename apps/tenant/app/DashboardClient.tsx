/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/api";

export function DashboardClient({ host }: { host: string }) {

  const { data, isLoading } = useQuery({
    queryKey: ["tenant", host],
    queryFn: () => apiClient.api<any>(`/tenant-resolve?host=${host}`),
  });

  if (isLoading) {
    return null;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}