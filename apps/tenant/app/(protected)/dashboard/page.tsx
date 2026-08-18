import { getTenant } from "@/libs/tenant";
// import BookingList from "./components/BookingList";

export default async function DashboardPage() {
  const data = await getTenant();

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Manage bookings and upcoming stays.
        </p>
      </div>

      {/* <BookingList tenantId={data.tenant.id} /> */}
    </main>
  );
}