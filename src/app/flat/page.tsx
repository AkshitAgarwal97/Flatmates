import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { CITIES, TIER1_CITIES } from "@/lib/hubs";
import { breadcrumbJsonLd, cityPath, faqJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

const FAQS = [
  {
    q: "What is a “flat” on Flatmates.co.in?",
    a: "A flat is an apartment — typically a 1/2/3 BHK listed by an owner, or a room inside a shared flat listed by a current tenant. Brokerage is ₹0.",
  },
  {
    q: "How is this different from searching only for flatmates?",
    a: "Flatmates are people. A flat is the home. You can do both: take a room with existing flatmates, or rent an entire flat and then find flatmates.",
  },
  {
    q: "Which cities have flats listed?",
    a: `Owner flats and room shares are supported in every metro we cover, including ${TIER1_CITIES.join(", ")} and the rest of the India metro list.`,
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Find a flat in India — entire apartments & rooms ₹0 brokerage",
  description:
    "Find a flat in Indian metro cities: owner 1/2/3 BHK listings and room shares, lifestyle matching, private chat, zero brokerage on Flatmates.co.in.",
  path: "/flat",
  keywords: ["flat", "find a flat", "flat in india", "apartment for rent india", "zero brokerage flat", "1bhk 2bhk india"],
});

export default function FlatLandingPage() {
  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Find a flat", path: "/flat" },
          ]),
          itemListJsonLd(
            "Flats in Indian metro cities",
            CITIES.map((city) => ({ name: `Flat in ${city}`, path: cityPath(city) }))
          ),
          faqJsonLd(FAQS),
        ]}
      />
      <section className="glass rounded-3xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Flat · Apartment · ₹0 brokerage</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
          Find a flat in India without brokers
        </h1>
        <p className="mt-4 max-w-2xl text-white/65">
          Search entire flats (1/2/3 BHK) from owners and rooms inside shared flats from current tenants. Same product as
          flatmates matching: diet, gender preference, WFH, washroom — then chat in-app. Phone numbers stay hidden.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/browse?intent=rooms" className="btn">
            Browse flats & rooms
          </Link>
          <Link href="/flatmates" className="btn-ghost">
            Flatmates by city
          </Link>
          <Link href="/listings/new" className="btn-ghost">
            List your flat
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Entire flat", "Owners list a full apartment. You pay rent and deposit to them — never a platform brokerage."],
          ["Room in a flat", "Join an existing household. Compatibility scores reduce diet, guest, and schedule surprises."],
          ["Need a flat", "Post as a seeker so owners and current tenants in your metro can find you."],
        ].map(([t, d]) => (
          <div key={t} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm text-white/60">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Flats by metro city</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <Link key={city} href={cityPath(city)} className="btn-ghost text-xs">
              Flat in {city}
            </Link>
          ))}
        </div>
      </section>

      <FaqBlock faqs={FAQS} />
    </div>
  );
}
