/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { SectionTheme, TenantProperty } from "@/types";
import { formatDate, getGridClass, parseDate } from "@/helpers";
import EditablePropertyCard from "../(protected)/components/EditablePropertyCard";
import DateSelector from "./DateSelector";
import { useIsEditor } from "@/hooks/useIsEditor";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";

export default function PropertiesPageClient({
  tenantId,
  content,
  theme,
  pageId,
  section,
  sections
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
  pageId: string;
  sections: any[];
  section: any;
  theme?: SectionTheme;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditor = useIsEditor();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const [localTheme, setLocalTheme] = useState<SectionTheme>(
    theme ?? {}
  );

  const { cardBackground, cardBorderColor, cardBorderRadius, backgroundColor, textColor, secondaryColor, fontFamily, fontSize, headingFontFamily }= resolveSectionTheme(localTheme);

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

  const [properties, setProperties] = useState<TenantProperty[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkIn || checkOut) {
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);

    tomorrow.setDate(
      today.getDate() + 1
    );

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set(
      "checkIn",
      formatDate(today)
    );

    params.set(
      "checkOut",
      formatDate(tomorrow)
    );

    router.replace(
      `${pathname}?${params.toString()}`,
      {
        scroll: false,
      }
    );
  }, [
    checkIn,
    checkOut,
    pathname,
    router,
    searchParams,
  ]);

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
        backgroundColor,
        color: textColor,
        fontFamily,
        fontSize,
        paddingTop: localTheme.paddingTop,
        paddingBottom: localTheme.paddingBottom,
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* {(content?.heading?.en || content?.text?.en) && (
          <div className="mb-10 text-center">
            {content?.heading?.en && (
              <h1
                className="text-3xl font-semibold tracking-tight md:text-4xl"
                style={{
                  color: textColor,
                  fontFamily: headingFontFamily,
                }}
              >
                {content.heading.en}
              </h1>
            )}

            {content?.text?.en && (
              <p
                className="mx-auto mt-3 max-w-2xl"
                style={{
                  color: secondaryColor,
                }}
              >
                {content.text.en}
              </p>
            )}
          </div>
        )} */}
        <div className="mb-10 flex justify-center">
          <DateSelector
            range={range}
            setRange={setRange}
            theme={localTheme}
          />
        </div>
        {loading ? (
          <div
            className="py-20 text-center"
            style={{
              color: secondaryColor,
            }}
          >
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div
            className="border p-12 text-center"
            style={{
              backgroundColor: cardBackground,
              color: textColor,
              borderColor: cardBorderColor,
              borderRadius: cardBorderRadius,
            }}
          >
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: headingFontFamily,
              }}
            >
              No properties available
            </h2>
          </div>
        ) : (
          <div
            className={getGridClass(
              localTheme.layout?.columns
            )}
            style={{
              gap:
                localTheme.layout?.gap ??
                "24px",
            }}
          >
            {properties.map((property) => (
              <EditablePropertyCard
                key={property.id}
                tenantId={tenantId}
                property={property}
                checkIn={checkIn}
                checkOut={checkOut}
                theme={localTheme}
                editable={isEditor}
                pageId={pageId}
                section={section}
                sections={sections}
                onThemeChange={setLocalTheme}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}