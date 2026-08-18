/* eslint-disable @typescript-eslint/no-explicit-any */
import AmenitiesEditor from "./editors/AmenitiesEditor";
import CardGridEditor from "./editors/CardGridEditor";
import ContactFormEditor from "./editors/ContactFormEditor";
import ContactInfoEditor from "./editors/ContactInfoEditor";
import CTAEditor from "./editors/CTAEditor";
import GalleryEditor from "./editors/GalleryEditor";
import HeroEditor from "./editors/HeroEditor";
import ImageTextEditor from "./editors/ImageTextEditor";
import PropertyGridEditor from "./editors/PropertyGridEditor";
import RoomGridEditor from "./editors/RoomGridEditor";

type Props = {
  section: any;
  content: any;
  tenantId: string;
  onChange: (content: any) => void;
};

export default function ContentEditor({
  section,
  content,
  tenantId,
  onChange,
}: Props) {
  switch (section.type) {
    case "hero":
      return (
        <HeroEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );

    case "image-text":
      return (
        <ImageTextEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );

    case "gallery":
      return (
        <GalleryEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
  case "amenities":
    return (
      <AmenitiesEditor
        content={content}
        onChange={onChange}
      />
    );

  case "cta":
    return (
      <CTAEditor
        content={content}
        onChange={onChange}
      />
    );
  
    case "card-grid":
      return (
        <CardGridEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
    case "contact-info":
      return (
        <ContactInfoEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
    case "contact-form":
      return (
        <ContactFormEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
    case "room-grid":
      return (
        <RoomGridEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
    case "property-grid":
      return (
        <PropertyGridEditor
          content={content}
          onChange={onChange}
          tenantId={tenantId}
        />
      );
    default:
      return (
        <div className="text-sm text-gray-500">
          No editor for {section.type}
        </div>
      );
  }
}