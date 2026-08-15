import { Theme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
    items?: {
      icon?: string;
      title?: { en?: string };
      text?: { en?: string };
    }[];
  };
  theme?: Theme;
};

export default function Amenities({ content, theme }: Props) {
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

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {content.items?.map((item, index) => (
            <div key={index}>
              <div className="mb-4 text-2xl">✦</div>

              <h3 className="text-xl font-semibold">
                {item.title?.en}
              </h3>

              <p className="mt-2 text-gray-600">
                {item.text?.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}