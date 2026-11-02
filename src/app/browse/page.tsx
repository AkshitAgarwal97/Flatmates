import { ListingCard } from "@/components/ListingCard";
import { AdSlot, Affiliates } from "@/components/Monetize";
import { BrowseFilters } from "@/components/BrowseFilters";
import { PageHeader } from "@/components/PageHeader";
import { currentUser } from "@/lib/auth";
import { km } from "@/lib/geo";
import { postersById } from "@/lib/listing-ui";
import { scorePair, viewerAsSeeker } from "@/lib/match";
import { live } from "@/lib/pay";
import { pageMetadata, cityPath, localityPath, findCityBySlug, localitySlug } from "@/lib/seo";
import { HUBS } from "@/lib/hubs";
import { getDb } from "@/lib/store";
import type { Metadata } from "next";
import Link from "next/link";

type BrowseParams = {
  city?: string;
  locality?: string;
  lat?: string;
  lng?: string;
  mode?: string;
  intent?: string;
  maxRent?: string;
  diet?: string;
  washroom?: string;
  pets?: string;
  q?: string;
};

export function generateMetadata({ searchParams }: { searchParams: BrowseParams }): Metadata {
  const extraFilter = Boolean(
    searchParams.q || searchParams.lat || searchParams.lng || searchParams.maxRent || searchParams.diet || searchParams.washroom || searchParams.pets || searchParams.mode
  );
  const city = searchParams.city
    ? findCityBySlug(searchParams.city) || HUBS.find((h) => h.city.toLowerCase() === searchParams.city!.toLowerCase())?.city
    : undefined;
  const hub =
    city && searchParams.locality
      ? HUBS.find((h) => h.city === city && localitySlug(h.locality) === localitySlug(searchParams.locality!))
      : undefined;

  if (hub && city) {
    return pageMetadata({
      title: `Flatmates in ${hub.locality}, ${city}`,
      description: `Rooms and flatmates in ${hub.locality}, ${city}. ₹0 brokerage.`,
      path: localityPath(city, hub.locality),
      noIndex: extraFilter,
    });
  }
  if (city) {
    return pageMetadata({
      title: `Flatmates in ${city}`,
      description: `Find a flat or flatmates in ${city}. ₹0 brokerage.`,
      path: cityPath(city),
      noIndex: extraFilter,
    });
  }

  const intent = searchParams.intent || "";
  const kind =
    intent === "roommates" ? "Find flatmates" : intent === "rooms" ? "Find a flat or room" : "Browse rooms & flatmates";
  const qs = new URLSearchParams();
  if (intent === "rooms" || intent === "roommates") qs.set("intent", intent);
  const path = qs.toString() ? `/browse?${qs.toString()}` : "/browse";
  return pageMetadata({
    title: `${kind} in India`,
    description:
      "Browse rooms, flats, and flatmates across Indian metro cities. Filter by city, diet, rent, and lifestyle. ₹0 brokerage.",
    path,
    noIndex: extraFilter,
  });
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: BrowseParams;
}) {
  const user = await currentUser();
  const db = await getDb();
  const posters = postersById(db.users);
  const seeker = viewerAsSeeker(user, db.listings, searchParams.city);
  const intent = searchParams.intent || "";
  let items = db.listings.filter((l) => l.status === "active");
  if (intent === "roommates") items = items.filter((l) => l.mode === "seeker");
  else if (intent === "rooms") items = items.filter((l) => l.mode !== "seeker");
  if (searchParams.mode) items = items.filter((l) => l.mode === searchParams.mode);
  const lat = Number(searchParams.lat);
  const lng = Number(searchParams.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && searchParams.lat && searchParams.lng) {
    items = items.filter((l) => km({ lat, lng }, l) <= 25);
  } else if (searchParams.city) {
    const c = searchParams.city.toLowerCase();
    const loc = (searchParams.locality || "").toLowerCase();
    items = items.filter(
      (l) =>
        l.city.toLowerCase().includes(c) ||
        l.locality.toLowerCase().includes(c) ||
        (loc && (l.locality.toLowerCase().includes(loc) || l.city.toLowerCase().includes(loc)))
    );
  }
  if (searchParams.maxRent) items = items.filter((l) => l.mode === "seeker" || l.rent <= Number(searchParams.maxRent));
  if (searchParams.diet) items = items.filter((l) => l.lifestyle.diet === searchParams.diet);
  if (searchParams.washroom) items = items.filter((l) => l.lifestyle.washroom === searchParams.washroom);
  if (searchParams.pets) items = items.filter((l) => l.lifestyle.pets === searchParams.pets);
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    items = items.filter((l) => `${l.title} ${l.locality} ${l.city}`.toLowerCase().includes(q));
  }
  const scored = items
    .map((l) => ({ l, match: scorePair(seeker, l) }))
    .sort((a, b) => Number(live(b.l.boostUntil)) - Number(live(a.l.boostUntil)) || b.match.score - a.match.score);
  const placeLabel = [searchParams.locality, searchParams.city].filter(Boolean).join(", ");

  const title =
    intent === "roommates"
      ? placeLabel
        ? `Find roommates in ${placeLabel}`
        : "Find roommates in India"
      : intent === "rooms"
        ? placeLabel
          ? `Find rooms in ${placeLabel}`
          : "Find rooms & flats in India"
        : placeLabel
          ? `Browse flatmates in ${placeLabel}`
          : "Browse rooms & flatmates";

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Search"
        title={title}
        lead={`${scored.length} results · 25 km of a Maps pin, or all India if no place picked`}
      />
      <div className="flex flex-wrap gap-2">
        <Link href="/browse?intent=rooms" className={intent === "rooms" ? "btn text-xs" : "btn-ghost text-xs"}>
          Rooms & flats
        </Link>
        <Link href="/browse?intent=roommates" className={intent === "roommates" ? "btn text-xs" : "btn-ghost text-xs"}>
          Roommates only
        </Link>
        <Link href="/browse" className={!intent ? "btn text-xs" : "btn-ghost text-xs"}>
          Everything
        </Link>
      </div>
      <AdSlot slot="browse-feed" />
      <BrowseFilters
        intent={intent}
        city={searchParams.city}
        locality={searchParams.locality}
        lat={searchParams.lat}
        lng={searchParams.lng}
        placeLabel={placeLabel}
        q={searchParams.q}
        maxRent={searchParams.maxRent}
        diet={searchParams.diet}
        washroom={searchParams.washroom}
        pets={searchParams.pets}
      />
      <p className="muted text-xs">
        Card tags are labeled in words. <span className="font-medium text-fg">Share a room</span> = current tenant replacing a flatmate.
        <span className="font-medium text-fg"> Entire flat</span> = owner listing.
        <span className="font-medium text-fg"> Seeking</span> = person looking for a place.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map(({ l, match }) => (
          <ListingCard key={l.id} listing={l} score={match.score} poster={posters[l.userId]} />
        ))}
      </div>
      {!scored.length && <p className="muted">No matches in that area. Clear the place search or pick a nearby locality.</p>}
      <Affiliates city={searchParams.city} />
    </div>
  );
}
