import { getTenant } from "@/libs/tenant";
import PropertiesEditor from "./PropertiesEditor";

export default async function PropertiesPage() {
  const data = await getTenant();

  return (
    <PropertiesEditor
      tenantId={data.tenant.id}
    />
  );
}