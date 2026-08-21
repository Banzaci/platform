import { createApi } from "@hotel/libs";

export const apiClient = createApi(
  process.env.NEXT_PUBLIC_API_URL!,
  process.env.NEXT_PUBLIC_TENANT_TOKEN_NAME!
);
