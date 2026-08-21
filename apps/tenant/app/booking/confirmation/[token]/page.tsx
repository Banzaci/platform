import { getTenant } from "@/libs/tenant";
import BookingConfirmation from "./BookingConfirmation";

export default async function Page({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;
  const tenant = await getTenant()
  return (
    <BookingConfirmation
      token={token}
      tenantId={tenant.tenant.id}
    />
  );
}