"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import {
  DayPicker,
  DateRange,
} from "react-day-picker";
import "react-day-picker/style.css";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { apiClient } from "@/libs/api";
import { TenantProperty, SectionTheme } from "@/types";
import PropertyCard from "@/app/accomondation/PropertyCard";
import ThemedDayPicker from "./ThemedDayPicker";

type Props = {
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
};

export default function PropertyGrid({
  tenantId,
  content,
  theme,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [properties, setProperties] =
    useState<TenantProperty[]>([]);

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadProperties() {
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

    loadProperties();
  }, [tenantId, checkIn, checkOut]);

  function updateRange(
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
      style={{
        backgroundColor: theme?.backgroundColor,
        color: theme?.textColor,
        fontFamily: theme?.fontFamily,
        fontSize: theme?.fontSize,
        paddingTop: theme?.paddingTop,
        paddingBottom: theme?.paddingBottom,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        {(content?.heading?.en ||
          content?.text?.en) && (
          <div className="mb-10 max-w-3xl">
            {content.heading?.en && (
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {content.heading.en}
              </h1>
            )}

            {content.text?.en && (
              <p
                className="mt-4 text-lg"
                style={{
                  color: theme?.secondaryColor,
                }}
              >
                {content.text.en}
              </p>
            )}
          </div>
        )}

        <DateSelector
          range={range}
          setRange={updateRange}
          theme={theme}
        />

        <div className="mt-10">
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
            <div className="rounded-3xl border p-12 text-center">
              <h2 className="text-2xl font-semibold">
                No properties available
              </h2>
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gap: theme?.layout?.gap ?? "32px",
                gridTemplateColumns: theme?.layout?.columns
                  ? `repeat(${theme.layout.columns}, minmax(0, 1fr))`
                  : undefined,
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
    <div className="relative max-w-xl">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left shadow-sm"
        style={{
          backgroundColor:
            theme?.card?.backgroundColor ??
            "#ffffff",
          color:
            theme?.card?.textColor ??
            "#111111",
          borderColor:
            theme?.card?.borderColor,
        }}
      >
        <div className="flex items-center gap-4">
          <CalendarDays className="h-5 w-5 opacity-60" />

          <div className="flex gap-8">
            <div>
              <div className="text-xs uppercase opacity-50">
                Check in
              </div>

              <div className="font-medium">
                {range?.from
                  ? formatDisplayDate(range.from)
                  : "Select date"}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase opacity-50">
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

        <ChevronRight className="h-5 w-5 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 rounded-2xl border bg-white p-5 text-gray-900 shadow-4xl">
          <ThemedDayPicker
            theme={theme}
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            disabled={{
              before: new Date(),
            }}
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={
                !range?.from || !range?.to
              }
              onClick={() => setOpen(false)}
              className="rounded-lg px-5 py-2.5 text-sm text-white disabled:opacity-40"
              style={{
                backgroundColor:
                  theme?.primaryColor ??
                  "#111111",
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

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

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

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}