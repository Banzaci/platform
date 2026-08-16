import { formatDisplayDate, getShadow } from "@/helpers";
import { SectionTheme } from "@/types";
import { CalendarDays, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ThemedDayPicker from "../(protected)/components/editsection/ThemedDayPicker";

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
  const [open, setOpen] = useState(false);

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
            width:
              theme?.dateSelector?.width ??
              "50%",

            backgroundColor:
              theme?.dateSelector?.backgroundColor ??
              "#ffffff",

            color:
              theme?.dateSelector?.textColor ??
              theme?.textColor,

            borderColor:
              theme?.dateSelector?.borderColor,

            borderRadius:
              theme?.dateSelector?.borderRadius ??
              "16px",

            boxShadow: getShadow(
              theme?.dateSelector?.shadow
            ),
          }}
        >
          <div className="flex items-center gap-4">
            <CalendarDays
              className="h-5 w-5"
              style={{
                color:
                  theme?.dateSelector?.secondaryColor ??
                  theme?.secondaryColor,
              }}
            />
            <div className="flex gap-8">
              <div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color:
                      theme?.dateSelector?.secondaryColor ??
                      theme?.secondaryColor,
                  }}
                >
                  Check in
                </div>

                <div className="font-medium">
                  {range?.from
                    ? formatDisplayDate(range.from)
                    : "Select date"}
                </div>
              </div>

              <div>
                <div
                  className="text-xs uppercase"
                  style={{
                    color:
                      theme?.dateSelector?.secondaryColor ??
                      theme?.secondaryColor,
                  }}
                >
                  Check out
                </div>

                <div className="font-medium">
                  {range?.to
                    ? formatDisplayDate(range.to)
                    : "Select date"}
                </div>
              </div>
            </div>
          </div>

          <ChevronRight
            className="h-5 w-5"
            style={{
              color:
                theme?.dateSelector?.secondaryColor ??
                theme?.secondaryColor,
            }}
          />
        </button>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2"
          style={{
            backgroundColor:
              theme?.card?.backgroundColor ??
              theme?.backgroundColor,

            color:
              theme?.card?.textColor ??
              theme?.textColor,

            borderColor:
              theme?.card?.borderColor,

            borderRadius:
              theme?.card?.borderRadius ?? "16px",
          }}
        >
          <div
            className="min-w-[720px]"
            style={
              {
                "--rdp-accent-color":
                  theme?.primaryColor ?? "#111111",

                "--rdp-accent-background-color":
                  theme?.secondaryColor ?? "#eeeeee",
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
          </div>d
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={!range?.from || !range?.to}
              className="px-5 py-2.5 text-sm disabled:opacity-40"
              style={{
                backgroundColor:
                  theme?.button?.backgroundColor ??
                  theme?.primaryColor,

                color:
                  theme?.button?.textColor ??
                  "#ffffff",

                borderRadius:
                  theme?.button?.borderRadius ?? "8px",
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