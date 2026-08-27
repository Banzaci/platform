import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/api";
import { TenantProperty } from "@/types";

export function useProperties(tenantId: string) {
  return useQuery({
    queryKey: [
      "properties",
      tenantId,
    ],
    queryFn: () =>
      apiClient.api<TenantProperty[]>(
        `v1/tenants/${tenantId}/properties`
      ),

    staleTime: 5 * 60 * 1000,
  });
}