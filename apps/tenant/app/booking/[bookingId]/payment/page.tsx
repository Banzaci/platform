import { getTenant } from "@/libs/tenant";
import PaymentPageClient from "./PaymentPageClient";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const data = await getTenant();

  return (
    <PaymentPageClient
      tenantId={data.tenant.id}
      bookingId={bookingId}
    />
  );
}