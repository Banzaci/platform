/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditableSection from "@/app/(protected)/components/EditableSection";
import PropertiesPageClient from "./PropertiesPageClient";
import { SectionTheme, TenantFont } from "@/types";

type Props = {
  tenantId: string;
  pageId: string;
  sections: any[];
  globalTheme: SectionTheme;
  fonts: TenantFont[]
};

export default function AccommodationPageClient({
  tenantId,
  pageId,
  sections,
  globalTheme,
  fonts,
}: Props) {
  return (
    <main
      style={{
        backgroundColor: globalTheme.backgroundColor,
        color: globalTheme.textColor,
        fontFamily: globalTheme.fontFamily,
        fontSize: globalTheme.fontSize,
      }}
    >
      {sections.map((section) => {
        const mergedTheme = {
          ...(section.theme ?? {}),
          global: {
            ...(globalTheme ?? {}),
          },
        };

        console.log(section.theme)

        return (
          <EditableSection
            key={section.id}
            theme={section.theme}
            section={section}
            pageId={pageId}
            tenantId={tenantId}
            sections={sections}
            fonts={fonts}
          >
            <PropertiesPageClient
              tenantId={tenantId}
              globalTheme={mergedTheme}
            />
          </EditableSection>
        );
      })}
    </main>
  );
}

// function renderSection(
//   section: any,
//   tenantId: string,
//   theme: SectionTheme,
// ) {
//   switch (section.type) {
//     case "property-grid":
//       return (
//         <PropertiesPageClient
//           tenantId={tenantId}
//           theme={theme}
//         />
//       );

//     case "cta":
//       return (
//         <CTA
//           content={section.content}
//           theme={theme}
//         />
//       );

//     case "image-text":
//       return (
//         <ImageText
//           content={section.content}
//           theme={theme}
//         />
//       );

//     case "hero":
//       return (
//         <Hero
//           content={section.content}
//           theme={theme}
//         />
//       );

//     case "gallery":
//       return (
//         <Gallery
//           content={section.content}
//           theme={theme}
//         />
//       );

//     case "amenities":
//       return (
//         <Amenities
//           content={section.content}
//           theme={theme}
//         />
//       );

//     default:
//       return null;
//   }
// }