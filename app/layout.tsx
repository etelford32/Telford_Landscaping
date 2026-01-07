import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "Telford Landscapes | Professional Landscaping in Auburn, Roseville & Granite Bay",
  description: "Expert landscaping and handyman services in Auburn, Roseville, Granite Bay, Lincoln, and Loomis, CA. Transform your outdoor space with Telford Projects LLC. Licensed and insured.",
  keywords: "landscaping Auburn CA, landscape design Roseville, Granite Bay landscaping, Lincoln CA landscaper, Loomis landscaping services, professional landscaping, yard transformation, drought-tolerant landscaping, native California plants",
  authors: [{ name: "Telford Projects LLC" }],
  openGraph: {
    title: "Telford Landscapes | Professional Landscaping Services",
    description: "Transform your outdoor space with expert landscaping services in Auburn, Roseville, Granite Bay, Lincoln, and Loomis, CA.",
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
