"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { apiClient } from "@/libs/api";
import {
  CancellationPolicy,
  SectionTheme,
  TenantProperty,
} from "@/types";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { getShadow } from "@/helpers";
import PaymentForm from "@/app/booking/[bookingId]/payment/PaymentForm";
import BookingSummary from "../../BookingSummary";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Props = {
  tenantId: string;
  propertyId: string;
  cancellationPolicy: CancellationPolicy;
  theme?: SectionTheme;
};

type BookingResponse = {
  id: string;
  public_token: string;
  status: string;
  total_price: number;
};

type PaymentResponse = {
  booking_id: string;
  public_token: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  payment_id: string;
  client_secret: string;
};

export default function BookingPageClient({
  tenantId,
  propertyId,
  cancellationPolicy,
  theme,
}: Props) {
  const searchParams = useSearchParams();

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const [property, setProperty] =
    useState<TenantProperty | null>(null);

  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] =
    useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] =
    useState("");

  const [publicToken, setPublicToken] =
    useState<string | null>(null);

  const [clientSecret, setClientSecret] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const {
    backgroundColor,
    textColor,
    secondaryColor,
    fontFamily,
    headingFontFamily,
    fontSize,
    cardBackground,
    cardBorderColor,
    cardBorderRadius,
    cardShadow,
    buttonBackground,
    buttonTextColor,
    buttonBorderRadius,
  } = resolveSectionTheme(theme);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();

        if (checkIn) {
          params.set("check_in", checkIn);
        }

        if (checkOut) {
          params.set("check_out", checkOut);
        }

        const query = params.toString();

        const data =
          await apiClient.api<TenantProperty>(
            `v1/tenants/${tenantId}/properties/${propertyId}/public${
              query ? `?${query}` : ""
            }`
          );

        if (!cancelled) {
          setProperty(data);
        }
      } catch (error) {
        console.error(
          "Could not load property:",
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
  }, [
    tenantId,
    propertyId,
    checkIn,
    checkOut,
  ]);

  async function startPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !property ||
      !checkIn ||
      !checkOut ||
      creatingPayment
    ) {
      return;
    }

    setCreatingPayment(true);
    setError(null);

    try {
      // 1. Create booking
      const booking =
        await apiClient.api<BookingResponse>(
          `v1/tenants/${tenantId}/bookings`,
          {
            method: "POST",
            body: JSON.stringify({
              property_id: property.id,
              check_in: checkIn,
              check_out: checkOut,
              guests,
              units: 1,
              guest_name: guestName,
              guest_email: guestEmail,
              guest_phone:
                guestPhone.trim() || null,
              special_requests:
                specialRequests.trim() || null,
              payment_method: "online",
            }),
          }
        );

      setPublicToken(booking.public_token);

      // 2. Create Stripe PaymentIntent
      const payment =
        await apiClient.api<PaymentResponse>(
          `v1/tenants/${tenantId}/payments/booking/${booking.public_token}`,
          {
            method: "POST",
          }
        );

      setClientSecret(payment.client_secret);
    } catch (error) {
      console.error(
        "Could not start booking payment:",
        error
      );

      setError(
        "Could not start payment. Please try again."
      );
    } finally {
      setCreatingPayment(false);
    }
  }

  if (loading) {
    return (
      <div
        className="px-6 py-20"
        style={{
          backgroundColor,
          color: secondaryColor,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className="px-6 py-20"
        style={{
          backgroundColor,
          color: secondaryColor,
        }}
      >
        Property not found.
      </div>
    );
  }

  if (!checkIn || !checkOut) {
    return (
      <div
        className="px-6 py-20"
        style={{
          backgroundColor,
          color: secondaryColor,
        }}
      >
        Missing booking dates.
      </div>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontSize,
      }}
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_380px]">
        {/* Guest / payment */}
        <div>
          <h1
            className="text-3xl font-semibold"
            style={{
              fontFamily: headingFontFamily,
            }}
          >
            {property.name}
          </h1>

          {!clientSecret ? (
            <form
              onSubmit={startPayment}
              className="mt-8 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full name
                </label>

                <input
                  required
                  value={guestName}
                  onChange={(event) =>
                    setGuestName(event.target.value)
                  }
                  className="w-full border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: cardBackground,
                    color: textColor,
                    borderColor: cardBorderColor,
                    borderRadius: buttonBorderRadius,
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  required
                  type="email"
                  value={guestEmail}
                  onChange={(event) =>
                    setGuestEmail(event.target.value)
                  }
                  className="w-full border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: cardBackground,
                    color: textColor,
                    borderColor: cardBorderColor,
                    borderRadius: buttonBorderRadius,
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>

                <input
                  value={guestPhone}
                  onChange={(event) =>
                    setGuestPhone(event.target.value)
                  }
                  className="w-full border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: cardBackground,
                    color: textColor,
                    borderColor: cardBorderColor,
                    borderRadius: buttonBorderRadius,
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Guests
                </label>

                <input
                  required
                  type="number"
                  min={1}
                  max={property.max_guests}
                  value={guests}
                  onChange={(event) =>
                    setGuests(
                      Number(event.target.value)
                    )
                  }
                  className="w-full border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: cardBackground,
                    color: textColor,
                    borderColor: cardBorderColor,
                    borderRadius: buttonBorderRadius,
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Special requests
                </label>

                <textarea
                  value={specialRequests}
                  onChange={(event) =>
                    setSpecialRequests(
                      event.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: cardBackground,
                    color: textColor,
                    borderColor: cardBorderColor,
                    borderRadius: buttonBorderRadius,
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={creatingPayment}
                className="w-full px-5 py-4 font-medium disabled:opacity-50"
                style={{
                  backgroundColor:
                    buttonBackground,
                  color: buttonTextColor,
                  borderRadius:
                    buttonBorderRadius,
                }}
              >
                {creatingPayment
                  ? "Preparing payment..."
                  : `Pay $${property.total_price}`}
              </button>
            </form>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
              }}
            >
              <PaymentForm
                returnUrl={`${window.location.origin}/booking/${publicToken}/payment/success`}
              />
            </Elements>
          )}
        </div>

        <aside>
          <BookingSummary
            property={property}
            checkIn={checkIn}
            checkOut={checkOut}
            cancellationPolicy={cancellationPolicy}
            textColor={textColor}
            secondaryColor={secondaryColor}
            headingFontFamily={headingFontFamily}
            cardBackground={cardBackground}
            cardBorderColor={cardBorderColor}
            cardBorderRadius={cardBorderRadius}
            cardShadow={cardShadow}
          />
        </aside>
      </div>
    </main>
  );
}