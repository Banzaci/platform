import { apiClient } from "@/libs/api";

export async function deleteTenant(
  tenantId: string
) {
  return apiClient.api<{
    id: string;
    deleted: boolean;
  }>(
    `v1/tenants/${tenantId}`,
    {
      method: "DELETE",
    }
  );
}

// await deleteTenant(tenant.id);