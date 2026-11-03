import Link from "next/link";
import type { Metadata } from "next";
import { CITIES } from "@/lib/hubs";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { OwnerName } from "@/components/OwnerName";
import { breadcrumbJsonLd, pageMetadata, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "About Flatmates.co.in — zero brokerage flats & flatmates in India",
  description:
    "Who runs Flatmates.co.in, why it exists, and how we help people find a flat or flatmates in Indian metro cities with ₹0 brokerage and private chat.",
  path: "/about",
  keywords: ["about flatmates.co.in", "flatmates india", "zero brokerage flatmates"],
});

export default function AboutPage() {
  return (
    <article className="space-y-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHeader
        kicker="About"
        title={`About ${SITE_NAME}`}
        lead={
          <>
            Operated by <OwnerName /> in India. For listing, safety, or billing help, email {SUPPORT_EMAIL}.
          </>
        }
      />
      <p className="muted max-w-2xl">
        Support:{" "}
        <Link href="/contact" className="kicker">
          {SUPPORT_EMAIL}
        </Link>
        .
      </p>
      <p className="muted max-w-2xl">
        Flatmates.co.in is an India-only product for people who need a <strong className="text-fg">house</strong>,{" "}
        <strong className="text-fg">apartment</strong>, <strong className="text-fg">room</strong>, or{" "}
        <strong className="text-fg">roommate / flatmates</strong> in metro cities without paying brokerage or posting
        their phone number on Facebook groups. The site is {SITE_URL.replace("https://", "")}.
      </p>
      <section className="muted space-y-3">
        <h2 className="text-xl font-semibold text-fg">What we publish</h2>
        <p>
          Three kinds of listings: a room in a shared flat, a seeker looking for a room, and an owner listing an entire
          1/2/3 BHK. Every profile stores diet, gender preference, WFH vs office, washroom, pets, and guest rules so
          you can shortlist before you visit.
        </p>
        <p>
          We cover {CITIES.length} metro and million-plus cities, each with its own URL under{" "}
          <Link href="/flatmates" className="text-teal-200">
            /flatmates
          </Link>
          . Those pages are the ones Google and ChatGPT should use for “house for rent Delhi”, “apartment in Pune”,
          “roommate Bengaluru”, and similar searches.
        </p>
      </section>
      <section className="muted space-y-3">
        <h2 className="text-xl font-semibold text-fg">What we are not</h2>
        <p>
          We are not a broker. We do not charge a month’s rent as commission. We are not a PG hostel chain. Optional UPI
          boosts only change visibility; matching, chat, and posting stay free.
        </p>
      </section>
      <section className="muted space-y-3">
        <h2 className="text-xl font-semibold text-fg">Safety</h2>
        <p>
          Phone numbers stay hidden. Chat is in-app. Listings can be reported. Never pay a large deposit to an unknown
          UPI ID before a video walkthrough. Read{" "}
          <Link href="/guides/find-flatmates-safely" className="text-teal-200">
            how to find flatmates safely
          </Link>
          .
        </p>
      </section>
      <p>
        <Link href="/listings/new" className="btn">
          Post a listing free
        </Link>
      </p>
    </article>
  );
}
