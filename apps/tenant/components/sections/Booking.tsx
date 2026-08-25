import { GlobalTheme, SectionTheme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
  };
  sectionTheme?: SectionTheme;
  globalTheme?: GlobalTheme;
};

export default function Booking({ content, sectionTheme }: Props) {
  return (
    <section
      style={{
            backgroundColor: sectionTheme?.backgroundColor,
            color: sectionTheme?.textColor,
            fontFamily: sectionTheme?.fontFamily,
            fontSize: sectionTheme?.fontSize,
            paddingTop: sectionTheme?.paddingTop,
            paddingBottom: sectionTheme?.paddingBottom,
          }}
      >
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-bold">
          {content.heading?.en}
        </h1>

        <div className="mt-10">
          {/* Befintlig booking-komponent */}
        </div>
      </div>
    </section>
  );
}