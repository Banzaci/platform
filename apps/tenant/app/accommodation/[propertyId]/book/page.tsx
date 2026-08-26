import { getTenant } from "@/libs/tenant";
import BookingPageClient from "./BookingPageClient";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const tenant = await getTenant();
  return (
    <BookingPageClient
      propertyId={propertyId}
      cancellationPolicy={tenant.tenant.cancellation_policy}
    />
  );
}