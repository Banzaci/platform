"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bath,
  BedDouble,
  Users,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import {
  CancellationPolicy,
  SectionTheme,
  TenantProperty,
} from "@/types";
import PropertySlideshow from "@/app/(protected)/components/property/PropertySlideshow";
import { getShadow } from "@/helpers";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import BookingSummary from "../BookingSummary";

type Props = {
  tenantId: string;
  propertyId: string;
  cancellationPolicy: CancellationPolicy;
  theme?: SectionTheme;
};

export default function PropertyDetailsClient({
  tenantId,
  propertyId,
  cancellationPolicy,
  theme,
}: Props) {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const [property, setProperty] = useState<TenantProperty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        setProperty(data);
      } catch (error) {
        console.error(
          "Could not load property:",
          error
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [tenantId, propertyId, checkIn, checkOut]);
  const {
    backgroundColor,
    textColor,
    secondaryColor,
    fontFamily,
    headingFontFamily,
    fontSize,
    cardBackground,
    cardBorderColor,
    cardPadding,
    cardBorderRadius,
    cardShadow,
    buttonBackground,
    buttonTextColor,
    buttonBorderRadius,
  } = resolveSectionTheme(theme);
  if (loading) {
    return (
      <div
        className="mx-auto max-w-7xl px-6 py-20"
        style={{
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
        className="mx-auto max-w-7xl px-6 py-20"
        style={{
          color: secondaryColor,
        }}
      >
        Property not found.
      </div>
    );
  }

  const params = new URLSearchParams();

  if (checkIn) {
    params.set("checkIn", checkIn);
  }

  if (checkOut) {
    params.set("checkOut", checkOut);
  }
  const query = params.toString();
  const bookingUrl =
  `/accomondation/${property.id}/book` +
  (query ? `?${query}` : "");
  const canBook = !!checkIn && !!checkOut && property.is_available;
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-6xl"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontSize,
      }}
    >
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* COLUMN 1: Image + property information */}
        <div
          className="min-w-0 overflow-hidden"
          style={{
            backgroundColor: cardBackground,
            color: textColor,
            borderColor: cardBorderColor,
            borderRadius: cardBorderRadius,
            boxShadow: getShadow(cardShadow),
          }}
        >
          <div className="w-full max-w-200 overflow-hidden">
            <PropertySlideshow
              images={property.images ?? []}
              alt={property.name}
            />
          </div>

          <div className="mt-10"
          style={{
          padding: cardPadding,
        }}
          >
            <h1
              className="text-4xl font-semibold tracking-tight"
              style={{
                color: textColor,
                fontFamily: headingFontFamily,
              }}
            >
              {property.name}
            </h1>

            <div
              className="mt-5 flex flex-wrap gap-6 text-sm"
              style={{
                color: secondaryColor,
              }}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {property.max_guests} guests
              </span>

              <span className="flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                {property.beds} beds
              </span>

              <span className="flex items-center gap-2">
                <Bath className="h-4 w-4" />
                {property.bathrooms} bathrooms
              </span>
            </div>

            {property.description && (
              <p
                className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8"
                style={{
                  color: secondaryColor,
                }}
              >
                {property.description}
              </p>
            )}

            {property.amenities?.length > 0 && (
              <section
                className="mt-10 border-t pt-8"
                style={{
                  borderColor: cardBorderColor,
                }}
              >
                <h2
                  className="text-2xl font-semibold"
                  style={{
                    color: textColor,
                    fontFamily: headingFontFamily,
                  }}
                >
                  Amenities
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="border px-4 py-3"
                      style={{
                        backgroundColor: cardBackground,
                        color: secondaryColor,
                        borderColor: cardBorderColor,
                        borderRadius: cardBorderRadius,
                      }}
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cancellation policy */}
            <div
              className="mt-10 border p-5"
              style={{
                backgroundColor: cardBackground,
                color: textColor,
                borderColor: cardBorderColor,
                borderRadius: cardBorderRadius,
                boxShadow: getShadow(cardShadow),
              }}
            >
              <h3
                className="font-semibold"
                style={{
                  fontFamily: headingFontFamily,
                }}
              >
                Cancellation policy
              </h3>

              <div
                className="mt-3 space-y-2 text-sm"
                style={{
                  color: secondaryColor,
                }}
              >
                <p>
                  Free cancellation up to{" "}
                  {cancellationPolicy.free_cancellation_days} days
                  before check-in.
                </p>

                <p>
                  {cancellationPolicy.partial_refund_percent}% refund
                  when cancelling at least{" "}
                  {cancellationPolicy.partial_refund_hours} hours
                  before check-in.
                </p>

                <p>
                  No refund for cancellations made less than{" "}
                  {cancellationPolicy.partial_refund_hours} hours
                  before check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
       <aside>
        {checkIn && checkOut && <BookingSummary
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
        />}
        <div className="mt-6">
          {canBook ? (
            <a
              href={bookingUrl}
              className="flex w-full justify-center px-5 py-4 font-medium transition hover:opacity-90"
              style={{
                backgroundColor: buttonBackground,
                color: buttonTextColor,
                borderRadius: buttonBorderRadius,
              }}
            >
              Book now
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed px-5 py-4 font-medium opacity-40"
              style={{
                backgroundColor: buttonBackground,
                color: buttonTextColor,
                borderRadius: buttonBorderRadius,
              }}
            >
              Book now
            </button>
          )}
          </div>
        </aside>
      </div>
    </main>
  );
}