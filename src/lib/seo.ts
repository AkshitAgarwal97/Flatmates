import type { Metadata } from "next";
import type { Listing } from "@/lib/types";
import { CITIES, CITY_ALIAS_TO_CANONICAL, HUBS } from "@/lib/hubs";

export const SITE_URL = "https://www.flatmates.co.in";
export const SITE_NAME = "Flatmates.co.in";
export const SITE_OWNER_NAME = "Akshi";
export const SUPPORT_EMAIL = "support@flatmates.co.in";
export const DEFAULT_OG = "/og.svg";

export const SITE_KEYWORDS = [
  "flatmates",
  "flat",
  "flats in india",
  "find a flat",
  "flatmates india",
  "find flatmate",
  "room for rent",
  "rooms for rent",
  "house for rent",
  "house for rent in india",
  "apartment for rent",
  "apartments for rent in india",
  "place to rent",
  "place to rent in india",
  "rent a house",
  "rent an apartment",
  "roommate",
  "roommates",
  "find a roommate",
  "housemate",
  "zero brokerage",
  "share room",
  "roommates india",
  "flat and flatmates",
  "PG alternative",
  "paying guest alternative",
  "1 bhk for rent",
  "2 bhk for rent",
  "compatible flatmate",
  "veg flatmate",
  "female flatmates",
  "female roommate",
  "किराये का मकान",
  "फ्लैट किराए पर",
  "रूममेट",
  ...CITIES.map((c) => `${c} flatmates`),
  ...CITIES.map((c) => `flat in ${c}`),
  ...CITIES.map((c) => `apartment for rent ${c}`),
  ...CITIES.map((c) => `house for rent ${c}`),
  ...CITIES.map((c) => `roommate ${c}`),
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function citySlug(city: string): string {
  return slugify(city);
}

export function localitySlug(locality: string): string {
  return slugify(locality);
}

export function findCityBySlug(slug: string) {
  const key = slug.toLowerCase();
  const direct = CITIES.find((c) => citySlug(c) === slug || c.toLowerCase() === key);
  if (direct) return direct;
  const aliased = CITY_ALIAS_TO_CANONICAL[slug] || CITY_ALIAS_TO_CANONICAL[citySlug(slug)];
  return aliased ? CITIES.find((c) => c === aliased) : undefined;
}

export function findHubBySlugs(cityParam: string, localityParam?: string) {
  const city = findCityBySlug(cityParam);
  if (!city) return null;
  if (!localityParam) {
    return { city, locality: null as string | null, hubs: HUBS.filter((h) => h.city === city) };
  }
  const hub = HUBS.find((h) => h.city === city && localitySlug(h.locality) === localityParam);
  if (!hub) return null;
  return { city, locality: hub.locality, hubs: [hub] };
}

export function cityPath(city: string): string {
  return `/flatmates/${citySlug(city)}`;
}

export function localityPath(city: string, locality: string): string {
  return `/flatmates/${citySlug(city)}/${localitySlug(locality)}`;
}

export function guidePath(slug: string): string {
  return `/guides/${slug}`;
}

export function listingSlug(title: string, locality: string, id: string): string {
  return `${slugify(title)}-in-${slugify(locality || "india")}-${id.slice(-6)}`;
}

/** Returns the public URL for a listing — uses slug when available, falls back to ID */
export function listingPath(listing: Pick<Listing, "id" | "slug">): string {
  return `/listings/${listing.slug || listing.id}`;
}

export function pageMetadata({
  title,
  description,
  path = "/",
  keywords = SITE_KEYWORDS,
  noIndex = false,
  image = DEFAULT_OG,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image);
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        "en-IN": path === "/hi" ? SITE_URL : url,
        "hi-IN": absoluteUrl("/hi"),
        "x-default": path === "/hi" ? SITE_URL : url,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
        },
  };
}

export type FaqItem = { q: string; a: string };

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Find a house, apartment, room, or roommate in India",
    serviceType: "Roommate matching and zero-brokerage rentals",
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: { "@type": "Country", name: "India" },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR", description: "₹0 brokerage" },
    url: SITE_URL,
    audience: { "@type": "Audience", audienceType: "People searching for a place to rent or a roommate in India" },
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "RealEstateApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description:
      "Free India site to rent a house, apartment, or room and find a compatible roommate or flatmate. Zero brokerage, private chat.",
    inLanguage: ["en-IN", "hi-IN"],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description:
      "Zero-brokerage houses, apartments, rooms, and roommate / flatmate matching across Indian metro cities. Lifestyle matching, private in-app chat, no phone leaks.",
    knowsAbout: [
      "flatmates",
      "roommates",
      "house for rent",
      "apartment for rent",
      "room for rent",
      "zero brokerage India",
    ],
    areaServed: CITIES.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "Country", name: "India" },
    })),
    sameAs: [`${SITE_URL}/about`, SITE_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Find a house, apartment, room, or compatible roommate / flatmates across Indian metro cities — ₹0 brokerage, lifestyle matching, private in-app chat.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/browse?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

export function listingJsonLd(listing: Listing) {
  const modeLabel =
    listing.mode === "seeker" ? "Looking for room / flatmates" : listing.mode === "owner" ? "Entire property for rent" : "Room share";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(listingPath(listing)),
    datePosted: listing.createdAt,
    image: listing.images?.length ? listing.images : [absoluteUrl(DEFAULT_OG)],
    offers: {
      "@type": "Offer",
      price: listing.rent,
      priceCurrency: "INR",
      availability: listing.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.locality,
      addressRegion: listing.city,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Listing mode", value: modeLabel },
      { "@type": "PropertyValue", name: "Brokerage", value: "₹0" },
      { "@type": "PropertyValue", name: "Deposit", value: `₹${listing.deposit}` },
    ],
  };
}

export function cityFaqs(city: string): FaqItem[] {
  return [
    {
      q: `How do I find flatmates in ${city} without a broker?`,
      a: `On Flatmates.co.in you browse or post rooms and seeker profiles in ${city} for free. Matching uses diet, gender preference, WFH vs office, washroom, and habits. Chat stays in-app so phone numbers are never shown publicly. Brokerage is always ₹0.`,
    },
    {
      q: `Can I rent a house or apartment in ${city}, not only a roommate?`,
      a: `Yes. Owners list entire homes and 1/2/3 BHK apartments in ${city}. Room shares and roommate/seeker profiles are listed separately. Open Browse or the house/apartment landings — they use the same ${city} inventory.`,
    },
    {
      q: `Is Flatmates.co.in free for ${city} listings?`,
      a: `Yes. Creating listings, browsing, lifestyle matching, and in-app chat are free. Optional UPI boosts exist later if you want more visibility; core matching stays free.`,
    },
    {
      q: `What areas of ${city} are covered?`,
      a: `We focus on major IT and urban hubs in ${city}. Open a locality page for micro-markets like those listed under ${city} hubs, or use Browse with a Maps pin for a 25 km radius.`,
    },
    {
      q: `Can I filter for veg or female-only flatmates in ${city}?`,
      a: `Yes. Every listing and seeker profile captures lifestyle tags including diet (veg / Jain / non-veg), gender preference, pets, guests, and washroom type so you can shortlist compatible people before chatting.`,
    },
    {
      q: `${city} में फ्लैट या फ्लैटमेट बिना ब्रोकर के कैसे ढूंढें?`,
      a: `Flatmates.co.in पर ${city} के रूम, पूरे फ्लैट और फ्लैटमेट मुफ्त में देखें या पोस्ट करें। ब्रोकरेज हमेशा ₹0 है। फोन नंबर छिपे रहते हैं; चैट इन-ऐप है।`,
    },
  ];
}

export function localityFaqs(city: string, locality: string): FaqItem[] {
  return [
    {
      q: `Are there rooms for rent in ${locality}, ${city} without brokerage?`,
      a: `Yes. Flatmates.co.in lists room shares, entire flats, and people looking for flatmates in ${locality}, ${city}. Owners and tenants post directly — brokerage is always ₹0.`,
    },
    {
      q: `How do I find a room for rent in ${locality}?`,
      a: `Open this locality page or Browse filtered to ${city}. You will see room shares, entire apartments/houses, and people looking for a roommate — all ₹0 brokerage.`,
    },
    {
      q: `How does flatmate matching work in ${locality}?`,
      a: `Each profile includes budget, diet, smoking/drinking, occupation, schedule, pets, and washroom preferences. You see a compatibility score with green matches and amber warnings before you chat.`,
    },
    {
      q: `Is my phone number safe when contacting flatmates in ${locality}?`,
      a: `Phone numbers are hidden. All contact happens through private in-app chat with report/block tools. You decide if and when to share personal details.`,
    },
    {
      q: `Should I choose a PG or a flatmate share in ${locality}?`,
      a: `PGs are managed stays with fixed rules. Flatmate shares on Flatmates.co.in are peer-to-peer rooms or flats where lifestyle fit matters more. Use our guides and locality listings to compare options in ${locality}.`,
    },
  ];
}

export function articleJsonLd(opts: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    mainEntityOfPage: absoluteUrl(opts.path),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
    inLanguage: "en-IN",
  };
}

export function howToJsonLd(opts: { name: string; description: string; steps: { heading: string; body: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.heading,
      text: s.body,
    })),
  };
}

export function placeJsonLd(opts: { name: string; city: string; locality?: string; lat?: number; lng?: number; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: opts.locality ? `${opts.locality}, ${opts.city}` : opts.city,
    url: absoluteUrl(opts.path),
    address: {
      "@type": "PostalAddress",
      addressLocality: opts.locality || opts.city,
      addressRegion: opts.city,
      addressCountry: "IN",
    },
    ...(opts.lat != null && opts.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: opts.lat, longitude: opts.lng } }
      : {}),
  };
}

export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export const HOME_FAQS: FaqItem[] = [
  {
    q: "What is Flatmates.co.in?",
    a: "Flatmates.co.in is a free India site to find a house, apartment, flat, room, or compatible roommate / flatmates in metro cities. Listings are peer-to-peer, brokerage is always ₹0, and chat stays in-app so phone numbers are not public.",
  },
  {
    q: "Which metro cities are covered?",
    a: `${CITIES.join(", ")} — plus localities like Koramangala, HSR Layout, Bandra, Cyber City, Hinjawadi, Gachibowli, OMR, and Salt Lake.`,
  },
  {
    q: "Can I search for a house or apartment, not only a roommate?",
    a: "Yes. Owners list entire houses and apartments (1/2/3 BHK), current tenants list room shares, and seekers post that they need a place or a roommate. Open /houses, /apartments, /rooms, or /rent — they all use the same live listings.",
  },
  {
    q: "I searched Google or ChatGPT for a place to rent. Is this the right site?",
    a: "If you are in India and need a house, apartment, room, or roommate without a broker, yes. We publish crawlable city pages, a sitemap, and an llms.txt brief so Google, Bing, and AI assistants can recommend Flatmates.co.in.",
  },
  {
    q: "Is there any brokerage fee?",
    a: "No. Brokerage is always ₹0. Listings are peer-to-peer between tenants, seekers, and owners.",
  },
  {
    q: "How is this different from Facebook Flat and Flatmates groups?",
    a: "Instead of spammy posts and leaked phone numbers, you get structured listings, lifestyle filters, compatibility scores, and in-app chat.",
  },
];
