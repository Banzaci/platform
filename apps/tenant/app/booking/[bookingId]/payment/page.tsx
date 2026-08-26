import PaymentPageClient from "./PaymentPageClient";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <PaymentPageClient bookingId={bookingId} />
  );
}