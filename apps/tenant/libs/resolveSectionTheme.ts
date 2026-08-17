import { SectionTheme } from "@/types";

export function resolveSectionTheme( theme?: SectionTheme) {
  const textColor =
    theme?.textColor ?? "#111111";

  const secondaryColor =
    theme?.secondaryColor ?? "#6b7280";

  const cardTextColor =
    theme?.card?.textColor ??
    textColor;

  const cardSecondaryColor =
    theme?.card?.secondaryColor ??
    secondaryColor;

  return {
    textColor,
    secondaryColor,
    
    // Section
    backgroundColor: theme?.backgroundColor ?? "#ffffff",

    primaryColor:
      theme?.primaryColor ?? "#111111",

    fontFamily:
      theme?.fontFamily,

    headingFontFamily:
      theme?.headingFontFamily ??
      theme?.fontFamily,

    fontSize:
      theme?.fontSize,

    // Card
    cardTextColor,
    cardSecondaryColor,
    cardBackground:
      theme?.card?.backgroundColor ??
      "#ffffff",

    cardBorderColor:
      theme?.card?.borderColor ??
      "#e5e7eb",

    cardBorderRadius:
      theme?.card?.borderRadius ??
      "16px",

    cardPadding:
      theme?.card?.padding ??
      "24px",

    cardShadow:
      theme?.card?.shadow,

    // Button
    buttonBackground:
      theme?.button?.backgroundColor ??
      theme?.primaryColor ??
      "#111111",

    buttonTextColor:
      theme?.button?.textColor ??
      "#ffffff",

    buttonBorderRadius:
      theme?.button?.borderRadius ??
      "12px",

    // Date selector
    dateSelectorBackground:
      theme?.dateSelector?.backgroundColor ??
      "#ffffff",

    dateSelectorTextColor:
      theme?.dateSelector?.textColor ??
      theme?.textColor ??
      "#111111",

    dateSelectorSecondaryColor:
      theme?.dateSelector?.secondaryColor ??
      theme?.secondaryColor ??
      "#6b7280",

    dateSelectorBorderColor:
      theme?.dateSelector?.borderColor ??
      "#e5e7eb",

    dateSelectorBorderRadius:
      theme?.dateSelector?.borderRadius ??
      "16px",

    dateSelectorShadow:
      theme?.dateSelector?.shadow,

    dateSelectorWidth:
      theme?.dateSelector?.width ??
      "50%",

    dateSelectorSelectedBackground:
      theme?.dateSelector?.selectedBackgroundColor ??
      theme?.primaryColor ??
      "#111111",

    dateSelectorSelectedColor:
      theme?.dateSelector?.selectedColor ??
      "#ffffff",
  };
}