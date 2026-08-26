// app/(protected)/properties/[propertyId]/calendar/page.tsx
import PropertyCalendar from "./PropertyCalendar";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  return <PropertyCalendar propertyId={propertyId} />
}