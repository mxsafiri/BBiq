import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bilboardiq.netlify.app';

export const metadata: Metadata = {
  title: {
    default: 'BillboardIQ — Outdoor Advertising Intelligence for Tanzania',
    template: '%s · BillboardIQ',
  },
  description:
    'Drop a pin anywhere in Dar es Salaam and get data-backed impressions, pricing, and a full billboard location analysis in seconds.',
  metadataBase: new URL(APP_URL),
  keywords: [
    'billboard advertising Tanzania',
    'outdoor advertising Dar es Salaam',
    'billboard pricing Tanzania',
    'OOH media intelligence',
    'billboard impressions calculator',
  ],
  authors: [{ name: 'BillboardIQ' }],
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'BillboardIQ',
    title: 'BillboardIQ — Outdoor Advertising Intelligence for Tanzania',
    description:
      'Drop a pin anywhere in Dar es Salaam and get data-backed impressions, pricing, and a full billboard location analysis in seconds.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BillboardIQ — Billboard Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillboardIQ — Outdoor Advertising Intelligence for Tanzania',
    description:
      'Drop a pin anywhere in Dar es Salaam and get data-backed impressions, pricing, and a full billboard location analysis in seconds.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
