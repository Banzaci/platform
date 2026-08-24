import { SectionTheme } from "@/types";

export function resolveSectionTheme(
  theme?: SectionTheme
) {
  return {
    // Section
    backgroundColor:
      theme?.backgroundColor,

    textColor:
      theme?.textColor,

    secondaryColor:
      theme?.secondaryColor,

    primaryColor:
      theme?.primaryColor,

    fontFamily:
      theme?.fontFamily,

    headingFontFamily:
      theme?.headingFontFamily ??
      theme?.fontFamily,

    fontSize:
      theme?.fontSize,

    // Card
    card_background_color:
      theme?.card?.backgroundColor,

    card_text_color:
      theme?.card?.textColor,

    card_secondary_color:
      theme?.card?.secondaryColor,

    card_border_color:
      theme?.card?.borderColor,

    card_radius:
      theme?.card?.borderRadius,

    card_padding:
      theme?.card?.padding,

    card_shadow:
      theme?.card?.shadow,

    // Button
    button_background:
      theme?.button?.backgroundColor ??
      theme?.primaryColor,

    button_text:
      theme?.button?.textColor,

    button_radius:
      theme?.button?.borderRadius,

    // Date selector
    date_background:
      theme?.dateSelector?.backgroundColor,

    date_text:
      theme?.dateSelector?.textColor,

    date_secondary:
      theme?.dateSelector?.secondaryColor,

    date_border:
      theme?.dateSelector?.borderColor,

    date_radius:
      theme?.dateSelector?.borderRadius,

    date_shadow:
      theme?.dateSelector?.shadow,

    date_width:
      theme?.dateSelector?.width,

    date_selected_background:
      theme?.dateSelector
        ?.selectedBackgroundColor ??
      theme?.primaryColor,

    date_selected_color:
      theme?.dateSelector?.selectedColor,
  };
}