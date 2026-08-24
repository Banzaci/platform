/* eslint-disable @typescript-eslint/no-explicit-any */
import Gallery from "@/components/sections/Gallery";
import Hero from "@/components/sections/Hero";
import ImageText from "@/components/sections/ImageText";
import RoomGrid from "@/components/sections/RoomGrid";
import Amenities from "@/components/sections/Amenities";
import CTA from "@/components/sections/CTA";
import Booking from "@/components/sections/Booking";
import CardGrid from "@/components/sections/CardGrid";
import EditableSection from "./(protected)/components/EditableSection";
import DevLabel from "@/helpers/DevLabel";
import { TenantFont } from "@/types";
import PropertiesPageClient from "./accommodation/PropertiesPageClient";

const components = {
  hero: Hero,
  "image-text": ImageText,
  gallery: Gallery,
  "room-grid": RoomGrid,
  amenities: Amenities,
  cta: CTA,
  booking: Booking,
  "card-grid": CardGrid,
  "property-grid": PropertiesPageClient,
};

export default function PageRenderer({
  page,
  globalTheme,
  fonts,
  editable = false,
}: {
  page: any;
  globalTheme: any;
  editable?: boolean;
  fonts: TenantFont[]
}) {
  return (
    <>
      {page.sections.map((section: any) => {
        const Component = components[section.type as keyof typeof components];
        if (!Component) return null;
        const mergedTheme = {
          ...(globalTheme?.global ?? {}),
          ...(section.theme ?? {}),

          card: {
            ...(globalTheme?.card ?? {}),
            ...(section.theme?.card ?? {}),
          },

          button: {
            ...(globalTheme?.button ?? {}),
            ...(section.theme?.button ?? {}),
          },
          dateSelector: {
            ...(globalTheme?.dateSelector ?? {}),
            ...(section.theme?.dateSelector ?? {}),
          }
        };
        console.log(mergedTheme)
        return editable ? (
          <EditableSection
            key={section.id}
            section={section}
            theme={section.theme}
            pageId={page.id}
            tenantId={page.tenant_id}
            sections={page.sections}
            fonts={fonts}
          >
            <div className="relative">
              <DevLabel
                name={section.type}
                file="/Users/michellarsson/Projects/hotels/apps/tenant/app/PageRenderer.tsx"
              />
              <Component
                content={section.content}
                theme={mergedTheme}
                tenantId={page.tenant_id}
              />
            </div>
          </EditableSection>
        ) : (
          <Component
            key={section.id}
            theme={mergedTheme}
            content={section.content}
            tenantId={page.tenant_id}
          />
        );
      })}
    </>
  );
}