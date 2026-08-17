"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Users,
  XCircle,
} from "lucide-react";

import { apiClient } from "@/libs/api";

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
  property: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  check_in: string;
  check_out: string;
  guests: number;
  units: number;
  total_price: number;
  status: BookingStatus;
  payment_method: string;
  refund_status: string | null;
  refund_amount: number | null;
};

export default function BookingDetailsClient({
  tenantId,
  bookingId,
}: {
  tenantId: string;
  bookingId: string;
}) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function cancelBooking() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancelling(true);
    setCancelError(null);

    try {
      const result = await apiClient.api<{
        id: string;
        public_token: string;
        status: BookingStatus;
        refund: {
          percent: number;
          amount: number;
          provider_refund_id: string | null;
          provider_status: string | null;
        };
      }>(
        `v1/tenants/${tenantId}/bookings/public/${bookingId}/cancel`,
        {
          method: "POST",
        }
      );

      setBooking((current) =>
        current
          ? {
              ...current,
              status: result.status,
              refund_amount: result.refund.amount,
              refund_status:
                result.refund.provider_status,
            }
          : current
      );
    } catch (error) {
      console.error(
        "Could not cancel booking:",
        error
      );

      setCancelError(
        "Could not cancel booking."
      );
    } finally {
      setCancelling(false);
    }
  }

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
      <main className="mx-auto max-w-2xl px-6 py-20">
        Loading booking...
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        Booking not found.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl border bg-white shadow-lg">
        <div className="border-b px-8 py-7">
          <div className="flex items-start justify-between gap-6">
            {booking.property && (
              <div className="border-b">
                {booking.property.image && (
                  <img
                    src={booking.property.image}
                    alt={booking.property.name}
                    className="h-64 w-full object-cover"
                  />
                )}

                <div className="px-8 py-6">
                  <p className="text-sm text-gray-400">
                    Accommodation
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {booking.property.name}
                  </h2>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">
                Booking reference
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                {booking.public_token}
              </h1>
            </div>

            <BookingStatusBadge
              status={booking.status}
            />
          </div>
        </div>

        <div className="space-y-6 px-8 py-7">
          <DetailRow
            icon={CalendarDays}
            label="Check in"
            value={booking.check_in}
          />

          <DetailRow
            icon={CalendarDays}
            label="Check out"
            value={booking.check_out}
          />

          <DetailRow
            icon={Users}
            label="Guests"
            value={String(booking.guests)}
          />

          <DetailRow
            icon={Users}
            label="Units"
            value={String(booking.units)}
          />

          <DetailRow
            icon={CreditCard}
            label="Payment method"
            value={booking.payment_method}
          />
        </div>

        <div className="border-t bg-gray-50 px-8 py-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Total
            </span>

            <span className="text-2xl font-semibold">
              ${booking.total_price}
            </span>
          </div>
          {booking.status === "pending_payment" && (
            <a
              href={`/booking/${booking.public_token}/payment`}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-black px-5 py-3.5 font-medium text-white"
            >
              Continue payment
            </a>
          )}
          {booking.status === "pending_payment" && (
            <button
              type="button"
              onClick={cancelBooking}
              disabled={cancelling}
              className="mt-3 w-full rounded-xl border border-red-200 px-5 py-3.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel booking"}
            </button>
          )}
          {cancelError && (
            <p className="mt-3 text-center text-sm text-red-600">
              {cancelError}
            </p>
          )}
        </div>
        {booking.status === "cancelled" && (
            <div className="mt-5 rounded-xl border bg-white p-4">
              <div className="font-medium">
                Booking cancelled
              </div>

              {booking.refund_amount &&
              booking.refund_amount > 0 ? (
                <>
                  <div className="mt-2 text-sm text-gray-500">
                    Refund amount
                  </div>

                  <div className="mt-1 text-xl font-semibold">
                    ${booking.refund_amount}
                  </div>

                  {booking.refund_status && (
                    <div className="mt-2 text-sm text-gray-500">
                      Refund status:{" "}
                      <span className="font-medium text-gray-900">
                        {booking.refund_status}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No refund is due for this booking.
                </p>
              )}
            </div>
          )}
      </div>
    </main>
  );
}

function BookingStatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  if (
    status === "payment_success" ||
    status === "confirmed"
  ) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        Confirmed
      </div>
    );
  }

  if (status === "payment_failed") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
        <XCircle className="h-4 w-4" />
        Payment failed
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
      <Clock3 className="h-4 w-4" />
      Pending
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>

      <div>
        <div className="text-sm text-gray-400">
          {label}
        </div>

        <div className="font-medium">
          {value}
        </div>
      </div>
    </div>
  );
}