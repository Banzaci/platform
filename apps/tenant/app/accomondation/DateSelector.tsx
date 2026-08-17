import { formatDisplayDate, getShadow } from "@/helpers";
import { SectionTheme } from "@/types";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ThemedDayPicker from "../(protected)/components/editsection/ThemedDayPicker";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";

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

    cardBackground,
    cardBorderColor,
    cardBorderRadius,

    buttonBackground,
    buttonTextColor,
    buttonBorderRadius,

    dateSelectorBackground,
    dateSelectorTextColor,
    dateSelectorBorderColor,
    dateSelectorBorderRadius,
    dateSelectorSecondaryColor,
    dateSelectorShadow,
    dateSelectorWidth,
    dateSelectorSelectedBackground,
    dateSelectorSelectedColor,
  } = resolveSectionTheme(theme);
  
  return (
    <div className="relative">
      <div className="flex w-full justify-center">
        <button
          type="button"
          onClick={() =>
            setOpen((current) => !current)
          }
          className="flex items-center justify-between border px-5 py-4 text-left"
          style={{
            width: dateSelectorWidth,
            backgroundColor: dateSelectorBackground,
            color: dateSelectorTextColor,
            borderColor: dateSelectorBorderColor,
            borderRadius: dateSelectorBorderRadius,
            boxShadow: getShadow(dateSelectorShadow),
          }}
        >
          <div className="flex items-center gap-4">
            <CalendarDays
              className="h-5 w-5"
              style={{
                color: dateSelectorSecondaryColor,
              }}
            />

            <div className="flex gap-8">
              <div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color: dateSelectorSecondaryColor,
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
                    color: dateSelectorSecondaryColor,
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
              color: dateSelectorSecondaryColor,
            }}
          />
        </button>
      </div>

      {open && (
        <div
          className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 border p-5"
          style={{
            backgroundColor: cardBackground,
            color: textColor,
            borderColor: cardBorderColor,
            borderRadius: cardBorderRadius,
          }}
        >
          <div
            className="min-w-[720px]"
            style={
              {
                "--rdp-accent-color":
                  dateSelectorSelectedColor ??
                  primaryColor,

                "--rdp-accent-background-color":
                  dateSelectorSelectedBackground ??
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
                backgroundColor: buttonBackground,
                color: buttonTextColor,
                borderRadius: buttonBorderRadius,
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