import { TenantProperty, GlobalTheme } from "@/types";
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
  globalTheme?: GlobalTheme;
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
    button_position,
    button_width
  } = resolveSectionTheme(globalTheme);

  const hasDates = !!checkIn && !!checkOut;
  const canView = hasDates && property.is_available;

  const buttonJustify =
    button_position === "left"
      ? "flex-start"
      : button_position === "center"
        ? "center"
        : "flex-end";

  const buttonStyle = {
    width: button_width ?? "100%",
    backgroundColor: button_background,
    color: button_text,
    borderRadius: button_radius,
  };

  return (
    <article
      className="overflow-hidden"
      style={{
        backgroundColor: card_background_color,
        color: card_text_color,
        border: card_border_color ? `1px solid ${card_border_color}` : "none",
        borderRadius: card_radius,
        boxShadow: getShadow(card_shadow),
      }}
    >
      <DevLabel
        name="PropertyCard"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/PropertyCard.tsx"
      />
      <PropertySlideshow
        images={property.images ?? []}
        alt={property.name}
      />
      <div style={{ padding: card_padding }} className="p-4">
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
          {property.total_price && (
            <div className="shrink-0 text-right">
              <div className="text-md font-semibold">
                ${property.total_price}
              </div>

              <div
                className="text-md"
                style={{
                  color: card_secondary_color,
                }}
              >
                ${property.base_price?.daily_price} per night
              </div>
            </div>
          )}
        </div>
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
          <div className="mt-4 flex flex-wrap gap-2">
            {property.amenities
              .slice(0, 4)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border py-2 px-4 text-xs"
                  style={{ borderColor: card_border_color, color: card_secondary_color }}
                >
                  {amenity}
                </span>
              ))}
          </div>
        )}
        <div className="mt-8">
          <div
            className="flex w-full"
            style={{
              justifyContent: buttonJustify,
            }}
          >
            {canView ? (
              <a
                href={bookingUrl}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:opacity-90"
                style={buttonStyle}
              >
                {button_text}
                <ChevronRight className="h-4 w-4" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium opacity-50"
                style={buttonStyle}
              >
                {button_text}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {hasDates && !property.is_available && (
            <p
              className="mt-2 text-center text-xs"
              style={{
                color: card_secondary_color,
              }}
            >
              Not available for selected dates
            </p>
          )}
        </div>
      </div>
    </article>
  );
}