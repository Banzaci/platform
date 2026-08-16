import { SectionTheme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
    text?: { en?: string };
    limit?: number;
  };
  theme?: SectionTheme;
};

export default function RoomGrid({ content, theme }: Props) {
  return (
    <section className="py-20"
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

        {content.text?.en && (
          <p className="mt-3 text-gray-600">
            {content.text.en}
          </p>
        )}

        {/* Room data kopplas in här */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-gray-100 p-8">
            Rooms will be loaded here
          </div>
        </div>
      </div>
    </section>
  );
}