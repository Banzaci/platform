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
  theme,
}: {
  property: TenantProperty;
  checkIn: string | null;
  checkOut: string | null;
  theme?: SectionTheme;
}) {
  const href = new URLSearchParams();
  if (checkIn) {
    href.set("checkIn", checkIn);
  }

  if (checkOut) {
    href.set("checkOut", checkOut);
  }

  const bookingUrl =
    `/accomondation/${property.id}` +
    (href.size ? `?${href.toString()}` : "");

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
  } = resolveSectionTheme(theme);

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
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accomondation/PropertyCard.tsx"
      />
      <PropertySlideshow
        images={property.images ?? []}
        alt={property.name}
      />

      <div
        style={{
          padding: card_padding,
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2
              className="text-2xl font-semibold">
              {property.name}
            </h2>

            {property.description && (
              <p
                className="mt-3 line-clamp-3 leading-7"
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
              <div
                className="text-2xl font-semibold">
                ${property.base_price.daily_price}
              </div>
              <div className="text-xs">
                per night
              </div>
            </div>
          )}
        </div>

        <div
          className="mt-6 flex flex-wrap gap-5 border-y py-5 text-sm">
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
            {property.amenities
              .slice(0, 5)
              .map((amenity) => (
                <span key={amenity} className="rounded-full border px-3 py-1.5 text-xs">
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
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 px-5 py-3.5 font-medium opacity-50"
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
                    className="mt-2 text-center text-sm"
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