/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import EditableSection from "@/app/(protected)/components/EditableSection";
import PropertyDetailsClient from "./PropertyDetailsClient";
import { CancellationPolicy, SectionTheme } from "@/types";

type Props = {
  tenantId: string;
  propertyId: string;
  pageId: string;
  sections: any[];
  globalTheme: SectionTheme;
  cancellationPolicy: CancellationPolicy
}
export default function EditPropertyDetailsClient({
  tenantId,
  pageId,
  sections,
  globalTheme,
  cancellationPolicy,
  propertyId
}: Props) {
    return (
      <>
        {sections.map((section) => {
          const mergedTheme = {
            ...(section.theme ?? {}),
            global: {
              ...(globalTheme ?? {}),
            },
          };
          console.log(mergedTheme)
          return (
            <EditableSection
              key={section.id}
              theme={section.theme}
              section={section}
              pageId={pageId}
              tenantId={tenantId}
              sections={sections}
            >
              <PropertyDetailsClient
                tenantId={tenantId}
                propertyId={propertyId}
                cancellationPolicy={cancellationPolicy}
                theme={mergedTheme}
              />
            </EditableSection>
          );
        })}
      </>
    );
  }
//   return (
//     <EditableSection
//       key={section.id}
//       theme={section.theme}
//       section={section}
//       pageId={pageId}
//       tenantId={tenantId}
//       sections={sections}
//     >
      
//     </EditableSection>
//   );
// }

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