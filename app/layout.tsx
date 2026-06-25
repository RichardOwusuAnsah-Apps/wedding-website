import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  EB_Garamond,
  Jost,
  Tangerine,
} from "next/font/google";
import "./globals.css";

// Display headings
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body copy
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Labels / nav / buttons / eyebrows
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Script flourish (monogram, names)
const tangerine = Tangerine({
  variable: "--font-tangerine",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Richie & Shula — Our Wedding",
  description:
    "Join us as Richie & Shula celebrate their wedding on 24 October 2026 in Maryland, USA. Timeless · Elegant · Effortless.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${ebGaramond.variable} ${jost.variable} ${tangerine.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
