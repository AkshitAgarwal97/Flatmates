import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingCard } from "@/components/ListingCard";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { HUBS, getCitySeo, getHub } from "@/lib/hubs";
import { getDb } from "@/lib/store";
import { postersById } from "@/lib/listing-ui";
import {
  breadcrumbJsonLd,
  cityPath,
  citySlug,
  faqJsonLd,
  findHubBySlugs,
  localityFaqs,
  localityPath,
  localitySlug,
  pageMetadata,
  placeJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

type Props = { params: { city: string; locality: string } };

export function generateStaticParams() {
  return HUBS.map((h) => ({
    city: citySlug(h.city),
    locality: localitySlug(h.locality),
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const found = findHubBySlugs(params.city, params.locality);
  if (!found?.locality) return { title: "Locality not found" };
  const { city, locality } = found;
  const hub = getHub(city, locality);
  return pageMetadata({
    title: `Rooms, apartments & roommates in ${locality}, ${city}`,
    description:
      hub?.blurb ||
      `Find rooms and compatible flatmates in ${locality}, ${city}. Direct listings, lifestyle matching, private in-app chat, zero brokerage.`,
    path: localityPath(city, locality),
    keywords: [
      `flatmates ${locality}`,
      `flat in ${locality}`,
      `room for rent ${locality} ${city}`,
      `apartment for rent ${locality}`,
      `house for rent ${locality}`,
      `roommate ${locality}`,
      `place to rent ${locality} ${city}`,
      `share room ${locality}`,
      `roommates ${locality}`,
      `${locality} flat and flatmates`,
    ],
  });
}

export default async function LocalityPage({ params }: Props) {
  const found = findHubBySlugs(params.city, params.locality);
  if (!found?.locality) notFound();
  const { city, locality } = found;

  const siblings = HUBS.filter((h) => h.city === city && h.locality !== locality);
  const db = await getDb();
  const posters = postersById(db.users);
  const listings = db.listings
    .filter(
      (l) =>
        l.status === "active" &&
        l.city.toLowerCase() === city.toLowerCase() &&
        (l.locality.toLowerCase().includes(locality.toLowerCase()) ||
          locality.toLowerCase().includes(l.locality.toLowerCase()))
    )
    .slice(0, 12);
  const faqs = localityFaqs(city, locality);
  const hub = getHub(city, locality);
  const seo = getCitySeo(city);

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: city, path: cityPath(city) },
            { name: locality, path: localityPath(city, locality) },
          ]),
          faqJsonLd(faqs),
          placeJsonLd({
            name: locality,
            city,
            locality,
            lat: hub?.lat,
            lng: hub?.lng,
            path: localityPath(city, locality),
          }),
        ]}
      />
      <nav className="text-xs text-white/45">
        <Link href="/" className="hover:text-teal-200">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={cityPath(city)} className="hover:text-teal-200">
          {city}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/70">{locality}</span>
      </nav>

      <section className="glass overflow-hidden rounded-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">
          {locality} · {city} · ₹0 brokerage
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Rooms & flatmates in {locality}, {city}
        </h1>
        <p className="mt-4 max-w-2xl text-white/65">
          {hub?.blurb} Discover room shares, people looking for flatmates, and entire flats in {locality}. Match on
          budget, diet, gender preference, WFH vs office, pets, and washroom type — then message in-app. Brokerage is
          always ₹0 on Flatmates.co.in.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/browse?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}&intent=rooms`}
            className="btn"
          >
            Browse {locality} rooms
          </Link>
          <Link
            href={`/browse?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}&intent=roommates`}
            className="btn-ghost"
          >
            Find roommates
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            Post here
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Listings near {locality}</h2>
          <Link
            href={`/browse?city=${encodeURIComponent(city)}&locality=${encodeURIComponent(locality)}`}
            className="text-sm text-teal-200"
          >
            Open browse
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
            No exact matches yet.{" "}
            <Link href={`/browse?city=${encodeURIComponent(city)}`} className="text-teal-200">
              Browse all of {city}
            </Link>{" "}
            or{" "}
            <Link href="/listings/new" className="text-teal-200">
              post a listing in {locality}
            </Link>
            .
          </p>
        )}
      </section>

      {siblings.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Nearby hubs in {city}</h2>
          <div className="flex flex-wrap gap-2">
            {siblings.map((h) => (
              <Link key={h.locality} href={localityPath(h.city, h.locality)} className="btn-ghost text-xs">
                {h.locality}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="glass rounded-3xl p-6 text-sm text-white/65">
        <h2 className="text-lg font-semibold text-white">Moving to {locality}, {city}</h2>
        <p className="mt-2">{hub?.blurb}</p>
        {seo ? (
          <>
            <p className="mt-2">{seo.rents}</p>
            <p className="mt-2">{seo.commute}</p>
          </>
        ) : null}
        <p className="mt-2">
          Confirm rent, deposit, maintenance, notice period, and house rules in chat before you pay. Prefer a video
          walkthrough. Flatmates.co.in does not charge brokerage and does not publish your phone number on listings.
        </p>
        <p className="mt-2">
          Searching “flatmates {locality}” or “flat in {locality}” should land here — then use Browse only to pin a
          workplace within 25 km if this micro-market is still too wide.
        </p>
      </section>

      <FaqBlock faqs={faqs} />
    </div>
  );
}
