import type { Listing, User } from "@/lib/types";
import { live } from "@/lib/pay";
import { lifestyleChips, listingPoster, MODE_LABEL, MODE_DESCRIPTION } from "@/lib/listing-ui";
import { listingPath } from "@/lib/seo";

export function ListingCard({
  listing,
  score,
  poster,
}: {
  listing: Listing;
  score?: number;
  poster?: User | null;
}) {
  const who = listingPoster(listing, poster);
  const chips = lifestyleChips(listing);

  return (
    <a href={listingPath(listing)} className="glass listing-card block overflow-hidden rounded-2xl">
      {/* Image */}
      <div className="relative h-44 bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.images[0] || "/room.svg"}
          alt={`${listing.title} — ${listing.locality}, ${listing.city}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Mode badge with tooltip */}
        <span
          className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
          title={MODE_DESCRIPTION[listing.mode]}
        >
          {MODE_LABEL[listing.mode]}
        </span>

        {/* Boost / Urgent badges */}
        {live(listing.boostUntil) && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-slate-950">
            ⚡ BOOST
          </span>
        )}
        {live(listing.urgentUntil) && (
          <span className="absolute bottom-3 left-20 rounded-full bg-rose-400 px-2 py-0.5 text-[10px] font-bold text-white">
            🔥 URGENT
          </span>
        )}

        {/* Match score */}
        {typeof score === "number" && score > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-teal-300 px-2 py-1 text-[11px] font-bold text-slate-950">
            {score}% match
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1.5 p-4">
        <p className="kicker text-xs">
          {listing.locality}, {listing.city}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{listing.title}</h3>
        <p className="text-sm font-medium">
          ₹{listing.rent.toLocaleString("en-IN")}
          <span className="muted-2 font-normal"> / month</span>
        </p>
        <p className="muted text-xs">
          {who.role}: {who.name}
          {who.verified ? (
            <span className="ml-1.5 rounded-full bg-teal-500/15 px-1.5 py-0.5 text-[10px] text-teal-700 dark:text-teal-300">
              ✓ {who.verified}
            </span>
          ) : null}
        </p>

        {/* Lifestyle chips with icons */}
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {chips.map((c) => (
            <li
              key={c.key}
              className="rounded-full border border-line px-2 py-0.5 text-[11px] muted"
              title={c.label}
            >
              <span className="mr-1">{c.icon}</span>
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </a>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="glass listing-card overflow-hidden rounded-2xl" aria-hidden>
      <div className="skeleton h-44 rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-1/4" />
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
