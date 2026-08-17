import { DashboardBooking } from "./BookingList";

export default function BookingRow({
  booking,
}: {
  booking: DashboardBooking;
}) {
  return (
    <a
      href={`/booking/${booking.public_token}`}
      className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b px-5 py-4 text-sm transition last:border-b-0 hover:bg-gray-50"
    >
      <div>
        <div className="font-medium">
          {booking.guest_name ?? "Guest"}
        </div>

        {booking.guest_email && (
          <div className="mt-1 text-xs text-gray-500">
            {booking.guest_email}
          </div>
        )}
      </div>

      <div className="font-medium">
        {booking.property?.name ?? "Unknown"}
      </div>

      <div>
        <div>
          {booking.check_in}
        </div>

        <div className="text-xs text-gray-500">
          {booking.nights} nights
        </div>
      </div>

      <div className="font-medium">
        ${booking.total_price}
      </div>

      <div className="capitalize text-gray-600">
        {booking.source ?? "direct"}
      </div>

      <div>
        <StatusBadge status={booking.status} />
      </div>
    </a>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize">
      {status.replaceAll("_", " ")}
    </span>
  );
}