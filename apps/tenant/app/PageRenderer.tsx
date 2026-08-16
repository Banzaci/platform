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

const components = {
  hero: Hero,
  "image-text": ImageText,
  gallery: Gallery,
  "room-grid": RoomGrid,
  amenities: Amenities,
  cta: CTA,
  booking: Booking,
  "card-grid": CardGrid,
};

export default function PageRenderer({
  page,
  globalTheme,
  editable = false,
}: {
  page: any;
  globalTheme: any;
  editable?: boolean;
}) {
  return (
    <>
      {page.sections.map((section: any) => {
        const Component =
          components[section.type as keyof typeof components];

        if (!Component) return null;

        const mergedTheme = {
          ...globalTheme,
          ...(section.theme ?? {}),
        };

        return editable ? (
          <EditableSection
            key={section.id}
            section={section}
            pageId={page.id}
            tenantId={page.tenant_id}
            sections={page.sections}
          >
            <Component
              content={section.content}
              layout={section.layout}
              theme={mergedTheme}
            />
          </EditableSection>
        ) : (
          <Component
            key={section.id}
            content={section.content}
            layout={section.layout}
          />
        );
      })}
    </>
  );
}