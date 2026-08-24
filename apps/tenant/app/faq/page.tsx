import { getTenant } from "@/libs/tenant";
import FAQChatClient from "./FAQChatClient";

export default async function FAQPage() {
  const data = await getTenant();
  return (
    <FAQChatClient
      tenantId={data.tenant.id}
      tenantName={data.tenant.name}
    />
  );
}