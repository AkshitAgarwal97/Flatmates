import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Nav } from "@/components/Nav";
import { OwnerName } from "@/components/OwnerName";
import { Providers } from "@/components/Providers";
import { JsonLd } from "@/components/JsonLd";
import { NavProgress } from "@/components/NavProgress";
import { CITIES } from "@/lib/hubs";
import {
  DEFAULT_OG,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  absoluteUrl,
  cityPath,
  organizationJsonLd,
  softwareJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — House, apartment, room & roommate in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Find a house, apartment, room, or roommate in Indian metro cities. Lifestyle matching, private in-app chat, ₹0 brokerage.",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  keywords: SITE_KEYWORDS,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Flatmates" },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
      "hi-IN": `${SITE_URL}/hi`,
      "x-default": SITE_URL,
    },
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
      "text/plain": `${SITE_URL}/llms.txt`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Zero brokerage house, apartment, room & roommate`,
    description:
      "India metros · house, apartment, room & roommate · lifestyle match · in-app chat · ₹0 brokerage.",
    images: [{ url: absoluteUrl(DEFAULT_OG), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Zero brokerage house, apartment, room & roommate`,
    description: "Find a house, apartment, room, or roommate in Indian metros. ₹0 brokerage. Private chat.",
    images: [absoluteUrl(DEFAULT_OG)],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
};

const THEME_BOOT = `(function(){try{var t=localStorage.getItem("flatmates-theme");if(t!=="light"&&t!=="dark")t="light";var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);}catch(e){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`light ${inter.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <Providers>
          <NavProgress />
          <JsonLd data={[organizationJsonLd(), websiteJsonLd(), softwareJsonLd()]} />
          <Suspense fallback={<header className="glass sticky top-0 z-40 mx-auto mt-4 h-14 w-[min(1120px,calc(100%-1.5rem))] rounded-2xl" />}>
            <Nav />
          </Suspense>
          <main className="mx-auto w-[min(1120px,calc(100%-1.5rem))] pb-16 pt-8">{children}</main>
          <footer className="mx-auto w-[min(1120px,calc(100%-1.5rem))] space-y-4 border-t border-line pb-10 pt-6 text-sm muted">
            <p>
              <span className="font-semibold text-fg">Flatmates.co.in</span> is the free way to find a house,
              apartment, room, or roommate in Indian metro cities. We are not a broker. Phone numbers stay hidden; chat
              is in-app.
            </p>
            <p>
              Operated by <OwnerName /> · India ·{" "}
              <Link href="/contact" className="kicker hover:underline">
                Contact support
              </Link>{" "}
              ({SUPPORT_EMAIL})
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <Link href="/about" className="hover:text-teal-700 dark:hover:text-teal-200">About</Link>
              <Link href="/contact" className="hover:text-teal-700 dark:hover:text-teal-200">Support</Link>
              <Link href="/directory" className="hover:text-teal-700 dark:hover:text-teal-200">Directory</Link>
              <Link href="/sitemap.xml" className="hover:text-teal-700 dark:hover:text-teal-200">Sitemap</Link>
              <Link href="/feed.xml" className="hover:text-teal-700 dark:hover:text-teal-200">RSS</Link>
              <Link href="/flatmates" className="hover:text-teal-700 dark:hover:text-teal-200">Metro cities</Link>
              <Link href="/flat" className="hover:text-teal-700 dark:hover:text-teal-200">Find a flat</Link>
              <Link href="/apartments" className="hover:text-teal-700 dark:hover:text-teal-200">Apartments</Link>
              <Link href="/houses" className="hover:text-teal-700 dark:hover:text-teal-200">Houses</Link>
              <Link href="/rooms" className="hover:text-teal-700 dark:hover:text-teal-200">Rooms</Link>
              <Link href="/rent" className="hover:text-teal-700 dark:hover:text-teal-200">Place to rent</Link>
              <Link href="/roommates" className="hover:text-teal-700 dark:hover:text-teal-200">Roommates</Link>
              <Link href="/hi" className="hover:text-teal-700 dark:hover:text-teal-200">हिन्दी</Link>
              <Link href="/browse" className="hover:text-teal-700 dark:hover:text-teal-200">Browse</Link>
              <Link href="/guides" className="hover:text-teal-700 dark:hover:text-teal-200">Guides</Link>
              <Link href="/pricing" className="hover:text-teal-700 dark:hover:text-teal-200">Pricing</Link>
              <Link href="/listings/new" className="hover:text-teal-700 dark:hover:text-teal-200">Post listing</Link>
              {CITIES.map((city) => (
                <Link key={city} href={cityPath(city)} className="hover:text-teal-700 dark:hover:text-teal-200">
                  {city}
                </Link>
              ))}
            </div>
            <p className="text-center text-[11px] muted-2">
              Ads help keep the platform free · UPI boosts optional · {SITE_URL.replace("https://", "")}
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
