import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { UserSync } from "@/components/user-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Bakery — Your Personal Baking Journal";
const description =
  "The professional-grade toolkit for home bakers. Store recipes, track variations with precision, and master the math behind every loaf.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thebakery.app"),
  title: {
    default: title,
    template: "%s | Bakery",
  },
  description,
  keywords: [
    "baking",
    "recipes",
    "baker's math",
    "baker's percentages",
    "sourdough",
    "bread baking",
    "recipe journal",
    "ingredient substitutions",
    "home baker",
    "baking tools",
  ],
  openGraph: {
    type: "website",
    siteName: "Bakery",
    title,
    description,
    url: "https://www.thebakery.app",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <UserSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
