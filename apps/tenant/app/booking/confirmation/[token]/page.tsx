import BookingConfirmation from "./BookingConfirmation";

export default async function Page({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;
  return (
    <BookingConfirmation token={token} />
  );
}