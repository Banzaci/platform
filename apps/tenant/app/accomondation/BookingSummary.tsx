import {
  CancellationPolicy,
  TenantProperty,
} from "@/types";
import { getShadow } from "@/helpers";

type Props = {
  property: TenantProperty;
  checkIn: string;
  checkOut: string;
  cancellationPolicy: CancellationPolicy;

  textColor: string;
  secondaryColor: string;
  headingFontFamily?: string;
  cardBackground: string;
  cardBorderColor: string;
  cardBorderRadius: string;
  cardShadow?: "none" | "sm" | "md" | "lg";
};

export default function BookingSummary({
  property,
  checkIn,
  checkOut,
  cancellationPolicy,
  textColor,
  secondaryColor,
  headingFontFamily,
  cardBackground,
  cardBorderColor,
  cardBorderRadius,
  cardShadow,
}: Props) {
  return (
    <div
      className="sticky top-24 border p-6"
      style={{
        backgroundColor: cardBackground,
        color: textColor,
        borderColor: cardBorderColor,
        borderRadius: cardBorderRadius,
        boxShadow: getShadow(cardShadow),
      }}
    >
      <h2
        className="text-xl font-semibold"
        style={{
          fontFamily: headingFontFamily,
        }}
      >
        Your stay
      </h2>

      <div
        className="mt-5 space-y-3"
        style={{
          color: secondaryColor,
        }}
      >
        <div className="flex justify-between">
          <span>Check in</span>

          <span style={{ color: textColor }}>
            {checkIn}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Check out</span>

          <span style={{ color: textColor }}>
            {checkOut}
          </span>
        </div>

        {property.nights != null && (
          <div className="flex justify-between">
            <span>Nights</span>

            <span style={{ color: textColor }}>
              {property.nights}
            </span>
          </div>
        )}

        {property.total_price != null && (
          <div
            className="flex justify-between border-t pt-4"
            style={{
              borderColor: cardBorderColor,
            }}
          >
            <span className="font-semibold">
              Total
            </span>

            <span
              className="text-xl font-semibold"
              style={{
                color: textColor,
                fontFamily: headingFontFamily,
              }}
            >
              ${property.total_price}
            </span>
          </div>
        )}
      </div>

      <div
        className="mt-6 border-t pt-5"
        style={{
          borderColor: cardBorderColor,
        }}
      >
        <h3 className="font-semibold">
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
            {cancellationPolicy.free_cancellation_days}{" "}
            days before check-in.
          </p>

          <p>
            {
              cancellationPolicy.partial_refund_percent
            }
            % refund when cancelling at least{" "}
            {
              cancellationPolicy.partial_refund_hours
            }{" "}
            hours before check-in.
          </p>
        </div>
      </div>
    </div>
  );
}