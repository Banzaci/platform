"use client";

"use client";

import { useEffect, useState } from "react";

import {
  Elements,
} from "@stripe/react-stripe-js";

import {
  loadStripe,
} from "@stripe/stripe-js";

import { apiClient } from "@/libs/api";
import PaymentForm from "./PaymentForm";
import { useSettings } from "@/providers/SettingsProvider";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Booking = {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  units: number;
  total_price: number;
  status: string;
  payment_method: string;
  guest_name: string | null;
  guest_email: string | null;
};

export default function PaymentPageClient({
  bookingId,
}: {
  bookingId: string;
}) {
  const { tenantId } = useSettings()
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

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

  async function handlePayment() {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const result = await apiClient.api<{
        booking_id: string;
        public_token: string;
        amount: number;
        currency: string;
        status: string;
        provider: string;
        payment_id: string;
        client_secret: string;
      }>(
        `v1/tenants/${tenantId}/payments/booking/${bookingId}`,
        {
          method: "POST",
        }
      );

      setClientSecret(result.client_secret);
    } catch (error) {
      console.error(
        "Could not create payment:",
        error
      );

      setPaymentError(
        "Could not start payment."
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        Loading booking...
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        Booking not found.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">
          Complete your payment
        </h1>

        <div className="mt-8 space-y-4">
          <Row
            label="Check in"
            value={booking.check_in}
          />

          <Row
            label="Check out"
            value={booking.check_out}
          />

          <Row
            label="Guests"
            value={String(booking.guests)}
          />

          <Row
            label="Units"
            value={String(booking.units)}
          />

          <div className="border-t pt-4">
            <Row
              label="Total"
              value={`$${booking.total_price}`}
              strong
            />
          </div>
        </div>
        {!clientSecret && (
          <>
            <button
              type="button"
              onClick={handlePayment}
              disabled={paymentLoading}
              className="mt-8 w-full rounded-xl bg-black px-5 py-4 font-medium text-white disabled:opacity-50"
            >
              {paymentLoading
                ? "Starting payment..."
                : "Continue to payment"}
            </button>

            {paymentError && (
              <p className="mt-3 text-center text-sm text-red-600">
                {paymentError}
              </p>
            )}
          </>
        )}
        {clientSecret && (
          <div className="mt-8">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  variables: {
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <PaymentForm
                returnUrl={`${window.location.origin}/booking/${bookingId}/payment/success`}
              />
            </Elements>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-6">
      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={
          strong
            ? "font-semibold"
            : "font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}