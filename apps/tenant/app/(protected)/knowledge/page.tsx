import { getTenant } from "@/libs/tenant";
import KnowledgeEditor from "./KnowledgeEditor";

export default async function KnowledgePage() {
  const data = await getTenant();

  return (
    <KnowledgeEditor
      tenantId={data.tenant.id}
    />
  );
}