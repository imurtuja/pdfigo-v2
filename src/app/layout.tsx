import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pdfigo.murtuja.in"),
  title: {
    default: "PDFigo by Murtuja - Free Online PDF Tools",
    template: "%s | PDFigo by Murtuja",
  },
  description:
    "Merge, split, compress, convert, rotate, watermark - all running locally in your browser. Fast, free, and private. No uploads. No servers. Built by Murtuja.",
  keywords: [
    "PDF tools", "merge PDF", "split PDF", "compress PDF", "PDF to image",
    "image to PDF", "rotate PDF", "watermark PDF", "free PDF tools",
    "online PDF editor", "PDFigo", "Murtuja", "private PDF tools",
    "browser PDF tools", "no upload PDF",
  ],
  authors: [{ name: "Murtuja", url: "https://murtuja.in" }],
  creator: "Murtuja",
  publisher: "PDFigo by Murtuja",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdfigo.murtuja.in",
    siteName: "PDFigo by Murtuja",
    title: "PDFigo by Murtuja - Free Online PDF Tools",
    description:
      "Every PDF tool you'll ever need. Merge, split, compress, convert all running locally in your browser. Your files never leave your device.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFigo by Murtuja - Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFigo by Murtuja - Free Online PDF Tools",
    description:
      "Every PDF tool you'll ever need. Fast, free, and 100% private.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://pdfigo.murtuja.in",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] antialiased pb-24 md:pb-0">
        <Navbar />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
