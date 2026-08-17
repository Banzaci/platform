import { getTenant } from "@/libs/tenant";
import PropertyDetailsClient from "./PropertyDetailsClient";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const data = await getTenant();

  const pageConfig = data.pages.find(
    (page) => page.slug === "accomondation"
  );

  const propertyGridSection = pageConfig?.sections?.find(
    (section) => section.type === "property-grid"
  );

  const theme = {
    ...data.tenant.theme,
    ...(propertyGridSection?.theme ?? {}),
  };

  return (
    <PropertyDetailsClient
      tenantId={data.tenant.id}
      propertyId={propertyId}
      cancellationPolicy={data.tenant.cancellation_policy}
      theme={theme}
    />
  );
}