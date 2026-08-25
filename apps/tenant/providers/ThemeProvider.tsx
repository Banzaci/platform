import { GlobalTheme } from "@/types";
import type { CSSProperties, ReactNode } from "react";

export default function ThemeProvider({
  globalTheme,
  children,
}: {
  globalTheme: GlobalTheme;
  children: ReactNode;
}) {
  const style = {
    "--background": globalTheme?.global?.backgroundColor,
    "--text": globalTheme?.global?.textColor,
    "--primary": globalTheme?.global?.primaryColor,
    "--secondary": globalTheme?.global?.secondaryColor,
    // "--font-family": globalTheme.global.fontFamily,
    // "--heading-font-family": globalTheme.global.headingFontFamily,
    // "--font-size": globalTheme.global.fontSize,
  } as CSSProperties;

  return (
    <div className="site-theme min-h-full" style={style}>
      {children}
    </div>
  );
}