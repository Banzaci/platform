import { useSettings } from "@/providers/SettingsProvider";
import { GlobalTheme, SectionTheme } from "@/types";

type HeroProps = {
  content: {
    heading?: { en?: string };
    text?: { en?: string };
    image?: {
      url: string;
      position?: {
        x: number;
        y: number;
      };
    };
    button?: {
      label?: { en?: string };
      href?: string;
    };
  };
  sectionTheme?: SectionTheme;
};

export default function Hero({ content, sectionTheme }: HeroProps) {
  const { globalTheme } = useSettings();
  return (
    <section
      className="relative min-h-150 overflow-hidden"
      style={{
        backgroundColor: sectionTheme?.backgroundColor,
        fontFamily: sectionTheme?.headingFontFamily,
        paddingTop: sectionTheme?.paddingTop,
        paddingBottom: sectionTheme?.paddingBottom,
      }}
    >
      {content.image?.url && (
        <img
          src={content.image.url}
          alt=""
          style={{
            objectPosition: `${content.image?.position?.x ?? 50}% ${content.image?.position?.y ?? 50}%`,
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 mx-auto flex min-h-150 max-w-6xl items-center px-6">
        <div className="max-w-2xl">
          <h1
            style={{
              color: sectionTheme?.primaryColor,
              fontSize: sectionTheme?.fontSize,
              fontFamily: sectionTheme?.headingFontFamily,
            }}
          >
            {content.heading?.en}
          </h1>

          {content.text?.en && (
            <p
              className="mt-6"
              style={{
                color: sectionTheme?.secondaryColor,
                fontFamily: sectionTheme?.fontFamily,
              }}
            >
              {content.text.en}
            </p>
          )}

          {content.button?.href && (
            <a
              href={content.button.href}
              className="mt-8 inline-block rounded-lg px-6 py-3"
              style={{
                color: globalTheme?.button?.textColor,
                backgroundColor: globalTheme?.button?.backgroundColor,
              }}
            >
              {content.button.label?.en}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}