import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@hotel/providers";

export const metadata: Metadata = {
  title: {
    default: "Roominary — Build Your Hotel Website in Minutes",
    template: "%s | Roominary",
  },

  description:
    "Create a professional hotel website in minutes. Add rooms, manage bookings, customize your content and publish your hotel online — no coding required.",

  keywords: [
    "hotel website builder",
    "hotel website",
    "hotel booking system",
    "hotel website creator",
    "guesthouse website builder",
    "hotel management software",
    "online hotel booking",
    "accommodation website builder",
    "hotel booking website",
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
    title: "Roominary — Build Your Hotel Website in Minutes",
    description:
      "Create your hotel website, add rooms and start taking bookings — all from one simple platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Roominary — Build your hotel website in minutes",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Roominary — Build Your Hotel Website in Minutes",
    description:
      "Create your hotel website, add rooms and start taking bookings — no coding required.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}