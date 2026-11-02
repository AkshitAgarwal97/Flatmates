"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  path: string;
  title: string;
  city: string;
  locality: string;
  rent: number;
  lat: number;
  lng: number;
};

export function ListingsMap({ pins }: { pins: MapPin[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const cities = useMemo(() => Array.from(new Set(pins.map((p) => p.city))).sort(), [pins]);
  const [city, setCity] = useState("");
  const [ready, setReady] = useState(false);
  const shown = city ? pins.filter((p) => p.city === city) : pins;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !el) return;

      const valid = shown.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      const center: [number, number] = valid[0] ? [valid[0].lat, valid[0].lng] : [20.5937, 78.9629];
      const instance = L.map(el).setView(center, valid.length ? 11 : 5);
      map = instance;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(instance);

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:14px;height:14px;border-radius:999px;background:#0f766e;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const bounds: [number, number][] = [];
      for (const p of valid) {
        bounds.push([p.lat, p.lng]);
        L.marker([p.lat, p.lng], { icon })
          .addTo(instance)
          .bindPopup(
            `<a href="${p.path}" style="font-weight:600">${p.title}</a><br/><span>${p.locality}, ${p.city}</span><br/>₹${p.rent.toLocaleString("en-IN")}/mo`
          );
      }
      if (bounds.length > 1) instance.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      setReady(false);
    };
  }, [shown]);

  return (
    <div className="space-y-3">
      <select className="field max-w-xs" value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter map by city">
        <option value="">All metro cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="relative">
        {!ready && <div className="skeleton absolute inset-0 z-10 rounded-2xl" aria-hidden />}
        <div ref={ref} className="h-[420px] w-full overflow-hidden rounded-2xl border border-line" />
      </div>
    </div>
  );
}
