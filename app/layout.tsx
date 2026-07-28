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

export const metadata: Metadata = {
  title: "Richard Prabowo — The Ascent",
  description:
    "Data and product. A portfolio surveyed as an expedition: four route legs, ten documented sites, one summit.",
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
