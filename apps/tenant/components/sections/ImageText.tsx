import { SectionTheme } from "@/types";

type Props = {
  layout?: "image-left" | "image-right";
  content: {
    image?: string;
    heading?: { en?: string };
    text?: { en?: string };
    button?: {
      label?: { en?: string };
      href?: string;
    };
  };
  theme?: SectionTheme;
};

export default function ImageText({ layout, content, theme }: Props) {
  const imageLeft = layout !== "image-right";

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
      <div
        className={`mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 ${
          imageLeft ? "" : "md:[&>*:first-child]:order-2"
        }`}
      >
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          {content.image && (
            <img
              src={content.image}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold">
            {content.heading?.en}
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {content.text?.en}
          </p>

          {content.button?.href && (
            <a
              href={content.button.href}
              className="mt-6 inline-block font-medium underline"
            >
              {content.button.label?.en}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}