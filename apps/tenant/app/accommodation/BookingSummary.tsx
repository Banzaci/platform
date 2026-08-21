import {
  CancellationPolicy,
  Property,
} from "@/types";
import { getShadow } from "@/helpers";
import DevLabel from "@/helpers/DevLabel";

type Props = {
  checkIn: string;
  checkOut: string;
  cancellationPolicy: CancellationPolicy;
  textColor: string;
  secondaryColor: string;
  headingFontFamily?: string;
  cardBackground: string;
  cardBorderColor: string;
  cardBorderRadius: string;
  nights?: number | null;
  total_price?: number | null;
  cardShadow?: "none" | "sm" | "md" | "lg";
};

export default function BookingSummary({
  total_price,
  nights,
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
      <DevLabel
        name="CalendarSyncSettings"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/BookingSummary.tsx"
      />
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

        {nights != null && (
          <div className="flex justify-between">
            <span>Nights</span>
            <span style={{ color: textColor }}>
              {nights}
            </span>
          </div>
        )}
        {total_price != null && (
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
              ${total_price}
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