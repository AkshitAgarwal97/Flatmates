import type { Listing } from "@/lib/types";

/** Live listings a city page needs before search is a realistic source of visitors. */
export const CITY_RANK_FLOOR = 8;

export function activeListingsInCity(listings: Pick<Listing, "status" | "city">[], city: string): number {
  const key = city.trim().toLowerCase();
  if (!key) return 0;
  return listings.filter((l) => l.status === "active" && l.city.trim().toLowerCase() === key).length;
}

export function cityPageIsThin(count: number): boolean {
  return count < CITY_RANK_FLOOR;
}
