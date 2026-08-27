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
import { GlobalTheme, SectionTheme, TenantProperty } from "@/types";
import { formatDate, getGridClass, parseDate } from "@/helpers";
import EditablePropertyCard from "../(protected)/components/EditablePropertyCard";
import { useIsEditor } from "@/hooks/useIsEditor";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";
import DevLabel from "@/helpers/DevLabel";
import DateSelectorWrapper from "../(protected)/components/editsection/DateSelectorWrapper";
import { useSettings } from "@/providers/SettingsProvider";
import { useQuery } from "@tanstack/react-query";

export default function PropertiesPageClient({ sectionTheme }: { sectionTheme?: SectionTheme }) {
  const { globalTheme, tenantId } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEditor = useIsEditor();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const [localGlobalTheme, setLocalGlobalTheme] = useState<GlobalTheme>(globalTheme);
  
  const params = new URLSearchParams();

  if (checkIn) params.set("check_in", checkIn);
  if (checkOut) params.set("check_out", checkOut);

  const query = params.toString();
  const {
    data: properties = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["properties", tenantId, checkIn, checkOut],
    queryFn: () =>
      apiClient.api<TenantProperty[]>(
        `v1/tenants/${tenantId}/properties/public${query ? `?${query}` : ""}`
      ),
      enabled: !!checkIn && !!checkOut,
      staleTime: Infinity,
  });

  async function saveTheme() {
    await apiClient.api<any>(
      `v1/tenants/${tenantId}/theme`,
      {
        method: "PUT",
        body: JSON.stringify(localGlobalTheme),
      }
    );
  }

  const {
    textColor,
    fontSize,
    backgroundColor,
    paddingTop,
    paddingBottom,
    card_background_color,
    card_border_color,
    card_radius,
    fontFamily,
  } = resolveSectionTheme(localGlobalTheme, sectionTheme);

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

  function setRange(nextRange: DateRange | undefined) {
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
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
      }}
    >
      <DevLabel
        name="PropertiesPageClient"
        file="/Users/michellarsson/Projects/hotels/apps/tenant/app/accommodation/PropertiesPageClient.tsx"
      />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex justify-center">
          <DateSelectorWrapper
            range={range}
            setRange={setRange}
            globalTheme={localGlobalTheme}
            editable={isEditor}
            onThemeChange={setLocalGlobalTheme}
            onSave={saveTheme}
          />
        </div>
        {loading ? (
          <div className="py-20 text-center">
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div
            className="border p-12 text-center"
            style={{
              backgroundColor: card_background_color,
              color: textColor,
              borderColor: card_border_color,
              borderRadius: card_radius,
            }}
          >
            <h2 className="text-xl font-semibold">
              No properties available
            </h2>
          </div>
        ) : (
          <div
            className={getGridClass(
              localGlobalTheme.layout?.columns
            )}
            style={{
              gap: "24px",
            }}
          >
            {properties.map((property) => (
              <EditablePropertyCard
                key={property.id}
                property={property}
                checkIn={checkIn}
                checkOut={checkOut}
                globalTheme={localGlobalTheme}
                editable={isEditor}
                onThemeChange={setLocalGlobalTheme}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}