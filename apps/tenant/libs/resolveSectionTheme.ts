import { GlobalTheme, SectionTheme } from "@/types";

export function resolveSectionTheme(
  globalTheme?: GlobalTheme,
  sectionTheme?: SectionTheme
) {
  return {
    // Section
    backgroundColor:
      sectionTheme?.backgroundColor,

    textColor:
      sectionTheme?.textColor,

    secondaryColor:
      sectionTheme?.secondaryColor,

    primaryColor:
      sectionTheme?.primaryColor,

    fontFamily:
      sectionTheme?.fontFamily,

    paddingTop:
      sectionTheme?.paddingTop,

    paddingBottom:
      sectionTheme?.paddingBottom,

    headingFontFamily:
      sectionTheme?.headingFontFamily,

    fontSize:
      sectionTheme?.fontSize,

    // Card
    card_background_color:
      globalTheme?.card?.backgroundColor,

    card_text_color:
      globalTheme?.card?.textColor,

    card_secondary_color:
      globalTheme?.card?.secondaryColor,

    card_border_color:
      globalTheme?.card?.borderColor,

    card_radius:
      globalTheme?.card?.borderRadius,

    card_padding:
      globalTheme?.card?.padding,

    card_shadow:
      globalTheme?.card?.shadow,

    // Button
    button_background:
      globalTheme?.button?.backgroundColor ??
      sectionTheme?.primaryColor,

    button_text:
      globalTheme?.button?.textColor,

    button_radius:
      globalTheme?.button?.borderRadius,

    // Date selector
    date_background:
      globalTheme?.dateSelector?.backgroundColor,

    date_text:
      globalTheme?.dateSelector?.textColor,

    date_secondary:
      globalTheme?.dateSelector?.secondaryColor,

    date_border:
      globalTheme?.dateSelector?.borderColor,

    date_radius:
      globalTheme?.dateSelector?.borderRadius,

    date_shadow:
      globalTheme?.dateSelector?.shadow,

    date_width:
      globalTheme?.dateSelector?.width,

    date_selected_background:
      globalTheme?.dateSelector?.selectedBackgroundColor,

    date_selected_color:
      globalTheme?.dateSelector?.selectedColor,
  };
}