import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { CITIES, CITY_SEO, HUBS } from "@/lib/hubs";
import { breadcrumbJsonLd, cityPath, faqJsonLd, HOME_FAQS, itemListJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Flatmates in every Indian metro city — rooms & flats ₹0 brokerage",
  description: `Find flatmates and flats across ${CITIES.length} Indian metro cities. Direct listings, lifestyle matching, private chat, zero brokerage.`,
  path: "/flatmates",
  keywords: ["flatmates", "flatmates india", "metro cities flatmates", "find flatmates", ...CITIES.map((c) => `flatmates ${c}`)],
});

export default function FlatmatesIndexPage() {
  const faqs = [
    HOME_FAQS[1],
    {
      q: "What does “flatmates” mean on this site?",
      a: "People sharing a flat or looking for a room in a shared home. You can also list or find an entire flat from an owner — still ₹0 brokerage.",
    },
    {
      q: "How do I open a city?",
      a: "Pick a metro below. Each city has locality pages (Koramangala, Bandra, Cyber City, Hinjawadi, and so on) that Google can index.",
    },
  ];

  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Flatmates", path: "/flatmates" },
          ]),
          itemListJsonLd(
            "Flatmates in Indian metro cities",
            CITIES.map((city) => ({ name: `Flatmates in ${city}`, path: cityPath(city) }))
          ),
          faqJsonLd(faqs),
        ]}
      />
      <section className="glass rounded-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">India · All metro cities · ₹0 brokerage</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Flatmates in every Indian metro city
        </h1>
        <p className="mt-4 max-w-2xl text-white/65">
          Search rooms, entire flats, and compatible flatmates in {CITIES.length} metro and million-plus cities. Lifestyle
          filters, compatibility scores, in-app chat. No brokers. No public phone numbers.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/browse?intent=roommates" className="btn">
            Find flatmates
          </Link>
          <Link href="/flat" className="btn-ghost">
            Find a flat
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            Post free
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Metro cities</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITY_SEO.map((seo) => {
            const localities = HUBS.filter((h) => h.city === seo.city)
              .map((h) => h.locality)
              .join(" · ");
            return (
              <Link
                key={seo.city}
                href={cityPath(seo.city)}
                className="glass rounded-2xl p-5 transition hover:border-teal-400/30"
              >
                <p className="font-semibold">{seo.city}</p>
                <p className="mt-1 text-xs text-teal-200/80">{seo.tagline}</p>
                <p className="mt-2 text-xs text-white/50">{localities}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <FaqBlock faqs={faqs} />
    </div>
  );
}
