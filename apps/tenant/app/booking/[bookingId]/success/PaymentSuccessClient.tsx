"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";

type BookingStatus =
  | "pending_payment"
  | "payment_processing"
  | "payment_success"
  | "payment_failed"
  | "confirmed"
  | "cancelled";

type Booking = {
  id: string;
  public_token: string;
  status: BookingStatus;
  total_price: number;
  payment_method: string;
};

export default function PaymentSuccessClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const { tenantId } = useSettings()
  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      try {
        const data = await apiClient.api<Booking>(
          `v1/tenants/${tenantId}/bookings/public/${bookingId}`
        );

        if (!cancelled) {
          setBooking(data);
        }
      } catch (error) {
        console.error(
          "Could not load booking:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [tenantId, bookingId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        Checking payment...
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        Booking not found.
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16">
      <div className="w-full rounded-3xl border bg-white p-8 text-center shadow-lg">
        <PaymentStatus status={booking.status} />

        <p className="mt-6 text-sm text-gray-400">
          Booking reference: {booking.public_token}
        </p>

        <a
          href={`/booking/${booking.public_token}`}
          className="mt-8 inline-flex rounded-xl bg-black px-6 py-3 font-medium text-white"
        >
          View booking
        </a>
      </div>
    </main>
  );
}

function PaymentStatus({
  status,
}: {
  status: BookingStatus;
}) {
  if (
    status === "payment_success" ||
    status === "confirmed"
  ) {
    return (
      <>
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />

        <h1 className="mt-6 text-3xl font-semibold">
          Payment successful
        </h1>

        <p className="mt-3 text-gray-500">
          Your payment has been confirmed.
        </p>
      </>
    );
  }

  if (status === "payment_failed") {
    return (
      <>
        <XCircle className="mx-auto h-14 w-14 text-red-600" />

        <h1 className="mt-6 text-3xl font-semibold">
          Payment failed
        </h1>

        <p className="mt-3 text-gray-500">
          Your payment could not be completed.
        </p>
      </>
    );
  }

  return (
    <>
      <Clock3 className="mx-auto h-14 w-14 text-amber-500" />

      <h1 className="mt-6 text-3xl font-semibold">
        Payment processing
      </h1>

      <p className="mt-3 text-gray-500">
        Your payment is still being confirmed.
      </p>
    </>
  );
}