import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/store";
import { cityPath, listingPath, pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ListingsMap } from "@/components/ListingsMap";

export const metadata: Metadata = pageMetadata({
  title: "Map of rooms & flatmates in India",
  description: "Active room and flatmate listings by city on Flatmates.co.in.",
  path: "/map",
});

export default async function MapPage() {
  const db = await getDb();
  const listings = db.listings.filter((l) => l.status === "active");
  const pins = listings.map((l) => ({
    id: l.id,
    path: listingPath(l),
    title: l.title,
    city: l.city,
    locality: l.locality,
    rent: l.rent,
    lat: l.lat,
    lng: l.lng,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Map"
        title="Active listings on the map"
        lead="OpenStreetMap pins — no Google account required. Tap a pin for the listing."
      />
      <ListingsMap pins={pins} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link key={l.id} href={listingPath(l)} className="glass rounded-2xl p-4">
            <p className="kicker text-xs">
              {l.locality}, {l.city}
            </p>
            <p className="mt-1 font-semibold">{l.title}</p>
            <p className="muted mt-1 text-sm">₹{l.rent.toLocaleString("en-IN")}</p>
            <p className="muted-2 mt-2 text-xs">
              City hub: <span className="kicker">{cityPath(l.city)}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
