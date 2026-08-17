"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/libs/api";
import BookingRow from "./BookingRow";

export type DashboardBooking = {
  id: string;
  public_token: string;

  guest_name: string | null;
  guest_email: string | null;

  property: {
    id: string;
    name: string;
  } | null;

  check_in: string;
  check_out: string;

  nights: number;
  guests: number;
  units: number;

  total_price: number;

  status: string;
  payment_method: string | null;

  source: string | null;

  created_at: string;
};

export default function BookingList({
  tenantId,
}: {
  tenantId: string;
}) {
  const [bookings, setBookings] = useState<
    DashboardBooking[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data =
          await apiClient.api<
            DashboardBooking[]
          >(
            `v1/tenants/${tenantId}/bookings`
          );

        if (!cancelled) {
          setBookings(data);
        }
      } catch (error) {
        console.error(
          "Could not load bookings:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading bookings...
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <h2 className="text-xl font-semibold">
          No bookings yet
        </h2>

        <p className="mt-2 text-gray-500">
          New bookings will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="grid grid-cols-[1.4fr_1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        <div>Guest</div>
        <div>Property</div>
        <div>Stay</div>
        <div>Total</div>
        <div>Source</div>
        <div>Status</div>
      </div>

      {bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
        />
      ))}
    </div>
  );
}