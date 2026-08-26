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
import PropertiesPageClient from "./accommodation/PropertiesPageClient";
import { GlobalTheme } from "@/types";

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
  editable = false,
}: {
  page: any;
  editable?: boolean;
  globalTheme: GlobalTheme
}) {
  return (
    <>
      {page.sections.map((section: any) => {
        const Component = components[section.type as keyof typeof components];
        if (!Component) return null;
        const sectionTheme = section.theme;
        return editable ? (
          <EditableSection
            key={section.id}
            section={section}
            pageId={page.id}
            sections={page.sections}
          >
            <div className="relative">
              <DevLabel
                name={section.type}
                file="/Users/michellarsson/Projects/hotels/apps/tenant/app/PageRenderer.tsx"
              />
              <Component
                content={section.content}
                sectionTheme={sectionTheme}
                globalTheme={globalTheme}
              />
            </div>
          </EditableSection>
        ) : (
          <Component
            key={section.id}
            sectionTheme={sectionTheme}
            content={section.content}
          />
        );
      })}
    </>
  );
}