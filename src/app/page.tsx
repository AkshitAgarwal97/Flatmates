import Link from "next/link";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/Monetize";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { HeroSearch } from "@/components/HeroSearch";
import { SearchGuide } from "@/components/SearchGuide";
import { CITIES, HOME_HUBS, HUBS } from "@/lib/hubs";
import { postersById } from "@/lib/listing-ui";
import { scorePair, viewerAsSeeker } from "@/lib/match";
import { getDb } from "@/lib/store";
import { HOME_FAQS, cityPath, faqJsonLd, localityPath, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "House, apartment, room & roommate in India — ₹0 brokerage",
  description:
    "Find a house, apartment, flat, room, or roommate in Indian metro cities. Direct listings, lifestyle matching, private in-app chat, ₹0 brokerage on Flatmates.co.in.",
  path: "/",
});

export default async function HomePage() {
  const db = await getDb();
  const listings = db.listings.filter((l) => l.status === "active" && l.mode !== "seeker").slice(0, 6);
  const seeker = viewerAsSeeker(null, db.listings);
  const posters = postersById(db.users);

  return (
    <div className="space-y-8">
      <JsonLd data={[faqJsonLd(HOME_FAQS), serviceJsonLd()]} />
      <section className="glass overflow-hidden rounded-3xl p-8 md:p-12">
        <p className="kicker text-xs uppercase tracking-[0.2em]">India · Urban IT hubs · ₹0 brokerage</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Find a house, apartment, room, or roommate in India
        </h1>
        <p className="muted mt-4 max-w-2xl">
          Search metro cities first. Direct listings, lifestyle tags you can read, private in-app chat. Brokerage always
          ₹0.
        </p>
        <HeroSearch />
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/browse?intent=rooms" className="btn-ghost">
            Find a flat
          </Link>
          <Link href="/browse?intent=roommates" className="btn-ghost">
            Find flatmates
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            Post free
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Fresh in tech hubs</h2>
          <Link href="/browse" className="kicker text-sm">
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} score={scorePair(seeker, l).score} poster={posters[l.userId]} />
          ))}
        </div>
      </section>

      <AdSlot slot="home" />

      <SearchGuide />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Share a room", "A current tenant is replacing an outgoing flatmate. Look for diet, bath, and pet tags on the card."],
          ["Find a room", "Seeker profile matched on budget, diet, gender preference, and lifestyle."],
          ["Entire property", "Listed by the owner. 1/2/3 BHK, brokerage always ₹0."],
        ].map(([t, d]) => (
          <div key={t} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="muted mt-2 text-sm">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Explore flatmates by metro city</h2>
          <div className="flex gap-3 text-sm">
            <Link href="/flatmates" className="kicker">
              All {CITIES.length} cities
            </Link>
            <Link href="/directory" className="kicker">
              Full directory
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((city) => (
            <Link key={city} href={cityPath(city)} className="glass rounded-2xl p-4 hover:border-teal-400/30">
              <p className="font-semibold">{city}</p>
              <p className="muted-2 mt-1 text-xs">
                {HUBS.filter((h) => h.city === city)
                  .map((h) => h.locality)
                  .join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Popular localities</h2>
        <div className="flex flex-wrap gap-2">
          {HOME_HUBS.map((h) => (
            <Link key={`${h.city}-${h.locality}`} href={localityPath(h.city, h.locality)} className="btn-ghost text-xs">
              {h.locality}
            </Link>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 text-sm muted">
        <h2 className="text-lg font-semibold text-fg">About Flatmates.co.in</h2>
        <p className="mt-2">
          We are a peer-to-peer site to find a flat or flatmates in Indian metro cities. We are not a brokerage. Core
          browsing, posting, matching, and chat stay free. Optional UPI boosts exist for visibility only.
        </p>
      </section>

      <FaqBlock faqs={HOME_FAQS} />
    </div>
  );
}
