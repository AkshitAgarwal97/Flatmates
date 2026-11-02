import { CITIES, HUBS } from "@/lib/hubs";
import { GUIDES } from "@/lib/guides";
import { SITE_NAME, SITE_URL, absoluteUrl, cityPath, localityPath } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

function item(title: string, path: string, summary: string) {
  const url = absoluteUrl(path);
  return `<item><title><![CDATA[${title}]]></title><link>${url}</link><guid>${url}</guid><description><![CDATA[${summary}]]></description></item>`;
}

export async function GET() {
  const items = [
    item("Place to rent in India", "/rent", "House, apartment, room, or roommate — zero brokerage."),
    item("Apartments for rent", "/apartments", "1/2/3 BHK apartments without brokers."),
    item("House for rent", "/houses", "Houses and independent homes, ₹0 brokerage."),
    item("Rooms for rent", "/rooms", "Private and shared rooms in Indian metros."),
    item("Find a roommate", "/roommates", "Compatible roommates with lifestyle matching."),
    item("Flatmates and flats in India", "/", "Zero brokerage rooms and flatmates across Indian metro cities."),
    item("All metro cities", "/flatmates", "Find flatmates in every Indian metro city."),
    item("Find a flat in India", "/flat", "Entire flats and rooms without brokers."),
    ...CITIES.map((c) => item(`Flatmates in ${c}`, cityPath(c), `Rooms, flats, and flatmates in ${c}. ₹0 brokerage.`)),
    ...HUBS.slice(0, 40).map((h) =>
      item(`Flatmates in ${h.locality}, ${h.city}`, localityPath(h.city, h.locality), h.blurb)
    ),
    ...GUIDES.slice(0, 20).map((g) => item(g.title, `/guides/${g.slug}`, g.description)),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${SITE_URL}</link><description>Flatmates and flats in Indian metro cities. Zero brokerage.</description>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
