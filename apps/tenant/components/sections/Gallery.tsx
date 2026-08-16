import { SectionTheme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
    images?: {
      image?: string;
      alt?: string;
    }[];
  };
  theme?: SectionTheme;
};

export default function Gallery({ content, theme }: Props) {
  return (
    <section
      style={{
            backgroundColor: theme?.backgroundColor,
            color: theme?.textColor,
            fontFamily: theme?.fontFamily,
            fontSize: theme?.fontSize,
            paddingTop: theme?.paddingTop,
            paddingBottom: theme?.paddingBottom,
          }}
      >
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-10 text-3xl font-bold">
          {content.heading?.en}
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {content.images?.map((image, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              {image.image && (
                <img
                  src={image.image}
                  alt={image.alt ?? ""}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}