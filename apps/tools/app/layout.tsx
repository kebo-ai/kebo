import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { FingerprintProvider } from "@/providers/fingerprint-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/toaster";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Divvy - Split the Bill",
  description: "Split the bill, not the friendship.",
  openGraph: {
    images: [{ url: "/divvy-og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <ThemeProvider forcedTheme="dark" attribute="class">
          <QueryProvider>
            <FingerprintProvider>
              {children}
              <Toaster />
            </FingerprintProvider>
          </QueryProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
