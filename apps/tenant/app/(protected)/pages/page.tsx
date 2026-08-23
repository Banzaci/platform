import { getTenant } from "@/libs/tenant";
import TenantPage from "./TenantPage";


export default async function KnowledgePage() {
  const data = await getTenant();

  return (
    <TenantPage
      tenantId={data.tenant.id}
    />
  );
}