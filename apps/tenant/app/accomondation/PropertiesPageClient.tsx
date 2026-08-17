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
        backgroundColor: localTheme?.backgroundColor,
        color: localTheme?.textColor,
        fontFamily: localTheme?.fontFamily,
        fontSize: localTheme?.fontSize,
        paddingTop: localTheme?.paddingTop,
        paddingBottom: localTheme?.paddingBottom,
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        {(content?.heading?.en || content?.text?.en) && (
          <div className="mb-10 text-center">
            {content?.heading?.en && (
              <h1
                className="text-3xl font-semibold tracking-tight md:text-4xl"
                style={{
                  color: localTheme?.textColor,
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
                    localTheme?.secondaryColor ??
                    localTheme?.textColor,
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
            theme={localTheme}
          />
        </div>

        {loading ? (
          <div
            className="py-20 text-center"
            style={{
              color: localTheme?.secondaryColor,
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
            className={getGridClass(localTheme?.layout?.columns)}
            style={{
              gap: localTheme?.layout?.gap ?? "24px",
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