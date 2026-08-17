import { getTenant } from "@/libs/tenant";
import BookingDetailsClient from "./BookingDetailsClient";


export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const data = await getTenant();

  return (
    <BookingDetailsClient
      tenantId={data.tenant.id}
      bookingId={bookingId}
    />
  );
}