import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { QueryProvider } from "./providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://richardprab-portfolio.vercel.app";
const OG_DESCRIPTION =
  "Data and product. A portfolio surveyed as an expedition: four route legs, ten documented sites, one summit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Richard Prabowo — The Ascent",
  description: OG_DESCRIPTION,
  // Link-preview card (LinkedIn, Slack, iMessage, X, …). The image is the
  // hero thumbnail rendered from the site itself.
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Richard Prabowo — The Ascent",
    description: OG_DESCRIPTION,
    siteName: "Richard Prabowo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Richard Prabowo — The Ascent portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Richard Prabowo — The Ascent",
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        {/* Vercel Web Analytics: privacy-friendly visitor + page-view
            counts (no cookies). Only sends data once enabled on the project
            in the Vercel dashboard → Analytics. */}
        <Analytics />
      </body>
    </html>
  );
}
