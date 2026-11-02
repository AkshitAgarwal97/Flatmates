import type { Metadata } from "next";
import { CITIES, HUBS } from "@/lib/hubs";
import { GUIDES } from "@/lib/guides";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { DirectoryBrowser } from "@/components/DirectoryBrowser";
import { breadcrumbJsonLd, cityPath, itemListJsonLd, localityPath, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "All flatmates & flat pages — Indian metro cities directory",
  description:
    "Full directory of Flatmates.co.in pages: every metro city, locality, and guide for finding a flat or flatmates with ₹0 brokerage.",
  path: "/directory",
  keywords: ["flatmates directory", "flats india directory", ...CITIES.map((c) => `flatmates ${c}`)],
});

export default function DirectoryPage() {
  const items = [
    { name: "Home", path: "/" },
    { name: "Place to rent", path: "/rent" },
    { name: "Apartments", path: "/apartments" },
    { name: "Houses", path: "/houses" },
    { name: "Rooms", path: "/rooms" },
    { name: "Roommates", path: "/roommates" },
    { name: "Flatmates by city", path: "/flatmates" },
    { name: "Find a flat", path: "/flat" },
    { name: "हिन्दी", path: "/hi" },
    ...CITIES.map((c) => ({ name: `Flatmates in ${c}`, path: cityPath(c) })),
    ...HUBS.map((h) => ({ name: `${h.locality}, ${h.city}`, path: localityPath(h.city, h.locality) })),
    ...GUIDES.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })),
  ];

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Directory", path: "/directory" },
          ]),
          itemListJsonLd("All Flatmates.co.in pages", items),
        ]}
      />
      <PageHeader
        kicker="Index"
        title="All rent, roommate, and city pages"
        lead="Filter metros and open a city to see localities. Brokerage is always ₹0."
      />
      <DirectoryBrowser />
    </div>
  );
}
