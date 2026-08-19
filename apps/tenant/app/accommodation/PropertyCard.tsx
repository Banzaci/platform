import { TenantProperty, SectionTheme } from "@/types";
import PropertySlideshow from "../(protected)/components/property/PropertySlideshow";
import {
  User,
  BedDouble,
  Bath,
  ChevronRight,
} from "lucide-react";
import { getShadow } from "@/helpers";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import DevLabel from "@/helpers/DevLabel";

export default function PropertyCard({
  property,
  checkIn,
  checkOut,
  globalTheme,
}: {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  globalTheme?: SectionTheme;
}) {
  const href = new URLSearchParams();
  if (checkIn) {
    href.set("checkIn", checkIn);
  }

  if (checkOut) {
    href.set("checkOut", checkOut);
  }

  const bookingUrl = `/accommodation/${property.id}` + (href.size ? `?${href.toString()}` : "");

  const {
    fontFamily,
    secondaryColor,
    card_background_color,
    card_text_color,
    card_secondary_color,
    card_border_color,
    card_radius,
    card_shadow,
    card_padding,
    button_background,
    button_text,
    button_radius,
  } = resolveSectionTheme(globalTheme);

  return (
    <article
      className="overflow-hidden border"
      style={{
        backgroundColor: card_background_color,
        color: card_text_color,
        borderColor: card_border_color,
        borderRadius: card_radius,
        boxShadow: getShadow(card_shadow),
        fontFamily,
      }}
    >
      <DevLabel
        name="PropertyCard"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/PropertyCard.tsx"
      />

      <PropertySlideshow
        images={property.images ?? []}
        alt={property.name}
        className="h-36"
      />

      <div
        style={{
          padding: card_padding,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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
          </div>

          {property.base_price && (
            <div className="shrink-0 text-right">
              <div className="text-lg font-semibold">
                ${property.base_price.daily_price}
              </div>

              <div
                className="text-[11px]"
                style={{
                  color: card_secondary_color,
                }}
              >
                per night
              </div>
            </div>
          )}
        </div>

        <div
          className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-y py-2.5 text-xs"
          style={{
            borderColor: card_border_color,
            color: card_secondary_color,
          }}
        >
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {property.max_guests} guests
          </span>

          <span className="flex items-center gap-1.5">
            <BedDouble className="h-3.5 w-3.5" />
            {property.beds} beds
          </span>

          <span className="flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5" />
            {property.bathrooms} bathrooms
          </span>
        </div>

        {property.amenities?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.amenities
              .slice(0, 4)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                  style={{
                    borderColor: card_border_color,
                  }}
                >
                  {amenity}
                </span>
              ))}
          </div>
        )}

        <div className="mt-4">
          {checkIn && checkOut && property.is_available ? (
            <a
              href={bookingUrl}
              className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
              style={{
                backgroundColor: button_background,
                color: button_text,
                borderRadius: button_radius,
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
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium opacity-50"
                style={{
                  backgroundColor: button_background,
                  color: button_text,
                  borderRadius: button_radius,
                }}
              >
                Book now
                <ChevronRight className="h-4 w-4" />
              </button>

              {checkIn &&
                checkOut &&
                !property.is_available && (
                  <p
                    className="mt-2 text-center text-xs"
                    style={{
                      color: secondaryColor,
                    }}
                  >
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