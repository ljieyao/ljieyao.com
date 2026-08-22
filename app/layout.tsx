import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "./components/site-nav";
import { SiteFooter } from "./components/site-footer";
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
  title: "JY Liu — Full Stack Engineer",
  description:
    "JY Liu is a full stack web & mobile app engineer based in Malaysia, building products across web, mobile, and cloud. Portfolio, case studies, and writing at ljieyao.com.",
  metadataBase: new URL("https://ljieyao.com"),
  alternates: {
    types: {
      "application/rss+xml": "https://ljieyao.com/rss.xml",
    },
  },
  openGraph: {
    title: "JY Liu — Full Stack Engineer",
    description:
      "Full stack web & mobile app engineer based in Malaysia. Portfolio, case studies, and writing at ljieyao.com.",
    url: "https://ljieyao.com",
    siteName: "JY Liu",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JY Liu — Full Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JY Liu — Full Stack Engineer",
    description:
      "Full stack web & mobile app engineer based in Malaysia. Portfolio, case studies, and writing at ljieyao.com.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
