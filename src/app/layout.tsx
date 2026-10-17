import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Team Ops",
  description: "Internal requests, ownership, approvals and history for small teams.",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The unified prototype sets <html data-sidebar> before hydration (no flash of an
    // expanded sidebar); this tells React that attribute is expected. One level deep only.
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
