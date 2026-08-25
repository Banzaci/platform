import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@hotel/providers";
import { getTenant } from "@/libs/tenant";
import Navigation from "./Navigation";
import EditorControls from "./(protected)/components/EditorControls";
import ThemeProvider from "@/providers/ThemeProvider";
import DevLabelToggle from "@/helpers/DevLabelToggle";
import { GlobalTheme } from "@/types";


export async function generateMetadata(): Promise<Metadata> {
  const data = await getTenant();

  const tenant = data.tenant;

  const title = tenant.name;

  const description =
    tenant.short_description ||
    `Book your stay at ${tenant.name}.`;

  const baseUrl = tenant.custom_domain
    ? `https://${tenant.custom_domain}`
    : `https://${tenant.subdomain}.miche.se`;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },

    description,

    authors: [
      {
        name: tenant.name,
      },
    ],

    creator: tenant.name,
    publisher: tenant.name,

    metadataBase: new URL(baseUrl),

    alternates: {
      canonical: "/",
    },

    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseUrl,
      siteName: tenant.name,
      title,
      description,

      images: tenant.logo_url
        ? [
            {
              url: tenant.logo_url,
              alt: tenant.name,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: tenant.logo_url
        ? [tenant.logo_url]
        : [],
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    icons: tenant.logo_url
      ? {
          icon: tenant.logo_url,
        }
      : {
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏨</text></svg>",
        },
  };
}

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   display: "swap",
// }); ${inter.variable} 

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getTenant();
  const fonts = tenant.fonts ?? [];
  const globalTheme = tenant.tenant.theme as GlobalTheme;
  console.log(JSON.stringify(globalTheme))
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <head>
        <style>
          {fonts
            .map(
              (font) => `
                @font-face {
                  font-family: "${font.name}";
                  src: url("${font.url}") format("${font.format}");
                  font-display: swap;
                }
              `
            )
            .join("\n")}
        </style>
      </head>
      <body className="min-h-full flex flex-col"
        style={{
          backgroundColor: globalTheme?.global?.backgroundColor,
          color: globalTheme?.global?.textColor,
          fontFamily: globalTheme?.fonts?.body,
          // fontSize: globalTheme.global.fontSize,
        }}
      >
        <Providers>
          <ThemeProvider globalTheme={globalTheme}>
            <Navigation tenant={tenant} />
            <EditorControls
              tenantId={tenant.tenant.id}
              globalTheme={tenant.tenant.theme}
              fonts={fonts}
            />
            {children}
            <DevLabelToggle />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}