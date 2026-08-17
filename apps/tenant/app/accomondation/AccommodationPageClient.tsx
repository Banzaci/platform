/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditableSection from "@/app/(protected)/components/EditableSection";
import PropertiesPageClient from "./PropertiesPageClient";

import { SectionTheme } from "@/types";
import CTA from "@/components/sections/CTA";
import ImageText from "@/components/sections/ImageText";
import Hero from "@/components/sections/Hero";
import Gallery from "@/components/sections/Gallery";
import Amenities from "@/components/sections/Amenities";

type Props = {
  tenantId: string;
  pageId: string;
  sections: any[];
  globalTheme: SectionTheme;
};

export default function AccommodationPageClient({
  tenantId,
  pageId,
  sections,
  globalTheme,
}: Props) {
  return (
    <>
      {sections.map((section) => {
        const theme = {
          ...globalTheme,
          ...(section.theme ?? {}),
        };

        return (
          <EditableSection
            key={section.id}
            section={section}
            pageId={pageId}
            tenantId={tenantId}
            sections={sections}
          >
            {renderSection(
              section,
              tenantId,
              theme,
            )}
          </EditableSection>
        );
      })}
    </>
  );
}

function renderSection(
  section: any,
  tenantId: string,
  theme: SectionTheme,
) {
  switch (section.type) {
    case "property-grid":
      return (
        <PropertiesPageClient
          tenantId={tenantId}
          content={section.content}
          theme={theme}
        />
      );

    case "cta":
      return (
        <CTA
          content={section.content}
          theme={theme}
        />
      );

    case "image-text":
      return (
        <ImageText
          content={section.content}
          theme={theme}
        />
      );

    case "hero":
      return (
        <Hero
          content={section.content}
          theme={theme}
        />
      );

    case "gallery":
      return (
        <Gallery
          content={section.content}
          theme={theme}
        />
      );

    case "amenities":
      return (
        <Amenities
          content={section.content}
          theme={theme}
        />
      );

    default:
      return null;
  }
}