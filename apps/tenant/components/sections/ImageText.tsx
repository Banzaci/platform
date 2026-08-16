import { SectionTheme } from "@/types";

type Props = {
  content: {
    layout?: "image-left" | "image-right";
    image?: {
      url: string;
      publicId: string;
    };
    heading?: { en?: string };
    text?: { en?: string };
    button?: {
      label?: { en?: string };
      href?: string;
    };
  };
  theme?: SectionTheme;
};

export default function ImageText({ content, theme }: Props) {
  const imageRight = content.layout === "image-right";
  return (
    <section
      className="py-16"
      style={{
        backgroundColor: theme?.backgroundColor,
        color: theme?.textColor,
      }}
    >
      <div
        className={`mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2 ${
          imageRight ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
          {content.image?.url && (
            <img
              src={content.image.url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          {content.heading?.en && (
            <h2 className="text-3xl font-semibold md:text-4xl">
              {content.heading.en}
            </h2>
          )}

          {content.text?.en && (
            <p
              className="mt-5 leading-7"
              style={{
                color:
                  theme?.secondaryColor ??
                  theme?.textColor,
              }}
            >
              {content.text.en}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}