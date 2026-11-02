import Link from "next/link";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { scorePair, viewerAsSeeker } from "@/lib/match";
import { getDb } from "@/lib/store";
import { ChatStart } from "@/components/ChatStart";
import { ReportBox } from "@/components/ReportBox";
import { Gallery } from "@/components/Gallery";
import { AdSlot, Affiliates } from "@/components/Monetize";
import { PayButton } from "@/components/PayButton";
import { FavBtn, ReviewForm } from "@/components/Social";
import { SharePanel } from "@/components/SharePanel";
import { JsonLd } from "@/components/JsonLd";
import { live } from "@/lib/pay";
import { listingPoster, lifestyleChips, MODE_LABEL, POSTER_ROLE } from "@/lib/listing-ui";
import {
  breadcrumbJsonLd,
  cityPath,
  listingJsonLd,
  listingPath,
  localityPath,
  pageMetadata,
  SITE_URL,
} from "@/lib/seo";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = await getDb();
  const listing = db.listings.find((l) => l.id === params.id || l.slug === params.id);
  if (!listing) {
    return pageMetadata({
      title: "Listing not found",
      description: "This flatmate or room listing is unavailable.",
      path: `/listings/${params.id}`,
      noIndex: true,
    });
  }
  const modeBit =
    listing.mode === "seeker" ? "Looking for flatmates" : listing.mode === "owner" ? "Entire flat for rent" : "Room share";
  return pageMetadata({
    title: `${listing.title} · ${listing.locality}, ${listing.city}`,
    description: `${modeBit} in ${listing.locality}, ${listing.city} — ₹${listing.rent.toLocaleString("en-IN")}/mo, ₹0 brokerage. ${listing.description.slice(0, 120)}`,
    path: listingPath(listing),
    noIndex: listing.status !== "active",
    image: listing.images?.[0] || "/og.svg",
    keywords: [
      listing.city,
      listing.locality,
      "flatmates",
      "roommate",
      "room for rent",
      "house for rent",
      "apartment for rent",
      "place to rent",
      "zero brokerage",
      listing.mode,
    ],
  });
}

export default async function ListingPage({ params }: Props) {
  const db = await getDb();
  // Support both slug and ID lookup
  const listing = db.listings.find((l) => l.id === params.id || l.slug === params.id);
  if (!listing) return <p className="glass rounded-2xl p-8 text-center muted">Listing not found.</p>;
  listing.views = (listing.views || 0) + 1;
  const user = await currentUser();
  const owner = db.users.find((u) => u.id === listing.userId);
  const seeker = viewerAsSeeker(user, db.listings, listing.city);
  const match = scorePair(seeker, listing);
  const reviews = db.reviews.filter((r) => r.listingId === listing.id);
  const who = listingPoster(listing, owner);
  const chips = lifestyleChips(listing);
  const ownerListingCount = db.listings.filter(
    (l) => l.userId === listing.userId && l.status === "active"
  ).length;
  const path = listingPath(listing);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: listing.city, path: cityPath(listing.city) },
            { name: listing.locality, path: localityPath(listing.city, listing.locality) },
            { name: listing.title, path },
          ]),
          listingJsonLd(listing),
        ]}
      />

      {/* Main column */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <nav className="muted text-xs flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-200">Home</Link>
          <span>/</span>
          <Link href={cityPath(listing.city)} className="hover:text-teal-700 dark:hover:text-teal-200">{listing.city}</Link>
          <span>/</span>
          <Link href={localityPath(listing.city, listing.locality)} className="hover:text-teal-700 dark:hover:text-teal-200">
            {listing.locality}
          </Link>
        </nav>

        <Gallery images={listing.images} alt={`${listing.title} in ${listing.locality}, ${listing.city}`} />

        {/* Title card */}
        <div className="glass rounded-3xl p-6">
          <p className="kicker text-xs uppercase tracking-wide">
            {MODE_LABEL[listing.mode]} · {listing.locality}, {listing.city}
            {live(listing.boostUntil) ? " · ⚡ TOP BOOST" : ""}
            {live(listing.urgentUntil) ? " · 🔥 URGENT" : ""}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">{listing.title}</h1>
          <p className="muted mt-3 leading-relaxed">{listing.description}</p>

          {/* Lifestyle chips */}
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c.key} className="rounded-full border border-line px-2.5 py-1 text-xs muted flex items-center gap-1">
                <span>{c.icon}</span>
                {c.label}
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-2xl font-bold">
              ₹{listing.rent.toLocaleString("en-IN")}
              <span className="text-base font-normal muted"> / month</span>
            </p>
            <span className="kicker text-sm font-semibold">₹0 brokerage</span>
          </div>
          <p className="muted text-sm mt-1">
            Deposit: ₹{listing.deposit.toLocaleString("en-IN")} · {listing.views} views
            {listing.maintenanceIncluded ? " · Maintenance included" : ""}
          </p>
        </div>

        {/* Social share */}
        <SharePanel
          title={`${listing.title} — ₹${listing.rent.toLocaleString("en-IN")}/mo`}
          description={`${listing.mode === "seeker" ? "Seeking" : "Available"} in ${listing.locality}, ${listing.city}. ₹0 brokerage.`}
          path={path}
          image={listing.images?.[0]}
        />

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold">Reviews</p>
            {reviews.map((r) => (
              <div key={r.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < r.rating ? "text-amber-400" : "muted"}>★</span>
                  ))}
                  <span className="muted text-xs ml-1 tabular-nums">{r.rating}/5</span>
                </div>
                {r.text && <p className="mt-1 text-sm muted">{r.text}</p>}
              </div>
            ))}
          </div>
        )}

        {user && <ReviewForm id={listing.id} />}
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        <AdSlot slot="listing-side" />

        {/* Compatibility score */}
        <div className="glass rounded-3xl p-5">
          <p className="text-sm muted">Compatibility score</p>
          <p className="text-4xl font-bold text-teal-700 dark:text-teal-300 mt-1">{match.score}%</p>
          {match.greens.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-emerald-600 dark:text-emerald-300">
              {match.greens.map((g) => (
                <li key={g} className="flex items-center gap-1.5">
                  <span>✓</span> {g}
                </li>
              ))}
            </ul>
          )}
          {match.ambers.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-amber-600 dark:text-amber-300">
              {match.ambers.map((g) => (
                <li key={g} className="flex items-center gap-1.5">
                  <span>!</span> {g}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Poster / Owner info */}
        <div className="glass rounded-3xl p-5 text-sm space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest kicker mb-1">{POSTER_ROLE[listing.mode]}</p>
            <p className="font-semibold text-base">{who.name}</p>
            {who.verified ? (
              <span
                className="inline-flex items-center gap-1 mt-1 rounded-full bg-teal-500/15 px-2.5 py-1 text-xs text-teal-700 dark:text-teal-200"
                title="Identity verified by Flatmates.co.in"
              >
                <span>✓</span> {who.verified}
              </span>
            ) : (
              <span className="inline-block mt-1 rounded-full bg-white/5 px-2.5 py-1 text-xs muted-2">
                Not verified
              </span>
            )}
          </div>

          <div className="text-xs muted space-y-0.5">
            {who.memberSince && <p>Member since {who.memberSince}</p>}
            {ownerListingCount > 1 && (
              <p>{ownerListingCount} active listings</p>
            )}
          </div>

          <p className="text-xs muted-2">📵 Phone hidden — chat in-app only</p>

          {user ? (
            user.id === listing.userId ? (
              <Link href="/chat" className="btn mt-2 w-full text-center">Open chat inbox</Link>
            ) : (
              <div className="space-y-2">
                <ChatStart listingId={listing.id} />
                <FavBtn id={listing.id} on={user.favorites.includes(listing.id)} />
              </div>
            )
          ) : (
            <Link href="/login" className="btn mt-2 w-full text-center">Login to chat</Link>
          )}
        </div>

        {/* Boost / Urgent pay buttons for owner */}
        {user?.id === listing.userId && (
          <div className="flex flex-col gap-2">
            <PayButton sku="boost" listingId={listing.id} />
            <PayButton sku="urgent" listingId={listing.id} />
          </div>
        )}

        {/* Map */}
        <iframe
          title={`Map of ${listing.locality}, ${listing.city}`}
          className="h-52 w-full rounded-2xl border-0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.02}%2C${listing.lat - 0.02}%2C${listing.lng + 0.02}%2C${listing.lat + 0.02}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
          loading="lazy"
        />

        <Affiliates city={listing.city} />

        {/* Report box */}
        {user?.id !== listing.userId &&
          (user ? (
            <ReportBox listingId={listing.id} />
          ) : (
            <div className="glass rounded-3xl p-5 text-sm">
              <p className="font-semibold">Report listing</p>
              <p className="muted mt-1 text-xs">Login required to report broker spam, fakes, or scams.</p>
              <Link href="/login" className="btn-ghost mt-3 text-xs inline-block">Login to report</Link>
            </div>
          ))}
      </aside>
    </div>
  );
}
