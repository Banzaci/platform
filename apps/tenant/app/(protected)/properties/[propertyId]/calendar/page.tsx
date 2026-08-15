// app/(protected)/properties/[propertyId]/calendar/page.tsx

import { getTenant } from "@/libs/tenant";
import PropertyCalendar from "./PropertyCalendar";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const data = await getTenant();

  return (
    <PropertyCalendar
      tenantId={data.tenant.id}
      propertyId={propertyId}
    />
  );
}