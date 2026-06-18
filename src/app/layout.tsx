import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "InkFit AI | AI Content Studio for Blogs, Social & SEO",
  description:
    "Generate LinkedIn posts, blogs, images, and SEO content in minutes. Try InkFit AI free — built for founders, creators, agencies, and marketing teams.",
  keywords: ["AI content", "LinkedIn growth", "SEO toolkit", "blog writer", "social media AI", "InkFit AI"],
  openGraph: {
    title: "InkFit AI | AI Content Studio",
    description: "Create content that fits your brand — powered by AI.",
    type: "website",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
