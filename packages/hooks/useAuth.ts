import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@hotel/libs";

export function useAuth(apiClient: ApiClient, path: string = "v1/auth/me/session") {
  return useQuery({
    queryKey: ["auth-user", apiClient],
    queryFn: () => apiClient.api(path),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 30 * 60 * 1000,
  });
}