import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@hotel/providers";
import { getTenant } from "@/libs/tenant";
import Navigation from "./Navigation";
import EditorControls from "./(protected)/components/EditorControls";
import ThemeProvider from "@/providers/ThemeProvider";
import DevLabelToggle from "@/helpers/DevLabelToggle";

export const metadata: Metadata = {
  title: {
    default: "Roominary — Find your perfect stay",
    template: "%s | Roominary",
  },
  description:
    "Search and book unique hotels, guesthouses and long-term stays worldwide. Tell us what you're looking for in plain language — surf spots, coworking, beachfront, budget — and we'll find your perfect stay.",
  keywords: [
    "hotel booking",
    "long term stay",
    "digital nomad accommodation",
    "surf hotels",
    "coworking accommodation",
    "monthly rentals",
    "vacation rentals",
  ],
  authors: [{ name: "Roominary" }],
  creator: "Roominary",
  publisher: "Roominary",
  metadataBase: new URL("https://roominary.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roominary.com",
    siteName: "Roominary",
    title: "Roominary — Find your perfect stay",
    description:
      "Search and book unique hotels, guesthouses and long-term stays worldwide using natural language.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Roominary — Find your perfect stay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roominary — Find your perfect stay",
    description:
      "Search and book unique hotels, guesthouses and long-term stays worldwide using natural language.",
    images: ["/og-image.png"],
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
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏨</text></svg>",
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getTenant();
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ThemeProvider theme={tenant.tenant.theme}>
            <Navigation data={tenant} />
            <EditorControls
              tenantId={tenant.tenant.id}
              theme={tenant.tenant.theme}
            />
            {children}
            <DevLabelToggle />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}