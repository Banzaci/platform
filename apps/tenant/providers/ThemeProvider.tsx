import { SectionTheme } from "@/types";
import type { CSSProperties, ReactNode } from "react";

export default function ThemeProvider({
  theme,
  children,
}: {
  theme: SectionTheme;
  children: ReactNode;
}) {
  const style = {
    "--background": theme.backgroundColor,
    "--text": theme.textColor,
    "--primary": theme.primaryColor,
    "--secondary": theme.secondaryColor,
    "--font-family": theme.fontFamily,
    "--heading-font-family": theme.headingFontFamily,
    "--font-size": theme.fontSize,
  } as CSSProperties;

  return (
    <div className="site-theme min-h-full" style={style}>
      {children}
    </div>
  );
}