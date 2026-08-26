"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bath,
  BedDouble,
  User,
  Users,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import {
  CancellationPolicy,
  GlobalTheme,
  PublicTenantPropertyResponse,
  SectionTheme,
  TenantProperty,
} from "@/types";
import PropertySlideshow from "@/app/(protected)/components/property/PropertySlideshow";
import { getShadow } from "@/helpers";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import BookingSummary from "../BookingSummary";
import DevLabel from "@/helpers/DevLabel";
import { EmptyState, PageLoader } from "@hotel/ui";
import { SectionType } from "@/app/(protected)/types/section";
import { useSettings } from "@/providers/SettingsProvider";

export type PropertyDetailsClientProps = {
  propertyId: string;
  cancellationPolicy: CancellationPolicy;
  section?: SectionType;
};

export default function PropertyDetailsClient({
  propertyId,
  cancellationPolicy,
  section,
}: PropertyDetailsClientProps) {
  const { tenantId, globalTheme } = useSettings();
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
    card_background_color,
    card_text_color,
    card_border_color,
    card_radius,
    card_shadow,
    card_padding,
    card_secondary_color,
    button_background,
    button_text_color,
    button_radius,
  } = resolveSectionTheme(globalTheme);
  if (loading) {
    return <PageLoader />
  }

  if (!property) {
    return <EmptyState title="No property found"/>
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
    <main className="relative min-h-screen w-full" style={{
        backgroundColor: card_background_color,
        color: card_text_color,
      }}
    >
      <DevLabel
        name="PropertyDetailsClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/[propertyId]/PropertyDetailsClient.tsx"
      />
      <div className="mx-auto max-w-6xl p-10">
        <div className="mb-2">
          {section?.content.heading && <h2>{section?.content.heading.en}</h2>}
          {section?.content.text && <p className="text-sm">{section?.content.text.en}</p>}
        </div>
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
            <div style={{ padding: card_padding }} className="p-4">
              <h2 className="text-lg font-semibold">
                {property.name}
              </h2>
              {property.description && (
                <p
                  className="mt-1.5 line-clamp-2 text-sm leading-5"
                  style={{
                    color: card_secondary_color,
                  }}
                >
                  {property.description}
                </p>
              )}
              <div className="my-8 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
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
              {property.amenities?.length > 0 && (
                <section className="mt-8">
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border py-2 px-4 text-xs"
                        style={{ borderColor: card_border_color, color: card_secondary_color }}
                      >
                        {amenity}
                      </span>
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
            textColor={card_text_color}
            secondaryColor={card_secondary_color}
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
                  color: button_text_color,
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
                  color: button_text_color,
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