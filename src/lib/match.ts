import type { Lifestyle, Listing, User } from "./types";

export type MatchResult = {
  score: number;
  greens: string[];
  ambers: string[];
};

const W = { budget: 0.28, gender: 0.18, diet: 0.18, habits: 0.2, loc: 0.16 };

export function scorePair(
  seeker: { rent: number; city: string; locality: string; lifestyle: Lifestyle },
  listing: Listing
): MatchResult {
  const greens: string[] = [];
  const ambers: string[] = [];
  const sl = seeker.lifestyle;
  const ll = listing.lifestyle;

  let sBudget = 1;
  if (listing.mode !== "seeker") {
    if (listing.rent <= seeker.rent) {
      sBudget = 1;
      greens.push("Within budget");
    } else if (listing.rent <= seeker.rent * 1.15) {
      sBudget = 0.6;
      ambers.push(`Slightly over budget (₹${listing.rent.toLocaleString("en-IN")})`);
    } else {
      sBudget = 0.15;
      ambers.push("Above budget");
    }
  }

  let sGender = 0.5;
  if (ll.genderPref === "anyone" || sl.genderPref === "anyone" || ll.genderPref === sl.genderPref) {
    sGender = 1;
    greens.push("Gender preference aligned");
  } else if (ll.genderPref === "lgbtq" || sl.genderPref === "lgbtq" || ll.genderPref === "couple") {
    sGender = 0.7;
  } else {
    sGender = 0.2;
    ambers.push("Gender preference mismatch");
  }

  let sDiet = 0.4;
  if (sl.diet === ll.diet) {
    sDiet = 1;
    greens.push(sl.diet === "veg" || sl.diet === "jain" ? "Both vegetarian / Jain" : "Diet match");
  } else if ((sl.diet === "veg" || sl.diet === "jain") && ll.diet === "nonveg") {
    sDiet = 0.25;
    ambers.push("Veg seeker vs non-veg kitchen");
  } else {
    sDiet = 0.65;
  }

  let sHabits = 0;
  let bits = 0;
  if (sl.smoking === ll.smoking) {
    bits += 1;
    if (sl.smoking === "no") greens.push("Both non-smokers");
  } else {
    ambers.push("Smoking mismatch");
  }
  if (sl.drinking === ll.drinking) bits += 1;
  else ambers.push("Drinking mismatch");
  if (sl.pets === ll.pets) bits += 1;
  else ambers.push("Pet policy mismatch");
  if (sl.schedule === ll.schedule) bits += 1;
  sHabits = bits / 4;

  let sLoc = 0.3;
  if (seeker.city === listing.city && seeker.locality === listing.locality) {
    sLoc = 1;
    greens.push(`Same micro-market: ${listing.locality}`);
  } else if (seeker.city === listing.city) {
    sLoc = 0.7;
    greens.push(`Same city: ${listing.city}`);
  }

  const score = Math.round(
    100 *
      (W.budget * sBudget +
        W.gender * sGender +
        W.diet * sDiet +
        W.habits * sHabits +
        W.loc * sLoc)
  );
  return { score, greens: Array.from(new Set(greens)), ambers: Array.from(new Set(ambers)) };
}

export function viewerAsSeeker(
  user: User | null,
  listings: Listing[],
  fallbackCity = "Bengaluru"
) {
  const seeker = listings.find((l) => l.userId === user?.id && l.mode === "seeker" && l.status === "active");
  return (
    seeker || {
      rent: 25000,
      city: fallbackCity,
      locality: "",
      lifestyle: {
        genderPref: "anyone" as const,
        diet: "veg" as const,
        smoking: "no" as const,
        drinking: "no" as const,
        occupation: "it" as const,
        schedule: "office" as const,
        pets: "none" as const,
        guests: "no_parties" as const,
        washroom: "attached" as const,
        roomType: "private" as const,
        furnishing: "semi" as const,
      },
    }
  );
}
