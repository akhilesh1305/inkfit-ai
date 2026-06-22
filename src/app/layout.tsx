import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { getSiteUrl } from "@/lib/site";
import { InkCursor } from "@/components/cursor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "InkFit AI — AI Content Studio",
    template: "%s | InkFit AI",
  },
  description:
    "Create LinkedIn posts, blogs, SEO pages & social content with AI. Free to start — built for founders, creators & agencies.",
  keywords: ["AI content", "LinkedIn growth", "SEO toolkit", "blog writer", "social media AI", "InkFit AI"],
  applicationName: "InkFit AI",
  openGraph: {
    title: "InkFit AI — AI Content Studio",
    description:
      "Create LinkedIn posts, blogs, SEO pages & social content with AI. Free to start.",
    type: "website",
    siteName: "InkFit AI",
    locale: "en_US",
    url: getSiteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "InkFit AI — AI Content Studio",
    description:
      "Create LinkedIn posts, blogs, SEO pages & social content with AI. Free to start.",
  },
  icons: {
    icon: "/inkfit-logo.png",
    apple: "/inkfit-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <InkCursor />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
