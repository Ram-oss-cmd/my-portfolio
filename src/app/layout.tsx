import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter,
  Noto_Sans_Devanagari,
} from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/data/content";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: "variable",
  display: "swap",
});

const title =
  "Shreeram Chaudhary — Software for hydropower, finance and automation";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: "%s — Shreeram Chaudhary",
  },
  description: site.description,
  applicationName: "Shreeram Chaudhary",
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    "Shreeram Chaudhary",
    "hydropower software",
    "Nepal software developer",
    "loan system",
    "VBA",
    "Linux",
    "IoT automation",
    "Selang SHP",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F5EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${notoSansDevanagari.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
