import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AmplitudeProvider } from "@/components/amplitude/AmplitudeProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PP6J5J3W');`}
        </Script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GGTSR55JKB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GGTSR55JKB');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PP6J5J3W"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <AmplitudeProvider />
        <Analytics />
      </body>
    </html>
  );
}
