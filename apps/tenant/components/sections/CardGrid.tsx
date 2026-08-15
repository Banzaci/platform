import { Theme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
    items?: {
      title?: { en?: string };
      text?: { en?: string };
      image?: string;
    }[];
  };
  theme?: Theme;
};

export default function CardGrid({ content, theme }: Props) {
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
        <h2 className="text-3xl font-bold">
          {content.heading?.en}
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.items?.map((item, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-2xl border"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold">
                  {item.title?.en}
                </h3>

                <p className="mt-2 text-gray-600">
                  {item.text?.en}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}