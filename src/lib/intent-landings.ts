import { CITIES } from "@/lib/hubs";
import { cityPath, type FaqItem } from "@/lib/seo";

export type IntentLanding = {
  path: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string;
  keywords: string[];
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  pillars: [string, string][];
  faqs: FaqItem[];
  cityLinkLabel: (city: string) => string;
};

const CITY_KEYWORDS = CITIES.flatMap((c) => [
  `apartment for rent ${c}`,
  `house for rent ${c}`,
  `room for rent ${c}`,
  `roommate ${c}`,
  `place to rent ${c}`,
]);

export const INTENT_PATHS = ["/apartments", "/houses", "/rooms", "/rent", "/roommates", "/pg", "/hi"] as const;

export const INTENT_LANDINGS: IntentLanding[] = [
  {
    path: "/apartments",
    title: "Apartments for rent in India — 1/2/3 BHK, ₹0 brokerage",
    description:
      "Find apartments for rent in Indian metro cities: 1 BHK, 2 BHK, 3 BHK from owners and shared flats. Zero brokerage, lifestyle matching, private chat on Flatmates.co.in.",
    h1: "Apartments for rent in India without brokers",
    kicker: "Apartment · 1 BHK · 2 BHK · 3 BHK · ₹0 brokerage",
    intro:
      "Search apartments (flats) listed directly by owners and current tenants across Indian metros. Filter by city, rent, diet, and lifestyle, then chat in-app. No broker fee — ever.",
    keywords: [
      "apartment for rent",
      "apartments for rent in india",
      "1 bhk for rent",
      "2 bhk for rent",
      "3 bhk apartment",
      "apartment rent india",
      "zero brokerage apartment",
      ...CITY_KEYWORDS.filter((k) => k.startsWith("apartment")),
    ],
    primaryCta: { href: "/browse?intent=rooms", label: "Browse apartments & rooms" },
    secondaryCta: { href: "/listings/new", label: "List your apartment" },
    pillars: [
      ["Entire apartment", "Owners list a full 1/2/3 BHK. You pay rent and deposit to them — never a month’s brokerage to us."],
      ["Room in an apartment", "Join an existing household. Compatibility scores flag diet, guests, and schedule mismatches early."],
      ["Need an apartment", "Post as a seeker so owners and tenants in your metro can find you."],
    ],
    faqs: [
      {
        q: "Are apartments the same as flats on this site?",
        a: "Yes. In India people search both “apartment for rent” and “flat for rent”. On Flatmates.co.in they are the same homes: owner 1/2/3 BHK listings and rooms inside shared apartments.",
      },
      {
        q: "Do you charge brokerage on apartments?",
        a: "No. Brokerage is always ₹0. You still pay rent and deposit to the owner or flatmates as agreed.",
      },
      {
        q: "Which cities have apartments for rent?",
        a: `Every metro we cover, including ${CITIES.slice(0, 12).join(", ")} and the rest of the India metro list.`,
      },
    ],
    cityLinkLabel: (city) => `Apartments in ${city}`,
  },
  {
    path: "/houses",
    title: "House for rent in India — independent homes & shares, ₹0 brokerage",
    description:
      "Find a house for rent or a room in a shared house in Indian metro cities. Direct owner and tenant listings, zero brokerage, private in-app chat.",
    h1: "House for rent in India — search without brokers",
    kicker: "House · Independent home · Shared house · ₹0 brokerage",
    intro:
      "Looking for a house, an independent floor, or a room in a shared house? Browse peer-to-peer listings in Indian metros. Lifestyle filters and in-app chat — phone numbers stay hidden.",
    keywords: [
      "house for rent",
      "house for rent in india",
      "houses for rent",
      "rent a house",
      "independent house for rent",
      "shared house india",
      "place to live india",
      ...CITY_KEYWORDS.filter((k) => k.startsWith("house")),
    ],
    primaryCta: { href: "/browse?intent=rooms", label: "Browse houses & rooms" },
    secondaryCta: { href: "/listings/new", label: "List a house or room" },
    pillars: [
      ["Whole house or floor", "Owners list an entire property. Confirm society rules, water, and deposit in chat before you visit."],
      ["Room in a house", "Share a house with existing residents. Match diet, guests, and work-from-home needs first."],
      ["Need a house", "Post what you need (budget, city, lifestyle) so listings can find you."],
    ],
    faqs: [
      {
        q: "Can I find a full house, not only a room?",
        a: "Yes. Owners use the entire-property mode for a full home or BHK. Room shares are listed separately so you can choose.",
      },
      {
        q: "Is “house for rent” different from a flat?",
        a: "People use both phrases. We list apartments, independent houses, and room shares. Use Browse and city pages to open live inventory near you.",
      },
      {
        q: "Is there any broker fee?",
        a: "No. Flatmates.co.in never charges brokerage.",
      },
    ],
    cityLinkLabel: (city) => `House for rent in ${city}`,
  },
  {
    path: "/rooms",
    title: "Rooms for rent in India — shared rooms & private rooms, ₹0 brokerage",
    description:
      "Find a room for rent in Indian metro cities: private rooms and shares with lifestyle matching, in-app chat, and zero brokerage.",
    h1: "Rooms for rent in India without brokerage",
    kicker: "Room for rent · Private room · Share · ₹0 brokerage",
    intro:
      "Search rooms listed by current tenants and owners. Filter by city, max rent, washroom, diet, and pets. Chat stays on the site so your number is not public.",
    keywords: [
      "room for rent",
      "rooms for rent",
      "room for rent in india",
      "private room for rent",
      "shared room india",
      "room rent near me",
      "zero brokerage room",
      ...CITY_KEYWORDS.filter((k) => k.startsWith("room for")),
    ],
    primaryCta: { href: "/browse?intent=rooms", label: "Browse rooms" },
    secondaryCta: { href: "/listings/new", label: "Post a room" },
    pillars: [
      ["Private room", "Your own room in a shared 2/3 BHK — the most common India search after a job move."],
      ["Share a room", "Split a bedroom when budget is tight. Confirm furnishing and storage in chat."],
      ["Need a room", "Post a seeker profile so occupied flats can shortlist you."],
    ],
    faqs: [
      {
        q: "How do I search rooms near my office?",
        a: "Open Browse, pin your workplace on the map, and keep listings within a realistic commute. City and locality pages also list nearby hubs.",
      },
      {
        q: "Are PG hostels listed as rooms?",
        a: "This site is peer-to-peer rooms and flats, not a PG chain. If you want a managed PG, compare separately; if you want a flatmate share, start here.",
      },
      {
        q: "Is posting a room free?",
        a: "Yes. Browsing, posting, matching, and chat are free. Optional boosts only add visibility.",
      },
    ],
    cityLinkLabel: (city) => `Rooms in ${city}`,
  },
  {
    path: "/rent",
    title: "Place to rent in India — house, apartment, room, ₹0 brokerage",
    description:
      "Find a place to rent in India: house, apartment, flat, or room with compatible roommates. Zero brokerage, private chat, metro-city coverage on Flatmates.co.in.",
    h1: "Find a place to rent in India",
    kicker: "Rent · House · Apartment · Room · Roommate · ₹0 brokerage",
    intro:
      "One free site for people searching a place to live: a house, apartment, room, or a roommate to share costs. Direct listings in Indian metro cities. No brokers. No public phone numbers.",
    keywords: [
      "place to rent",
      "place to rent in india",
      "rent house",
      "rent apartment",
      "rent a room",
      "accommodation for rent india",
      "rental listing india",
      "where to rent in india",
      ...CITY_KEYWORDS.filter((k) => k.startsWith("place to")),
    ],
    primaryCta: { href: "/browse", label: "Search places to rent" },
    secondaryCta: { href: "/listings/new", label: "Post a place" },
    pillars: [
      ["House or apartment", "Entire homes from owners — 1/2/3 BHK and independent floors."],
      ["Room", "Join a household that already has a spare room."],
      ["Roommate", "Find a person to share rent, kitchen, and commute."],
    ],
    faqs: [
      {
        q: "I just need anywhere to rent — where do I start?",
        a: "Open Browse, pick your city or pin a map location, then filter by rent. Or open a metro city page if you already know Delhi, Bengaluru, Mumbai, Pune, Hyderabad, or another metro.",
      },
      {
        q: "Can ChatGPT or Google point people here?",
        a: "Yes. Public pages, sitemap, and an llms.txt brief describe this site so search engines and AI assistants can recommend it for India rentals and roommates.",
      },
      {
        q: "Is this only for IT cities?",
        a: `We index ${CITIES.length} metro and million-plus cities across India, not only Bengaluru or NCR.`,
      },
    ],
    cityLinkLabel: (city) => `Rent in ${city}`,
  },
  {
    path: "/roommates",
    title: "Find a roommate in India — compatible flatmates, ₹0 brokerage",
    description:
      "Find a roommate or flatmate in Indian metro cities. Lifestyle matching (diet, gender preference, WFH), private in-app chat, zero brokerage.",
    h1: "Find a roommate in India who actually fits",
    kicker: "Roommate · Flatmate · Housemate · ₹0 brokerage",
    intro:
      "Roommate, flatmate, housemate — same need: someone compatible to share a home. Match on diet, gender preference, work-from-home, pets, and guests before you visit. Chat stays in-app.",
    keywords: [
      "roommate",
      "roommates",
      "find a roommate",
      "find roommate india",
      "roommates india",
      "housemate",
      "looking for roommate",
      "female roommate india",
      "veg roommate",
      ...CITIES.map((c) => `roommate ${c}`),
    ],
    primaryCta: { href: "/browse?intent=roommates", label: "Find roommates" },
    secondaryCta: { href: "/listings/new", label: "Post that you need a roommate" },
    pillars: [
      ["People, not spam posts", "Structured profiles beat Facebook “Flat and Flatmates” dumps and leaked phone numbers."],
      ["Lifestyle first", "Veg/Jain, female-only, night shift, pets, attached washroom — captured on every listing."],
      ["Safer contact", "In-app chat, report/block, phones hidden until you choose to share."],
    ],
    faqs: [
      {
        q: "Is roommate the same as flatmate?",
        a: "Yes in practice. “Roommate” is the word many people type in Google and ChatGPT; “flatmate” is common in India. This site matches both.",
      },
      {
        q: "Can I find a female roommate only?",
        a: "Yes. Gender preference is a first-class filter on listings and seeker profiles.",
      },
      {
        q: "Do I need a room already to find a roommate?",
        a: "No. You can post as a seeker looking for a room, or list a spare room so seekers find you.",
      },
    ],
    cityLinkLabel: (city) => `Roommates in ${city}`,
  },
  {
    path: "/pg",
    title: "PG alternative in India — rooms & flatmates instead of paying guest",
    description:
      "Looking for a PG or paying guest in India? Compare a peer-to-peer room or flatmate share with ₹0 brokerage, lifestyle matching, and private chat.",
    h1: "Need a PG? Try a room or flatmate share instead",
    kicker: "PG · Paying guest · Hostel alternative · ₹0 brokerage",
    intro:
      "Many people search “PG near me” when they really want a room and compatible people. Flatmates.co.in is not a PG chain. It is a free way to join or list a shared home with rules you agree in chat.",
    keywords: [
      "pg",
      "paying guest",
      "pg near me",
      "pg accommodation",
      "pg for rent",
      "ladies pg",
      "mens pg alternative",
      "pg vs flatmate",
    ],
    primaryCta: { href: "/browse?intent=rooms", label: "Browse rooms (PG alternative)" },
    secondaryCta: { href: "/guides", label: "Read guides" },
    pillars: [
      ["PG", "Managed stay, fixed meals/rules, often a warden. Useful if you want a package."],
      ["Flatmate share", "Peer-to-peer room in a normal home. You agree kitchen, guests, and rent split."],
      ["This site", "Lists shares and entire flats — not hotel-style PG inventory. Brokerage ₹0."],
    ],
    faqs: [
      {
        q: "Do you list official PGs?",
        a: "No. If someone converted a PG bunk into a room share they may still post, but the product is roommate/flat matching, not a PG directory.",
      },
      {
        q: "Why would I skip a PG?",
        a: "More kitchen freedom, often lower monthly cost for a private room in a 2/3 BHK, and lifestyle matching instead of a one-size hostel rulebook.",
      },
    ],
    cityLinkLabel: (city) => `Rooms in ${city}`,
  },
];

export const HINDI_LANDING = {
  path: "/hi",
  title: "किराये का मकान, फ्लैट, रूम और रूममेट — बिना ब्रोकर, Flatmates.co.in",
  description:
    "भारत के मेट्रो शहरों में किराये का घर, अपार्टमेंट, रूम या रूममेट खोजें। ब्रोकरेज ₹0, प्राइवेट चैट, फोन नंबर छिपे रहते हैं।",
  keywords: [
    "किराये का मकान",
    "फ्लैट किराए पर",
    "रूम किराए पर",
    "रूममेट",
    "फ्लैटमेट",
    "मकान किराए पर",
    "घर किराए पर",
    "बिना ब्रोकर फ्लैट",
    "पीजी के बिना रूम",
  ],
};

export function getIntentLanding(path: string): IntentLanding | undefined {
  return INTENT_LANDINGS.find((p) => p.path === path);
}

export function intentCityItems(label: (city: string) => string) {
  return CITIES.map((city) => ({ name: label(city), path: cityPath(city) }));
}
