"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/libs/api";
import {
  GlobalTheme,
  SectionTheme,
  TenantProperty,
} from "@/types";
import { resolveSectionTheme } from "@/libs/resolveSectionTheme";

type Props = {
  tenantId: string;
  content: {
    heading?: { en?: string };
    text?: { en?: string };
    limit?: number;
  };
  sectionTheme?: SectionTheme;
  globalTheme?: GlobalTheme;
};

export default function RoomGrid({
  tenantId,
  content,
  sectionTheme,
  globalTheme,
}: Props) {
  const [properties, setProperties] = useState<
    TenantProperty[]
  >([]);

  const [loading, setLoading] = useState(true);

  const {
    backgroundColor,
    textColor,
    secondaryColor,
    fontFamily,
    headingFontFamily,
    fontSize,
    paddingTop,
    paddingBottom,
    card_background_color,
    card_text_color,
    card_secondary_color,
    card_border_color,
    card_radius,
  } = resolveSectionTheme({...sectionTheme, ...globalTheme });
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data =
          await apiClient.api<TenantProperty[]>(
            `v1/tenants/${tenantId}/properties/public`
          );

        if (!cancelled) {
          setProperties(
            content.limit
              ? data.slice(0, content.limit)
              : data
          );
        }
      } catch (error) {
        console.error(
          "Could not load properties:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tenantId, content.limit]);

  return (
    <section
      className="py-20"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontSize,
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="text-3xl font-bold"
          style={{
            fontFamily: headingFontFamily,
          }}
        >
          {content.heading?.en}
        </h2>

        {content.text?.en && (
          <p
            className="mt-3"
            style={{
              color: secondaryColor,
            }}
          >
            {content.text.en}
          </p>
        )}

        {loading ? (
          <div
            className="mt-10"
            style={{
              color: secondaryColor,
            }}
          >
            Loading rooms...
          </div>
        ) : properties.length === 0 ? (
          <div
            className="mt-10"
            style={{
              color: secondaryColor,
            }}
          >
            No rooms available.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {properties.map((property) => (
              <a
                key={property.id}
                href={`/accommodation/${property.id}`}
                className="overflow-hidden border"
                style={{
                  backgroundColor: card_background_color,
                  color: card_text_color,
                  borderColor: card_border_color,
                  borderRadius: card_radius,
                }}
              >
                {property.images?.[0]?.url && (
                  <img
                    src={property.images[0].url}
                    alt={property.name}
                    className="h-56 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3
                    className="text-xl font-semibold"
                    style={{
                      color: card_text_color,
                      fontFamily:
                        headingFontFamily,
                    }}
                  >
                    {property.name}
                  </h3>

                  {property.description && (
                    <p
                      className="mt-2 line-clamp-2 text-sm"
                      style={{
                        color:
                          card_secondary_color,
                      }}
                    >
                      {property.description}
                    </p>
                  )}

                  <div
                    className="mt-4 text-sm"
                    style={{
                      color:
                        card_secondary_color,
                    }}
                  >
                    {property.max_guests} guests ·{" "}
                    {property.beds} beds ·{" "}
                    {property.bathrooms} bathrooms
                  </div>

                  {property.base_price && (
                    <div
                      className="mt-4 text-lg font-semibold"
                      style={{
                        color: card_text_color,
                      }}
                    >
                      From $
                      {
                        property.base_price
                          .daily_price
                      }{" "}
                      / night
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}