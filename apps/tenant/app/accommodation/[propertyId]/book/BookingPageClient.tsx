"use client";

import { FormEvent, useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/libs/api";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  CancellationPolicy,
  GlobalTheme,
  Property,
  PublicPaymentSettings,
  PublicPropertyResponse,
  SectionTheme,
} from "@/types";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import { getShadow } from "@/helpers";
import PaymentForm from "@/app/booking/[bookingId]/payment/PaymentForm";
import BookingSummary from "../../BookingSummary";
import DevLabel from "@/helpers/DevLabel";
import { EmptyState, PageLoader } from "@hotel/ui";
import { useSettings } from "@/providers/SettingsProvider";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Props = {
  propertyId: string;
  cancellationPolicy: CancellationPolicy;
};

type BookingResponse = {
  id: string;
  public_token: string;
  booking_ref: string;
  status: string;
  check_in: string;
  check_out: string;
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
  propertyId,
  cancellationPolicy,
}: Props) {
  const router = useRouter();
  const { tenantId, globalTheme } = useSettings();
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PublicPaymentSettings | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    card_background_color,
    card_secondary_color,
    card_text_color,
    card_border_color,
    card_radius,
    card_shadow,
    card_padding,
    button_background,
    button_text_color,
    button_radius,
  } = resolveSectionTheme(globalTheme);

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
        const data = await apiClient.api<PublicPropertyResponse>(
            `v1/tenants/${tenantId}/properties/${propertyId}/public${
              query ? `?${query}` : ""
            }`
          );
        if (!cancelled) {
          setProperty(data.property);
          setPaymentMethods(data.payment_settings)
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

  async function startPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property || !checkIn || !checkOut || creatingPayment) {
      return;
    }

    setCreatingPayment(true);
    setError(null);

    try {
        switch (paymentMethod) {
          case "online": {
            const booking = await apiClient.api<BookingResponse>(
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

            setPublicToken(
              booking.public_token
            );

            const payment =
              await apiClient.api<PaymentResponse>(
                `v1/tenants/${tenantId}/payments/booking/${booking.public_token}`,
                {
                  method: "POST",
                }
              );

            setClientSecret(
              payment.client_secret
            );

            break;
          }
          case "pay_on_property": {
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
                    payment_method:
                      "pay_on_property",
                  }),
                }
              );

            setPublicToken(
              booking.public_token
            );
            router.push(`/booking/confirmation/${booking.public_token}`);
            break;
          }

          case "pay_withbank_transfer": {
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
                    payment_method:
                      "pay_withbank_transfer",
                  }),
                }
              );

            setPublicToken(
              booking.public_token
            );
            router.push(`/booking/confirmation/${booking.public_token}`);
            break;
          }

          default:
            throw new Error(
              "Invalid payment method"
            );
        }
      } catch (error) {
        console.error(
          "Could not create booking:",
          error
        );

        setError(
          "Could not complete booking. Please try again."
        );
      } finally {
        setCreatingPayment(false);
      }
    }

  if (loading) {
    return <PageLoader />
  }
  if (!property) {
    return <EmptyState title="No page" />
  }
  if (!paymentMethods) {
    return <EmptyState title="No page" />
  }
  if (!checkIn || !checkOut) {
    return <EmptyState title="Missing booking dates." />
  }
  return (
    <main className="relative min-h-screen sm:px-6 p-4 lg:py-10">
      <DevLabel
        name="BookingPageClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/[propertyId]/book/BookingPageClient.tsx"
      />
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-60"
          style={{ color: card_secondary_color }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-2">
          <p
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: card_secondary_color }}
          >
            Complete your booking
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {property.name}
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: card_secondary_color }}
          >
            Enter your details below to secure your stay.
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section
            className="overflow-hidden p-8"
            style={{
              backgroundColor: card_background_color,
              color: card_text_color,
              border: card_radius
                ? `1px solid ${card_radius}`
                : "none",
              borderRadius: card_radius,
              boxShadow: getShadow(card_shadow),
            }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Guest details
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: card_secondary_color }}
              >
                Please enter the information for the primary guest.
              </p>
            </div>

            <div style={{ padding: card_padding }}>
              {!clientSecret ? (
                <form onSubmit={startPayment} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Full name
                      </label>
                      <input
                        required
                        value={guestName}
                        onChange={(event) =>
                          setGuestName(event.target.value)
                        }
                        placeholder="Your full name"
                        className="w-full border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-black/10"
                        style={{
                          backgroundColor: card_background_color,
                          borderColor: card_border_color,
                          borderRadius: card_radius,
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
                        placeholder="you@example.com"
                        className="w-full border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-black/10"
                        style={{
                          backgroundColor: card_background_color,
                          borderColor: card_border_color,
                          borderRadius: card_radius,
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
                        placeholder="+46..."
                        className="w-full border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-black/10"
                        style={{
                          backgroundColor: card_background_color,
                          borderColor: card_border_color,
                          borderRadius: card_radius,
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
                        className="w-full border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-black/10"
                        style={{
                          backgroundColor: card_background_color,
                          borderColor: card_border_color,
                          borderRadius: card_radius,
                        }}
                      />
                    </div>
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
                      placeholder="Optional"
                      className="w-full resize-none border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-black/10"
                      style={{
                        backgroundColor: card_background_color,
                        borderColor: card_border_color,
                        borderRadius: card_radius,
                      }}
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <div
                    className="border-t pt-5"
                    style={{
                      borderColor: card_border_color,
                    }}
                  >
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold">
                        Payment method
                      </h3>

                      <div className="mt-3 space-y-2">
                        {paymentMethods.online && (
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                            <input
                              type="radio"
                              name="payment_method"
                              value="online"
                              checked={paymentMethod === "online"}
                              onChange={() =>
                                setPaymentMethod("online")
                              }
                            />

                            <span className="text-sm">
                              Online payment
                            </span>
                          </label>
                        )}

                        {paymentMethods.pay_on_property && (
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                            <input
                              type="radio"
                              name="payment_method"
                              value="pay_on_property"
                              checked={
                                paymentMethod ===
                                "pay_on_property"
                              }
                              onChange={() =>
                                setPaymentMethod(
                                  "pay_on_property"
                                )
                              }
                            />

                            <span className="text-sm">
                              Pay at property
                            </span>
                          </label>
                        )}

                        {paymentMethods.pay_withbank_transfer && (
                          <div className="rounded-lg border">
                            <label className="flex cursor-pointer items-center gap-3 p-3">
                              <input
                                type="radio"
                                name="payment_method"
                                value="pay_withbank_transfer"
                                checked={
                                  paymentMethod ===
                                  "pay_withbank_transfer"
                                }
                                onChange={() => {
                                  setPaymentMethod(
                                    "pay_withbank_transfer"
                                  );
                                  setShowBankDetails(true);
                                }}
                              />

                              <span className="flex-1 text-sm">
                                Bank transfer
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  setShowBankDetails(
                                    (current) => !current
                                  )
                                }
                                className="text-xs underline"
                              >
                                {showBankDetails
                                  ? "Hide details"
                                  : "Bank details"}
                              </button>
                            </label>

                            {showBankDetails && (
                              <div
                                className="border-t px-4 py-4 text-sm"
                                style={{
                                  borderColor:
                                    card_border_color,
                                  color:
                                    card_secondary_color,
                                }}
                              >
                                <div className="space-y-2">
                                  {paymentMethods.bank_name && (
                                    <div>
                                      <strong>Bank:</strong>{" "}
                                      {paymentMethods.bank_name}
                                    </div>
                                  )}

                                  {paymentMethods.account_name && (
                                    <div>
                                      <strong>
                                        Account name:
                                      </strong>{" "}
                                      {
                                        paymentMethods.account_name
                                      }
                                    </div>
                                  )}

                                  {paymentMethods.account_number && (
                                    <div>
                                      <strong>
                                        Account number:
                                      </strong>{" "}
                                      {
                                        paymentMethods.account_number
                                      }
                                    </div>
                                  )}

                                  {paymentMethods.iban && (
                                    <div>
                                      <strong>IBAN:</strong>{" "}
                                      {paymentMethods.iban}
                                    </div>
                                  )}

                                  {paymentMethods.swift && (
                                    <div>
                                      <strong>
                                        SWIFT / BIC:
                                      </strong>{" "}
                                      {paymentMethods.swift}
                                    </div>
                                  )}

                                  {paymentMethods.bank_instructions && (
                                    <div className="mt-3">
                                      {
                                        paymentMethods.bank_instructions
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={
                        creatingPayment ||
                        !paymentMethod
                      }
                      className="w-full px-5 py-3.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                      style={{
                        backgroundColor: button_background,
                        color: button_text_color,
                        borderRadius: button_radius,
                      }}
                    >
                      {creatingPayment
                        ? "Preparing..."
                        : paymentMethod === "online"
                          ? `Pay $${property.total_price}`
                          : "Complete booking"}
                    </button>

                    {paymentMethod === "online" && (
                      <p
                        className="mt-3 text-center text-xs"
                        style={{
                          color: card_secondary_color,
                        }}
                      >
                        You will be redirected to secure payment.
                      </p>
                    )}

                    {paymentMethod === "pay_on_property" && (
                      <p
                        className="mt-3 text-center text-xs"
                        style={{
                          color: card_secondary_color,
                        }}
                      >
                        No payment is required now.
                      </p>
                    )}

                    {paymentMethod ===
                      "pay_withbank_transfer" && (
                      <p
                        className="mt-3 text-center text-xs"
                        style={{
                          color: card_secondary_color,
                        }}
                      >
                        Complete your booking and pay by bank
                        transfer.
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                  }}
                >
                  <PaymentForm returnUrl={`${window.location.origin}/booking/${publicToken}/payment/success`} />
                </Elements>
              )}
            </div>
          </section>

          {/* Booking summary */}
          <aside className="lg:sticky lg:top-6">
            <BookingSummary
              nights={property.nights}
              total_price={property.total_price}
              checkIn={checkIn}
              checkOut={checkOut}
              cancellationPolicy={cancellationPolicy}
              textColor={card_text_color}
              secondaryColor={card_secondary_color}
              cardBackground={card_background_color}
              cardBorderColor={card_border_color}
              cardBorderRadius={card_radius}
              cardShadow={card_shadow}
            />
          </aside>
        </div>
      </div>
  </main>
);
}