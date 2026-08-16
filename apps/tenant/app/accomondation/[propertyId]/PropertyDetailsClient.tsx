"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bath,
  BedDouble,
  ChevronLeft,
  Users,
} from "lucide-react";

import { apiClient } from "@/libs/api";
import { TenantProperty } from "@/types";
import PropertySlideshow from "@/app/(protected)/components/property/PropertySlideshow";

type Props = {
  tenantId: string;
  propertyId: string;
};

export default function PropertyDetailsClient({
  tenantId,
  propertyId,
}: Props) {
  const searchParams = useSearchParams();

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const [property, setProperty] =
    useState<TenantProperty | null>(null);

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

    load();
  }, [tenantId, propertyId, checkIn, checkOut]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        Property not found.
      </div>
    );
  }

  const params = new URLSearchParams();

  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);

  const query = params.toString();

  const bookingUrl =
    `/booking/${property.id}` +
    (query ? `?${query}` : "");

  const canBook =
    !!checkIn &&
    !!checkOut &&
    property.is_available;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <a
        href={`/properties${query ? `?${query}` : ""}`}
        className="mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ChevronLeft className="h-4 w-4" />
        All properties
      </a>

      <div className="overflow-hidden rounded-3xl">
        <PropertySlideshow
          images={property.images ?? []}
          alt={property.name}
        />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            {property.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-600">
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
            <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-8 text-gray-600">
              {property.description}
            </p>
          )}

          {property.amenities?.length > 0 && (
            <section className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-semibold">
                Amenities
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="rounded-xl bg-gray-50 px-4 py-3"
                  >
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking card */}
        <aside>
          <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-lg">
            {property.base_price && (
              <div>
                <span className="text-3xl font-semibold">
                  ${property.base_price.daily_price}
                </span>

                <span className="ml-2 text-gray-500">
                  / night
                </span>
              </div>
            )}

            {checkIn && checkOut && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <div className="text-sm text-gray-500">
                  Your stay
                </div>

                <div className="mt-1 font-medium">
                  {checkIn} → {checkOut}
                </div>
              </div>
            )}

            <div className="mt-6">
              {canBook ? (
                <a
                  href={bookingUrl}
                  className="flex w-full justify-center rounded-xl bg-[var(--primary)] px-5 py-4 font-medium text-white"
                >
                  Book now
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-4 font-medium text-gray-500"
                >
                  Book now
                </button>
              )}

              {checkIn &&
                checkOut &&
                !property.is_available && (
                  <p className="mt-3 text-center text-sm text-red-600">
                    Not available for selected dates
                  </p>
                )}

              {(!checkIn || !checkOut) && (
                <p className="mt-3 text-center text-sm text-gray-500">
                  Select your dates to book
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}