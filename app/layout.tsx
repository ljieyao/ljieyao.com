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
  title: "JY Liu — Solutions Architect | Technical Lead | Senior Full-Stack Engineer",
  description:
    "Solutions Architect & Technical Lead (12+ years) — enterprise, fintech & integration-heavy platforms. VFS Global consular systems, CXM Direct payments (235k+ users, 12 PSPs), AI-enabled product engineering. MBA (Business Analytics), University of Malaya. Based in Kuala Lumpur.",
  metadataBase: new URL("https://ljieyao.com"),
  alternates: {
    types: {
      "application/rss+xml": "https://ljieyao.com/rss.xml",
    },
  },
  openGraph: {
    title: "JY Liu — Solutions Architect | Technical Lead",
    description:
      "Solutions Architect & Technical Lead — enterprise, fintech & payments at scale, AI-enabled workflows. Based in Kuala Lumpur.",
    url: "https://ljieyao.com",
    siteName: "JY Liu",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JY Liu — Solutions Architect | Technical Lead",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JY Liu — Solutions Architect | Technical Lead",
    description:
      "Solutions Architect & Technical Lead — enterprise, fintech & payments at scale, AI-enabled workflows. Based in Kuala Lumpur.",
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
