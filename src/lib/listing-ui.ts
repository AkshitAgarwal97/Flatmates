import { live } from "./pay";
import type { Listing, ListingMode, User } from "./types";

export const MODE_LABEL: Record<ListingMode, string> = {
  room_share: "🏠 Share a room",
  seeker: "🔍 Seeking",
  owner: "🏢 Entire flat",
};

export const MODE_DESCRIPTION: Record<ListingMode, string> = {
  room_share: "Current tenant replacing an outgoing flatmate — shared living",
  seeker: "Person actively looking for a place or flatmate",
  owner: "Owner listing — entire flat or house, direct no-broker",
};

export const POSTER_ROLE: Record<ListingMode, string> = {
  room_share: "Current tenant",
  seeker: "Seeker",
  owner: "Owner",
};

const DIET: Record<string, string> = {
  veg: "Veg",
  eggetarian: "Eggetarian",
  nonveg: "Non-veg",
  jain: "Jain",
};

const DIET_ICON: Record<string, string> = {
  veg: "🥦",
  eggetarian: "🥚",
  nonveg: "🍗",
  jain: "🌿",
};

const WASHROOM: Record<string, string> = {
  attached: "Attached bath",
  shared: "Shared bath",
};

const WASHROOM_ICON: Record<string, string> = {
  attached: "🚿",
  shared: "🚽",
};

const PETS: Record<string, string> = {
  friendly: "Pet friendly",
  none: "No pets",
};

const PETS_ICON: Record<string, string> = {
  friendly: "🐾",
  none: "🚫",
};

const FURNISHING: Record<string, string> = {
  full: "Furnished",
  semi: "Semi-furnished",
  none: "Unfurnished",
};

const FURNISHING_ICON: Record<string, string> = {
  full: "🛋️",
  semi: "🪑",
  none: "📦",
};

export function verifiedLabel(user?: User | null) {
  if (!user) return null;
  if (user.badge === "verified_student") return "Verified student";
  if (user.badge === "verified_pro" || live(user.proUntil)) return "Verified professional";
  return null;
}

export function listingPoster(listing: Listing, user?: User | null) {
  return {
    role: POSTER_ROLE[listing.mode],
    name: user?.name || POSTER_ROLE[listing.mode],
    verified: verifiedLabel(user),
    memberSince: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      : null,
  };
}

export function lifestyleChips(listing: Listing) {
  const l = listing.lifestyle;
  return [
    { key: "diet", label: DIET[l.diet] || l.diet, icon: DIET_ICON[l.diet] || "🍽️" },
    { key: "washroom", label: WASHROOM[l.washroom] || l.washroom, icon: WASHROOM_ICON[l.washroom] || "🚿" },
    { key: "pets", label: PETS[l.pets] || l.pets, icon: PETS_ICON[l.pets] || "🐾" },
    { key: "furnishing", label: FURNISHING[l.furnishing] || l.furnishing, icon: FURNISHING_ICON[l.furnishing] || "🛋️" },
  ];
}

export function postersById(users: User[]) {
  return Object.fromEntries(users.map((u) => [u.id, u])) as Record<string, User>;
}
