import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Flatmates guides — India rooms, roommates & zero brokerage",
  description:
    "Guides to find flatmates and rooms in India: Bengaluru, Mumbai, Pune, Hyderabad, NCR, Chennai, Kolkata — veg/Jain filters, safety, PG vs flatshare.",
  path: "/guides",
  keywords: [
    "flatmates guide",
    "find flatmates india",
    "room for rent guide",
    "zero brokerage flatmates",
  ],
});

export default function GuidesIndexPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Guides"
        title="Flatmates & room guides for India"
        lead="Practical answers for finding rooms and compatible flatmates without brokers — city hubs, lifestyle filters, and safer chat."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="glass rounded-2xl p-5 transition hover:border-teal-400/30">
            <h2 className="font-semibold text-white">{g.title}</h2>
            <p className="muted mt-2 text-sm">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
