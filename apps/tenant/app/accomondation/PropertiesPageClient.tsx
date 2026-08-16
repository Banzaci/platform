"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import {
  DateRange,
} from "react-day-picker";
import "react-day-picker/style.css";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { apiClient } from "@/libs/api";
import PropertyCard from "./PropertyCard";
import { SectionTheme, TenantProperty } from "@/types";
import { getGridClass, getShadow } from "@/helpers";
import ThemedDayPicker from "../(protected)/components/editsection/ThemedDayPicker";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string | null) {
  if (!value) return undefined;

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function PropertiesPageClient({
  tenantId,
  content,
  theme,
}: {
  tenantId: string;
  content?: {
    heading?: {
      en?: string;
    };
    text?: {
      en?: string;
    };
  };
  theme?: SectionTheme;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const range = useMemo<DateRange | undefined>(() => {
    const from = parseDate(checkIn);
    const to = parseDate(checkOut);

    if (!from) {
      return undefined;
    }

    return {
      from,
      to,
    };
  }, [checkIn, checkOut]);

  const [properties, setProperties] =
    useState<TenantProperty[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (checkIn) {
          params.set("check_in", checkIn);
        }

        if (checkOut) {
          params.set("check_out", checkOut);
        }

        const query = params.toString();

        const data =
          await apiClient.api<TenantProperty[]>(
            `v1/tenants/${tenantId}/properties/public${
              query ? `?${query}` : ""
            }`
          );

        setProperties(data);
      } catch (error) {
        console.error(
          "Could not load properties:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tenantId, checkIn, checkOut]);

  function setRange(
    nextRange: DateRange | undefined
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (nextRange?.from) {
      params.set(
        "checkIn",
        formatDate(nextRange.from)
      );
    } else {
      params.delete("checkIn");
    }

    if (nextRange?.to) {
      params.set(
        "checkOut",
        formatDate(nextRange.to)
      );
    } else {
      params.delete("checkOut");
    }

    const query = params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );
  }

  return (
    <section
      className="min-h-screen"
      style={{
        backgroundColor: theme?.backgroundColor,
        color: theme?.textColor,
        fontFamily: theme?.fontFamily,
        fontSize: theme?.fontSize,
        paddingTop: theme?.paddingTop,
        paddingBottom: theme?.paddingBottom,
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        {(content?.heading?.en || content?.text?.en) && (
          <div className="mb-10 text-center">
            {content?.heading?.en && (
              <h1
                className="text-3xl font-semibold tracking-tight md:text-4xl"
                style={{
                  color: theme?.textColor,
                }}
              >
                {content.heading.en}
              </h1>
            )}

            {content?.text?.en && (
              <p
                className="mx-auto mt-3 max-w-2xl"
                style={{
                  color:
                    theme?.secondaryColor ??
                    theme?.textColor,
                }}
              >
                {content.text.en}
              </p>
            )}
          </div>
        )}

        <div className="mb-10 flex justify-center">
          <DateSelector
            range={range}
            setRange={setRange}
            theme={theme}
          />
        </div>

        {loading ? (
          <div
            className="py-20 text-center"
            style={{
              color: theme?.secondaryColor,
            }}
          >
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center">
            <h2 className="text-xl font-semibold">
              No properties available
            </h2>
          </div>
        ) : (
          <div
            className={getGridClass(
              theme?.layout?.columns
            )}
            style={{
              gap: theme?.layout?.gap ?? "24px",
            }}
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                checkIn={checkIn}
                checkOut={checkOut}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DateSelector({
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