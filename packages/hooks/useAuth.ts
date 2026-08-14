import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@hotel/libs";

export function useAuth(apiClient: ApiClient) {
  return useQuery({
    queryKey: ["auth-user", apiClient],
    queryFn: () => apiClient.api("v1/auth/me/session"),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 30 * 60 * 1000,
  });
}