import { CITY_SEO, HUBS } from "@/lib/hubs";
import { cityPath, citySlug, localityPath } from "@/lib/seo";
import type { Guide } from "@/lib/guides-types";

export type { Guide, GuideSection } from "@/lib/guides-types";

export const METRO_GUIDES: Guide[] = CITY_SEO.map((seo) => {
  const hubs = HUBS.filter((h) => h.city === seo.city);
  const slug = `flatmates-${citySlug(seo.city)}`;
  const also = seo.aliases.length ? ` People also search ${seo.aliases.join(", ")}.` : "";
  return {
    slug,
    title: `Flatmates & flats in ${seo.city} — zero brokerage guide`,
    description: `How to find a flat or flatmates in ${seo.city}: ${hubs.map((h) => h.locality).join(", ")}. ₹0 brokerage, lifestyle matching, in-app chat.`,
    keywords: [
      `flatmates ${seo.city}`,
      `flat in ${seo.city}`,
      `room for rent ${seo.city}`,
      `share room ${seo.city}`,
      ...seo.aliases.map((a) => `flatmates ${a}`),
    ],
    answer: `To find flatmates or a flat in ${seo.city}, open Flatmates.co.in city and locality pages, filter by rent and lifestyle (diet, gender preference, WFH, washroom), then chat in-app. Brokerage is always ₹0.${also}`,
    sections: [
      { heading: `Why ${seo.city} searches fail on Facebook`, body: seo.intro },
      { heading: "Rent and deposit", body: seo.rents },
      { heading: "Commute", body: seo.commute },
      {
        heading: "Localities to open first",
        body: hubs.map((h) => `${h.locality}: ${h.blurb}`).join(" "),
      },
      {
        heading: `Deposit checklist in ${seo.city}`,
        body: `Before you pay anyone in ${seo.city}: video-walk the flat, get rent + deposit + maintenance in chat, refuse broker fees (ours is ₹0), and keep contact on-platform. ${seo.rents}`,
      },
      {
        heading: `Search terms that should open ${seo.city}`,
        body: `People look for “flatmates ${seo.city}”, “flat in ${seo.city}”, and locality names like ${hubs.map((h) => h.locality).join(", ")}. Those queries should use this guide plus the ${seo.city} city page — not a Facebook dump of phone numbers.`,
      },
    ],
    faqs: [
      {
        q: `Is Flatmates.co.in free in ${seo.city}?`,
        a: `Yes. Browse, post, match, and chat in ${seo.city} are free. Brokerage is ₹0.`,
      },
      {
        q: `Where do I see ${seo.city} listings?`,
        a: `Start at the ${seo.city} city page, then open a locality such as ${hubs[0]?.locality || seo.city}.`,
      },
    ] ,
    relatedPaths: [
      { href: cityPath(seo.city), label: `${seo.city} listings` },
      ...hubs.slice(0, 3).map((h) => ({ href: localityPath(h.city, h.locality), label: h.locality })),
    ],
  };
});
