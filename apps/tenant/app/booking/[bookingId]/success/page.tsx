import { getTenant } from "@/libs/tenant";
import PaymentSuccessClient from "./PaymentSuccessClient";

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const data = await getTenant();

  return (
    <PaymentSuccessClient
      tenantId={data.tenant.id}
      bookingId={bookingId}
    />
  );
}