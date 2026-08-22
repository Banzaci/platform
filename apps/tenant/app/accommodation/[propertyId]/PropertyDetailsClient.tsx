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
  PublicPropertyResponse,
  PublicTenantPropertyResponse,
  SectionTheme,
  TenantProperty,
} from "@/types";
import PropertySlideshow from "@/app/(protected)/components/property/PropertySlideshow";
import { getShadow } from "@/helpers";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import BookingSummary from "../BookingSummary";
import DevLabel from "@/helpers/DevLabel";

export type PropertyDetailsClientProps = {
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
}: PropertyDetailsClientProps) {
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

        const data = await apiClient.api<PublicTenantPropertyResponse>(
            `v1/tenants/${tenantId}/properties/${propertyId}/public${
              query ? `?${query}` : ""
            }`
          );

        setProperty(data.property);
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
    fontFamily,
    textColor,
    backgroundColor,
    secondaryColor,
    card_background_color,
    card_text_color,
    card_border_color,
    card_radius,
    card_shadow,
    card_padding,
    button_background,
    button_text,
    button_radius,
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
  const bookingUrl = `/accommodation/${property.id}/book` + (query ? `?${query}` : "");
  const canBook = !!checkIn && !!checkOut && property.is_available;
  return (
    <main
      className="relative min-h-screen w-full"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily,
      }}
    >
      <DevLabel
        name="PropertyDetailsClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/[propertyId]/PropertyDetailsClient.tsx"
      />
      <div className="mx-auto max-w-6xl p-10">
        {/* COLUMN 1: Image + property information */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px] ">
          <div
            className="min-w-0 overflow-hidden"
            style={{
              backgroundColor: card_background_color,
              color: card_text_color,
              borderColor: card_border_color,
              borderRadius: card_radius,
              boxShadow: getShadow(card_shadow),
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
                  padding: card_padding,
                }}
              >
              <h1
                className="text-4xl font-semibold tracking-tight">
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
                    borderColor: card_border_color,
                  }}
                >
                  <h2 className="text-2xl font-semibold">
                    Amenities
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="border px-4 py-3"
                        style={{
                          color: secondaryColor,
                        }}
                      >
                        {amenity}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
          <aside>
          {checkIn && checkOut && <BookingSummary
            nights={property.nights}
            total_price={property.total_price}
            checkIn={checkIn}
            checkOut={checkOut}
            cancellationPolicy={cancellationPolicy}
            textColor={textColor}
            secondaryColor={secondaryColor}
            cardBackground={card_background_color}
            cardBorderColor={card_border_color}
            cardBorderRadius={card_radius}
            cardShadow={card_shadow}
          />}
          <div className="mt-6">
            {canBook ? (
              <a
                href={bookingUrl}
                className="flex w-full justify-center px-5 py-4 font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: button_background,
                  color: button_text,
                  borderRadius: button_radius,
                }}
              >
                Pay now
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed px-5 py-4 font-medium opacity-40"
                style={{
                  backgroundColor: button_background,
                  color: button_text,
                  borderRadius: button_radius,
                }}
              >
                Pay now
              </button>
            )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}