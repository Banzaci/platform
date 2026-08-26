import { SectionTheme } from "@/types";

type Props = {
  content: {
    heading?: { en?: string };
    text?: { en?: string };
    button?: {
      label?: { en?: string };
      href?: string;
    };
  };
  sectionTheme?: SectionTheme;
};

export default function CTA({ content, sectionTheme }: Props) {
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
      <div className="mx-auto max-w-4xl rounded-3xl bg-black px-8 py-16 text-center text-white">
        <h2 className="text-4xl font-bold">
          {content.heading?.en}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
          {content.text?.en}
        </p>

        {content.button?.href && (
          <a
            href={content.button.href}
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-medium text-black"
          >
            {content.button.label?.en}
          </a>
        )}
      </div>
    </section>
  );
}