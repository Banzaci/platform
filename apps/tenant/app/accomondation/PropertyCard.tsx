import { TenantProperty, SectionTheme } from "@/types";
import PropertySlideshow from "../(protected)/components/property/PropertySlideshow";
import {
  User,
  BedDouble,
  Bath,
  ChevronRight,
} from "lucide-react";

export default function PropertyCard({
  property,
  checkIn,
  checkOut,
  theme,
}: {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  theme?: SectionTheme
}) {
  const href = new URLSearchParams();

  if (checkIn) href.set("checkIn", checkIn);
  if (checkOut) href.set("checkOut", checkOut);

  const bookingUrl = `/accomondation/${property.id}` + (href.size ? `?${href.toString()}` : "");

  return (
    <article 
      style={{
        backgroundColor: theme?.card?.backgroundColor,
        color: theme?.card?.textColor,
        borderColor: theme?.card?.borderColor,
        borderRadius: theme?.card?.borderRadius,
        padding: theme?.card?.padding,
      }}
    >
      <div className="overflow-hidden">
        <PropertySlideshow
          images={property.images ?? []}
          alt={property.name}
        />
      </div>
      <div className="p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{
                color: theme?.card?.textColor,
              }}
            >
              {property.name}
            </h2>

            {property.description && (
              <p
                className="mt-3 line-clamp-3 leading-7"
                style={{
                  color:
                    theme?.card?.secondaryColor ??
                    theme?.secondaryColor,
                }}
              >
                {property.description}
              </p>
            )}
          </div>

          {property.base_price && (
            <div className="shrink-0 text-right">
              <div className="text-2xl font-semibold text-gray-950">
                ${property.base_price.daily_price}
              </div>

              <div className="text-xs text-gray-500">
                per night
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-5 border-y py-5 text-sm text-gray-600">
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
          <div className="mt-5 flex flex-wrap gap-2">
            {property.amenities.slice(0, 5).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

       <div className="mt-7">
          {checkIn && checkOut && property.is_available ? (
            <a
              href={bookingUrl}
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 font-medium transition hover:opacity-90"
              style={{
                backgroundColor:
                  theme?.button?.backgroundColor ??
                  theme?.primaryColor,
                color:
                  theme?.button?.textColor ??
                  "#ffffff",
                borderRadius:
                  theme?.button?.borderRadius,
              }}
            >
              Book now
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : (
            <>
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-medium "
                style={{
                  backgroundColor:
                    theme?.button?.backgroundColor ??
                    theme?.primaryColor,

                  color:
                    theme?.button?.textColor ??
                    "#ffffff",

                  borderRadius:
                    theme?.button?.borderRadius,
                }}
              >
                Book now
                <ChevronRight className="h-4 w-4" />
              </button>

              {checkIn && checkOut && !property.is_available && (
                <p className="mt-2 text-center text-sm text-red-600">
                  Not available for selected dates
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}