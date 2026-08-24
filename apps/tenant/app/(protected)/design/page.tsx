import { getTenant } from "@/libs/tenant";
import DesignSettings from "./DesignSettings";

export default async function KnowledgePage() {
  const data = await getTenant();

  return (
    <DesignSettings
      tenantId={data.tenant.id}
    />
  );
}