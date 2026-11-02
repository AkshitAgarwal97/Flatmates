"use client";

import { useEffect, useState } from "react";
import type { Place } from "@/lib/geo";

export function PlaceSearch({
  city = "",
  locality = "",
  lat = "",
  lng = "",
  label,
}: {
  city?: string;
  locality?: string;
  lat?: string;
  lng?: string;
  label?: string;
}) {
  const [q, setQ] = useState(label || [locality, city].filter(Boolean).join(", "));
  const [hits, setHits] = useState<Place[]>([]);
  const [sel, setSel] = useState({ city, locality, lat, lng });

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(() => {
      void fetch(`/api/places?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setHits(d.places || []));
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative md:col-span-2">
      <input
        className="field"
        name="placeText"
        placeholder="Search any area (Google / Maps) or type Locality, City"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />
      <input type="hidden" name="city" value={sel.city} />
      <input type="hidden" name="locality" value={sel.locality} />
      <input type="hidden" name="lat" value={sel.lat} />
      <input type="hidden" name="lng" value={sel.lng} />
      {hits.length > 0 && (
        <ul className="glass absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl p-1 text-sm">
          {hits.map((p) => (
            <li key={p.label + p.lat}>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10"
                onClick={() => {
                  setQ(p.label);
                  setSel({ city: p.city, locality: p.locality, lat: String(p.lat), lng: String(p.lng) });
                  setHits([]);
                }}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
