"use client";

import { useState } from "react";
import { PlaceSearch } from "./PlaceSearch";

export function BrowseFilters({
  intent,
  city,
  locality,
  lat,
  lng,
  placeLabel,
  q,
  maxRent,
  diet,
  washroom,
  pets,
}: {
  intent: string;
  city?: string;
  locality?: string;
  lat?: string;
  lng?: string;
  placeLabel: string;
  q?: string;
  maxRent?: string;
  diet?: string;
  washroom?: string;
  pets?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <form className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-4 lg:grid-cols-8" onSubmit={() => setPending(true)}>
      <input type="hidden" name="intent" value={intent} />
      <input name="q" defaultValue={q} className="field md:col-span-2" placeholder="Keyword" />
      <PlaceSearch city={city} locality={locality} lat={lat} lng={lng} label={placeLabel} />
      <input name="maxRent" type="number" defaultValue={maxRent} className="field" placeholder="Max ₹" />
      <select name="diet" defaultValue={diet || ""} className="field">
        <option value="">Diet</option>
        <option value="veg">Veg</option>
        <option value="jain">Jain</option>
        <option value="nonveg">Non-veg</option>
      </select>
      <select name="washroom" defaultValue={washroom || ""} className="field">
        <option value="">Washroom</option>
        <option value="attached">Attached</option>
        <option value="shared">Shared</option>
      </select>
      <select name="pets" defaultValue={pets || ""} className="field">
        <option value="">Pets</option>
        <option value="friendly">Pet friendly</option>
        <option value="none">No pets</option>
      </select>
      <button className="btn" disabled={pending}>
        {pending ? "Filtering…" : "Filter"}
      </button>
    </form>
  );
}
