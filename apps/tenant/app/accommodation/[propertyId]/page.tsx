import { getTenant } from "@/libs/tenant";
import EditPropertyDetailsClient from "./EditPropertyDetailsClient";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const data = await getTenant();

  const pageConfig = data.pages.find(
    (page) => page.slug === "accommodation"
  );

  if(!pageConfig) return null

  return (
    <EditPropertyDetailsClient
      tenantId={data.tenant.id}
      propertyId={propertyId}
      cancellationPolicy={data.tenant.cancellation_policy}
      globalTheme={{}}
      pageId={pageConfig.id}
      sections={pageConfig.sections}
    />
  );
}