import { formatDisplayDate, getShadow } from "@/helpers";
import { SectionTheme } from "@/types";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ThemedDayPicker from "../(protected)/components/editsection/ThemedDayPicker";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import DevLabel from "@/helpers/DevLabel";

export default function DateSelector({
  range,
  setRange,
  theme,
}: {
  range?: DateRange;
  setRange: (
    range: DateRange | undefined
  ) => void;
  theme?: SectionTheme;
}) {
  const [ open, setOpen ] = useState(false);
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const displayFrom = range?.from ?? today;
  const displayTo = range?.to ?? tomorrow;
  const {
    textColor,
    secondaryColor,
    primaryColor,
    card_background_color,
    card_border_color,
    card_radius,
    button_background,
    button_text,
    button_radius,
    date_selected_background,
    date_selected_color,
    date_border,
    date_radius,
    date_secondary,
    date_shadow,
    date_width,
    date_background,
    date_text,
  } = resolveSectionTheme(theme);
  
  return (
    <div className="relative">
      <DevLabel
        name="DateSelector"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accomondation/DateSelector.tsx"
      />
      <div className="flex w-full justify-center">
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          className="flex items-center justify-between border px-5 py-4 text-left"
          style={{
            width: date_width,
            backgroundColor: date_selected_background,
            color: date_selected_color,
            borderColor: date_border,
            borderRadius: date_radius,
            boxShadow: getShadow(date_shadow),
          }}
        >
          <div className="flex items-center gap-4">
            <CalendarDays
              className="h-5 w-5"
              style={{
                color: date_secondary,
              }}
            />

            <div className="flex gap-8">
              <div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color: date_secondary,
                  }}
                >
                  Check in
                </div>

                <div className="font-medium">
                  {formatDisplayDate(displayFrom)}
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color: date_secondary,
                  }}
                >
                  Check out
                </div>

                <div className="font-medium">
                  {formatDisplayDate(displayTo)}
                </div>
              </div>
            </div>
          </div>

          <ChevronRight
            className="h-5 w-5"
            style={{
              color: date_secondary,
            }}
          />
        </button>
      </div>

      {open && (
        <div
          className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 border p-5"
          style={{
            backgroundColor: card_background_color,
            color: textColor,
            borderColor: card_border_color,
            borderRadius: card_radius,
          }}
        >
          <div
            className="min-w-[720px]"
            style={
              {
                "--rdp-accent-color":
                  date_text ??
                  primaryColor,

                "--rdp-accent-background-color":
                  date_background ??
                  secondaryColor,
              } as React.CSSProperties
            }
          >
            <ThemedDayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              theme={theme}
              disabled={{
                before: new Date(),
              }}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={!range?.from || !range?.to}
              className="px-5 py-2.5 text-sm disabled:opacity-40"
              style={{
                backgroundColor: button_background,
                color: button_text,
                borderRadius: button_radius,
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}