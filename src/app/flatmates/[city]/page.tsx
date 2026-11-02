import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { CITIES, getCitySeo, HUBS, neighborCities } from "@/lib/hubs";
import { getDb } from "@/lib/store";
import { postersById } from "@/lib/listing-ui";
import { HeroSearch } from "@/components/HeroSearch";
import {
  breadcrumbJsonLd,
  cityFaqs,
  cityPath,
  citySlug,
  faqJsonLd,
  findCityBySlug,
  itemListJsonLd,
  localityPath,
  pageMetadata,
  placeJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: { city: string } };

export function generateStaticParams() {
  return CITIES.map((city) => ({ city: citySlug(city) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const city = findCityBySlug(params.city);
  if (!city) return { title: "City not found" };
  const seo = getCitySeo(city);
  return pageMetadata({
    title: `Flatmates, apartments & houses in ${city} — ₹0 brokerage`,
    description:
      seo?.intro.slice(0, 155) ||
      `Find rooms, flats, and compatible flatmates in ${city}. Lifestyle matching, private in-app chat, zero brokerage on Flatmates.co.in.`,
    path: cityPath(city),
    keywords: [
      `flatmates ${city}`,
      `flat in ${city}`,
      `room for rent ${city}`,
      `house for rent ${city}`,
      `apartment for rent ${city}`,
      `place to rent ${city}`,
      `share room ${city}`,
      `roommates ${city}`,
      `roommate ${city}`,
      `zero brokerage ${city}`,
      `flat and flatmates ${city}`,
      ...(seo?.aliases.flatMap((a) => [`flatmates ${a}`, `flat ${a}`]) || []),
    ],
  });
}

export default async function CityPage({ params }: Props) {
  const city = findCityBySlug(params.city);
  if (!city) notFound();

  const hubs = HUBS.filter((h) => h.city === city);
  const db = await getDb();
  const posters = postersById(db.users);
  const listings = db.listings
    .filter((l) => l.status === "active" && l.city.toLowerCase() === city.toLowerCase())
    .slice(0, 12);
  const faqs = cityFaqs(city);
  const seo = getCitySeo(city);

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Flatmates", path: "/flatmates" },
            { name: `Flatmates in ${city}`, path: cityPath(city) },
          ]),
          faqJsonLd(faqs),
          itemListJsonLd(
            `Localities in ${city}`,
            hubs.map((h) => ({ name: h.locality, path: localityPath(h.city, h.locality) }))
          ),
          placeJsonLd({
            name: city,
            city,
            lat: hubs[0]?.lat,
            lng: hubs[0]?.lng,
            path: cityPath(city),
          }),
        ]}
      />
      <nav className="text-xs text-white/45">
        <Link href="/" className="hover:text-teal-200">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/flatmates" className="hover:text-teal-200">
          Flatmates
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">Flatmates in {city}</span>
      </nav>

      <section className="glass overflow-hidden rounded-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">
          {city} · {seo?.tagline || "₹0 brokerage"} · In-app chat
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Flatmates, rooms, apartments & houses in {city}
        </h1>
        <p className="muted mt-4 max-w-2xl">
          {seo?.intro || `Browse peer-to-peer rooms, apartments, houses, and roommates across ${city}.`} Search a place
          to rent or a roommate — brokerage is always ₹0.
        </p>
        <HeroSearch defaultCity={city} />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/browse?city=${encodeURIComponent(city)}&intent=rooms`} className="btn">
            Find a flat / room in {city}
          </Link>
          <Link href={`/browse?city=${encodeURIComponent(city)}&intent=roommates`} className="btn-ghost">
            Find flatmates
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            Post in {city}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Popular localities in {city}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((h) => (
            <Link
              key={h.locality}
              href={localityPath(h.city, h.locality)}
              className="glass rounded-2xl p-5 transition hover:border-teal-400/30"
            >
              <p className="font-semibold">{h.locality}</p>
              <p className="mt-1 text-sm text-white/55">{h.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Live listings in {city}</h2>
          <Link href={`/browse?city=${encodeURIComponent(city)}`} className="text-sm text-teal-200">
            See all
          </Link>
        </div>
        {listings.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} poster={posters[l.userId]} />
            ))}
          </div>
        ) : (
          <p className="text-white/50">
            No active listings right now.{" "}
            <Link href="/listings/new" className="text-teal-200">
              Be the first to post in {city}
            </Link>
            .
          </p>
        )}
      </section>

      <section className="glass rounded-3xl p-6 text-sm text-white/65">
        <h2 className="text-lg font-semibold text-white">Living in {city} as a flatmate</h2>
        {seo ? (
          <div className="mt-3 space-y-3">
            <p>{seo.rents}</p>
            <p>{seo.commute}</p>
            <p>{seo.who}</p>
          </div>
        ) : null}
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Zero brokerage on every room share and owner flat</li>
          <li>India-specific lifestyle tags (veg/Jain, WFH, washroom, pets)</li>
          <li>Compatibility scores before you waste a visit</li>
          <li>Private chat — phones stay hidden by default</li>
        </ul>
      </section>

      <FaqBlock faqs={faqs} />

      {neighborCities(city).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Nearby metros</h2>
          <div className="flex flex-wrap gap-2">
            {neighborCities(city).map((c) => (
              <Link key={c} href={cityPath(c)} className="btn-ghost text-xs">
                Flatmates in {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-sm text-white/45">
        Related:{" "}
        <Link href="/guides" className="text-teal-200">
          Flatmate guides
        </Link>{" "}
        ·{" "}
        <Link href={`/guides/flatmates-${citySlug(city)}`} className="text-teal-200">
          {city} guide
        </Link>{" "}
        ·{" "}
        <Link href="/flat" className="text-teal-200">
          Find a flat
        </Link>
      </p>
    </div>
  );
}
