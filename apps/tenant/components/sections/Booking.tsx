import { SectionTheme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
  };
  theme?: SectionTheme;
};

export default function Booking({ content, theme }: Props) {
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