import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://telfordlandscapes.com"),
  title: "Telford Landscaping | Estate Landscape Design-Build — Granite Bay, Loomis, Sacramento Foothills",
  description: "Estate-scale landscape design-build for Granite Bay, Loomis, Auburn, Roseville, and the Sacramento foothills. Heavy hardscape, mature tree installation, and heritage landscapes. Built by hand, designed by science, meant to outlast us.",
  keywords: "estate landscape design Granite Bay, Loomis landscape design-build, Sacramento foothills landscaping, mature tree installation, heavy hardscape, retaining walls, heritage landscape, native California plants, drought-tolerant design",
  authors: [{ name: "Elliot Telford" }],
  openGraph: {
    title: "Telford Landscaping | Estate Landscape Design-Build",
    description: "Landscapes designed to be more beautiful in thirty years than they are the day we plant them. Granite Bay, Loomis, and the Sacramento foothills.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
