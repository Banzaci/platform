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
  return (
    <section className="relative min-h-150 overflow-hidden"
      style={{
          backgroundColor: theme?.backgroundColor,
          fontFamily: theme?.fontFamily,
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
          <h1 className="text-5xl font-bold tracking-tight"
            style={{
              color: theme?.primaryColor,
              fontSize: theme?.fontSize,
            }}    
          >
            {content.heading?.en}
          </h1>

          {content.text?.en && (
            <p className="mt-6 text-xl" 
              style={{
                color: theme?.secondaryColor,
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