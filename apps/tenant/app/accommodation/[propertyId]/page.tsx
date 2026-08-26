import { getTenant } from "@/libs/tenant";
import EditPropertyDetailsClient from "./EditPropertyDetailsClient";
import { notFound } from "next/navigation";

export default async function PropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const tenant = await getTenant();
  const page = tenant.pages.find(
    (page) => page.slug === "accommodation"
  );
  if (!page) {
    notFound();
  }
  return (
    <EditPropertyDetailsClient
      tenantId={tenant.tenant.id}
      fonts={tenant.fonts}
      propertyId={propertyId}
      cancellationPolicy={tenant.tenant.cancellation_policy}
      globalTheme={tenant.tenant.theme}
      pageId={page.id}
      sections={page.sections}
    />
  );
}