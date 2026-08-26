import BookingDetailsClient from "./BookingDetailsClient";


export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <BookingDetailsClient bookingId={bookingId}/>
  );
}