import { SectionTheme } from "@/types";

export function resolveSectionTheme(
  theme?: SectionTheme
) {
  const textColor =
    theme?.textColor ?? "#111111";

  const secondaryColor =
    theme?.secondaryColor ?? "#6b7280";

  return {
    // Section
    backgroundColor:
      theme?.backgroundColor ?? "#ffffff",

    textColor,

    secondaryColor,

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
    card_background_color:
      theme?.card?.backgroundColor ??
      "#ffffff",

    card_text_color:
      theme?.card?.textColor ??
      textColor,

    card_secondary_color:
      theme?.card?.secondaryColor ??
      secondaryColor,

    card_border_color:
      theme?.card?.borderColor ??
      "#e5e7eb",

    card_radius:
      theme?.card?.borderRadius ??
      "16px",

    card_padding:
      theme?.card?.padding ??
      "24px",

    card_shadow:
      theme?.card?.shadow,

      
    // Button
    button_background:
      theme?.button?.backgroundColor ??
      theme?.primaryColor ??
      "#111111",

    button_text:
      theme?.button?.textColor ??
      "#ffffff",

    button_radius:
      theme?.button?.borderRadius ??
      "12px",

    // Date selector
    date_background:
      theme?.dateSelector?.backgroundColor ??
      "#ffffff",

    date_text:
      theme?.dateSelector?.textColor ??
      textColor,

    date_secondary:
      theme?.dateSelector?.secondaryColor ??
      secondaryColor,

    date_border:
      theme?.dateSelector?.borderColor ??
      "#e5e7eb",

    date_radius:
      theme?.dateSelector?.borderRadius ??
      "16px",

    date_shadow:
      theme?.dateSelector?.shadow,

    date_width:
      theme?.dateSelector?.width ??
      "50%",

    date_selected_background:
      theme?.dateSelector?.selectedBackgroundColor ??
      theme?.primaryColor ??
      "#111111",

    date_selected_color:
      theme?.dateSelector?.selectedColor ??
      "#ffffff",
  };
}