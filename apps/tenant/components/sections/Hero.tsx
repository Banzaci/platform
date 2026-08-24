import { SectionTheme } from "@/types";

type HeroProps = {
  content: {
    heading?: { en?: string };
    text?: { en?: string };
    image?: {
      url: string
    };
    button?: {
      label?: { en?: string };
      href?: string;
    };
  };
  theme?: SectionTheme;
};

export default function Hero({ content, theme }: HeroProps) {
  console.log('Hero theme')
  console.log(theme)
  return (
    <section className="relative min-h-150 overflow-hidden"
      style={{
          backgroundColor: theme?.backgroundColor,
          fontFamily: theme?.headingFontFamily,
          paddingTop: theme?.paddingTop,
          paddingBottom: theme?.paddingBottom,
        }}
      >
     {content.image?.url && (
      <img
        src={content.image.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    )}

      <div className="relative z-10 mx-auto flex min-h-150 max-w-6xl items-center px-6">
        <div className="max-w-2xl">
          <h1
            style={{
              color: theme?.primaryColor,
              fontSize: theme?.fontSize,
              fontFamily: theme?.headingFontFamily,
            }}    
          >
            {content.heading?.en}
          </h1>

          {content.text?.en && (
            <p className="mt-6" 
              style={{
                color: theme?.secondaryColor,
                fontFamily: theme?.fontFamily,
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
                color: theme?.button?.textColor,
                backgroundColor: theme?.button?.backgroundColor,
                fontFamily: theme?.fontFamily,
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