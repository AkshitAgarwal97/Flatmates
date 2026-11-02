"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CITIES, HUBS } from "@/lib/hubs";
import { GUIDES } from "@/lib/guides";
import { cityPath, localityPath } from "@/lib/seo";

const INTENTS = [
  ["/rent", "Place to rent"],
  ["/apartments", "Apartments"],
  ["/houses", "Houses"],
  ["/rooms", "Rooms"],
  ["/roommates", "Roommates"],
  ["/flat", "Flats"],
  ["/pg", "PG alternative"],
  ["/hi", "हिन्दी"],
] as const;

export function DirectoryBrowser() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const cities = useMemo(
    () => CITIES.filter((c) => !query || c.toLowerCase().includes(query)),
    [query]
  );

  const byCity = useMemo(() => {
    return CITIES.map((city) => ({
      city,
      hubs: HUBS.filter(
        (h) =>
          h.city === city &&
          (!query || h.locality.toLowerCase().includes(query) || h.city.toLowerCase().includes(query))
      ),
    })).filter((row) => row.hubs.length);
  }, [query]);

  const guides = useMemo(
    () => GUIDES.filter((g) => !query || `${g.title} ${g.description}`.toLowerCase().includes(query)),
    [query]
  );

  return (
    <div className="space-y-6">
      <input
        className="field max-w-md"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter cities, localities, guides"
        aria-label="Filter directory"
      />

      <section>
        <h2 className="mb-2 text-lg font-semibold">Search intents</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {INTENTS.map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="kicker hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Metro cities</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {cities.map((c) => (
            <li key={c}>
              <Link href={cityPath(c)} className="kicker hover:underline">
                Flatmates in {c}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Localities</h2>
        <div className="space-y-2">
          {byCity.map(({ city, hubs }) => (
            <details key={city} className="glass rounded-xl px-4 py-1.5">
              <summary className="cursor-pointer font-medium">
                {city} <span className="muted-2 text-xs">({hubs.length})</span>
              </summary>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2 pb-2 text-sm">
                {hubs.map((h) => (
                  <li key={h.locality}>
                    <Link href={localityPath(h.city, h.locality)} className="kicker hover:underline">
                      {h.locality}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Guides</h2>
        <ul className="space-y-1.5 text-sm">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="kicker hover:underline">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
