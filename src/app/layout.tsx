import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AmplitudeProvider } from "@/components/amplitude/AmplitudeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kitehr.co"),
  title: "KiteHR — Applicant Tracking System",
  description:
    "A free applicant tracking system with optional AI-powered features for faster hiring.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KiteHR — Applicant Tracking System",
    description:
      "A free applicant tracking system with optional AI-powered features for faster hiring.",
    url: "https://kitehr.co",
    siteName: "KiteHR",
    images: [
      {
        url: "https://kitehr.co/KiteHR.png",
        width: 1080,
        height: 1080,
        alt: "KiteHR — Hire without limits. Free, forever.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KiteHR — Applicant Tracking System",
    description:
      "A free applicant tracking system with optional AI-powered features for faster hiring.",
    images: ["https://kitehr.co/KiteHR.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <AmplitudeProvider />
        <Analytics />
      </body>
    </html>
  );
}
