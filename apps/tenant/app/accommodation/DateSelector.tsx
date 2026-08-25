import { formatDisplayDate, getShadow } from "@/helpers";
import { GlobalTheme } from "@/types";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ThemedDayPicker from "../(protected)/components/editsection/ThemedDayPicker";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import DevLabel from "@/helpers/DevLabel";

export default function DateSelector({
  range,
  setRange,
  globalTheme,
}: {
  range?: DateRange;
  setRange: (
    range: DateRange | undefined
  ) => void;
  globalTheme?: GlobalTheme;
}) {
  const [ open, setOpen ] = useState(false);
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const displayFrom = range?.from ?? today;
  const displayTo = range?.to ?? tomorrow;
  const {
    button_background,
    button_text,
    button_radius,
    date_border,
    date_radius,
    date_secondary,
    date_shadow,
    date_width,
    date_background,
    date_text,
  } = resolveSectionTheme(globalTheme);
  
  return (
    <div className="relative w-full">
      <div className="relative flex w-full justify-center">
        <DevLabel
          name="DateSelector"
          file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/DateSelector.tsx"
        />
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          className="relative flex items-center justify-between border px-5 py-4 text-left w-full"
          style={{
            width: date_width,
            backgroundColor: date_background,
            color: date_text,
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
          className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 p-5"
          style={{
            backgroundColor: date_background,
            color: date_text,
            boxShadow: date_shadow,
            borderColor: date_border,
            borderRadius: date_radius,
          }}
        >
          <div
            className="min-w-180"
            // style={
            //   {
            //     "--rdp-accent-color":
            //       date_text ??
            //       primaryColor,

            //     "--rdp-accent-background-color":
            //       date_background ??
            //       secondaryColor,
            //   } as React.CSSProperties
            // }
          >
            <ThemedDayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              globalTheme={globalTheme}
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