import { NextResponse } from "next/server";
import type { Place } from "@/lib/geo";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2 || q.length > 80) return NextResponse.json({ places: [] as Place[] });
  const key = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const places = key ? await googlePlaces(q, key) : await nominatim(q);
    return NextResponse.json({ places, provider: key ? "google" : "nominatim" });
  } catch {
    const places = await nominatim(q);
    return NextResponse.json({ places, provider: "nominatim" });
  }
}

async function googlePlaces(q: string, key: string): Promise<Place[]> {
  const auto = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&components=country:in&types=geocode&key=${key}`
  ).then((r) => r.json());
  const preds = (auto.predictions || []).slice(0, 7);
  const out: Place[] = [];
  for (const p of preds) {
    const det = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry,address_component,formatted_address,name&key=${key}`
    ).then((r) => r.json());
    const r = det.result;
    if (!r?.geometry?.location) continue;
    const comps = (r.address_components || []) as { long_name: string; types: string[] }[];
    const pick = (t: string) => comps.find((c) => c.types.includes(t))?.long_name || "";
    const city = pick("locality") || pick("administrative_area_level_2") || pick("administrative_area_level_1");
    const locality = pick("sublocality_level_1") || pick("sublocality") || pick("neighborhood") || r.name || city;
    out.push({
      label: r.formatted_address || p.description,
      city,
      locality,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    });
  }
  return out;
}

async function nominatim(q: string): Promise<Place[]> {
  const rows = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=8&q=${encodeURIComponent(q)}`,
    { headers: { "User-Agent": "flatmates.co.in/1.0 (room-search)" } }
  ).then((r) => r.json());
  return (rows || []).map((r: { display_name: string; lat: string; lon: string; address?: Record<string, string> }) => {
    const a = r.address || {};
    const city = a.city || a.town || a.county || a.state || "";
    const locality = a.suburb || a.neighbourhood || a.village || a.city_district || city;
    return { label: r.display_name, city, locality, lat: Number(r.lat), lng: Number(r.lon) };
  });
}
