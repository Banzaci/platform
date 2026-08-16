import { getTenant } from "@/libs/tenant";
import PropertyDetailsClient from "./PropertyDetailsClient";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const data = await getTenant();

  return (
    <PropertyDetailsClient
      tenantId={data.tenant.id}
      propertyId={propertyId}
    />
  );
}