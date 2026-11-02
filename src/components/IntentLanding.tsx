import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { FaqBlock } from "@/components/FaqBlock";
import { HeroSearch } from "@/components/HeroSearch";
import { PageHeader } from "@/components/PageHeader";
import { CITIES } from "@/lib/hubs";
import type { IntentLanding } from "@/lib/intent-landings";
import { intentCityItems } from "@/lib/intent-landings";
import { breadcrumbJsonLd, cityPath, faqJsonLd, itemListJsonLd } from "@/lib/seo";

export function IntentLandingView({ page }: { page: IntentLanding }) {
  const cityItems = intentCityItems(page.cityLinkLabel);
  return (
    <div className="space-y-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: page.h1, path: page.path },
          ]),
          itemListJsonLd(page.title, cityItems),
          faqJsonLd(page.faqs),
        ]}
      />
      <section className="glass rounded-3xl p-8 md:p-10 space-y-4">
        <PageHeader kicker={page.kicker} title={page.h1} lead={page.intro} />
        <HeroSearch defaultIntent={page.path.includes("roommate") ? "roommates" : "rooms"} />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={page.primaryCta.href} className="btn">
            {page.primaryCta.label}
          </Link>
          <Link href={page.secondaryCta.href} className="btn-ghost">
            {page.secondaryCta.label}
          </Link>
          <Link href="/flatmates" className="btn-ghost">
            All metro cities
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {page.pillars.map(([t, d]) => (
          <div key={t} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="muted mt-2 text-sm">{d}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Search by metro city</h2>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <Link key={city} href={cityPath(city)} className="btn-ghost text-xs">
              {page.cityLinkLabel(city)}
            </Link>
          ))}
        </div>
      </section>

      <FaqBlock faqs={page.faqs} />
    </div>
  );
}
