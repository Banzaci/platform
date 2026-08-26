import PaymentSuccessClient from "./PaymentSuccessClient";

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <PaymentSuccessClient bookingId={bookingId} />
  );
}