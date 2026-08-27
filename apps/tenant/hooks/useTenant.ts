"use client";

import { useQuery } from "@tanstack/react-query";
import { TenantResponse } from "@/types";
import { apiClient } from "@/libs/api";

export function useTenant(host: string) {
  return useQuery({
    queryKey: ["tenant", host],

    queryFn: () =>
      apiClient.api<TenantResponse>(
        `v1/tenants/resolve?host=${encodeURIComponent(host)}`
      ),

    staleTime: 5 * 60 * 1000,
  });
}