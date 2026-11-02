import { cityPath, localityPath } from "@/lib/seo";
import type { Guide } from "@/lib/guides-types";
import { METRO_GUIDES } from "@/lib/metro-guides";

export type { Guide, GuideSection } from "@/lib/guides-types";

const CORE_GUIDES: Guide[] = [
  {
    slug: "find-flatmates-india",
    title: "How to find flatmates in India online (without brokers)",
    description:
      "A practical guide to finding compatible flatmates in Indian cities online — zero brokerage, lifestyle filters, and safer chat.",
    keywords: ["find flatmates india", "flatmates online", "flat and flatmates", "roommates india"],
    answer:
      "To find flatmates in India without brokers, use a structured platform like Flatmates.co.in: post or browse room/seeker listings in your city, filter by diet and lifestyle, check compatibility scores, and chat in-app so phone numbers stay private. Brokerage stays ₹0.",
    sections: [
      {
        heading: "Why Facebook groups feel broken",
        body: "“Flat and Flatmates” groups mix spam, brokers, fake posts, and public phone numbers. You waste time DMing strangers with no shared lifestyle data. A dedicated flatmate site structures city, rent, diet, gender preference, and habits up front.",
      },
      {
        heading: "Steps that actually work",
        body: "1) Decide city and micro-market (e.g. HSR, Powai, Hinjawadi). 2) Set budget and non-negotiables (veg, female-only, attached washroom). 3) Browse rooms or create a seeker profile. 4) Rank by compatibility. 5) Chat in-app, schedule visits, confirm deposit terms in writing.",
      },
      {
        heading: "Safety basics",
        body: "Never pay advance to unknown accounts. Prefer video calls before visiting. Meet in daylight. Keep early chats on-platform. Flatmates.co.in hides phones by default and offers report/block tools.",
      },
    ],
    faqs: [
      {
        q: "Is Flatmates.co.in free?",
        a: "Yes for browsing, posting, matching, and chat. Optional boosts are separate; core matching stays free.",
      },
      {
        q: "Which Indian cities are covered?",
        a: "All Indian metro cities on Flatmates.co.in — Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, and the rest of the metro list including NCR, Kochi, Jaipur, Chandigarh, and more.",
      },
    ],
    relatedPaths: [
      { href: "/browse?intent=roommates", label: "Browse roommates" },
      { href: cityPath("Bengaluru"), label: "Bengaluru flatmates" },
      { href: cityPath("Mumbai"), label: "Mumbai flatmates" },
    ],
  },
  {
    slug: "room-for-rent-zero-brokerage",
    title: "Room for rent without brokerage in India",
    description:
      "Find rooms and flats for rent with ₹0 brokerage — direct from tenants and owners on Flatmates.co.in.",
    keywords: ["room for rent without brokerage", "zero brokerage room", "no broker flat", "direct owner flat"],
    answer:
      "Zero-brokerage rooms mean you deal with the current tenant or owner directly. On Flatmates.co.in every listing is peer-to-peer with ₹0 brokerage, lifestyle tags, and in-app chat — no middleman fee baked into rent.",
    sections: [
      {
        heading: "What “zero brokerage” really means",
        body: "Brokers typically charge one month’s rent. Direct listings remove that fee. You still pay rent and deposit to the landlord or flatmates as agreed — just no platform brokerage.",
      },
      {
        heading: "Room share vs entire flat",
        body: "Use “share a room” when a flat is already occupied and one bed/room is free. Use “entire property” when an owner lists a full 1/2/3 BHK. Seekers can also post what they need so owners find them.",
      },
      {
        heading: "How to compare listings",
        body: "Check locality, rent + deposit, washroom type, furnishing, diet rules, guest policy, and commute to your office. Compatibility scores surface mismatches early.",
      },
    ],
    faqs: [
      {
        q: "Do owners list entire flats here?",
        a: "Yes. Mode C is for owners renting 1/2/3 BHK directly without broker involvement.",
      },
      {
        q: "Can I filter by max rent?",
        a: "Yes on Browse — set max ₹ plus city/locality or a Maps pin within 25 km.",
      },
    ],
    relatedPaths: [
      { href: "/browse?intent=rooms", label: "Find rooms" },
      { href: "/listings/new", label: "Post a room" },
      { href: cityPath("Pune"), label: "Pune rooms" },
    ],
  },
  {
    slug: "share-room-bangalore",
    title: "Share a room in Bangalore (Bengaluru) — flatmates guide",
    description:
      "Find room shares and flatmates in Bengaluru hubs like Koramangala, HSR, Indiranagar, and Whitefield with ₹0 brokerage.",
    keywords: ["share room bangalore", "flatmates bangalore", "bengaluru roommates", "koramangala flatmate"],
    answer:
      "To share a room in Bangalore, browse Flatmates.co.in Bengaluru hubs (Koramangala, HSR Layout, Indiranagar, Whitefield), filter by budget and lifestyle, then chat in-app. Listings are direct — brokerage is ₹0.",
    sections: [
      {
        heading: "Popular Bengaluru micro-markets",
        body: "Koramangala and HSR suit many startups and mid-town offices. Indiranagar is denser and social. Whitefield fits IT corridor commutes. Pick locality pages for live listings near each hub.",
      },
      {
        heading: "What to ask before joining a flat",
        body: "Confirm deposit split, maintenance, Wi-Fi, cleaning roster, guest rules, and notice period. Match diet and work schedules if you WFH — noise and washroom access matter daily.",
      },
    ],
    faqs: [
      {
        q: "Is Bangalore or Bengaluru used on the site?",
        a: "We use Bengaluru as the city name; people searching Bangalore still find the same hub pages and listings.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Bengaluru"), label: "Bengaluru flatmates" },
      { href: localityPath("Bengaluru", "HSR Layout"), label: "HSR Layout" },
      { href: localityPath("Bengaluru", "Koramangala"), label: "Koramangala" },
    ],
  },
  {
    slug: "share-room-mumbai",
    title: "Share a room in Mumbai — Bandra, Powai, Andheri flatmates",
    description: "Find Mumbai room shares and flatmates in Bandra, Powai, and Andheri without brokerage.",
    keywords: ["flatmates mumbai", "share room mumbai", "bandra flatmate", "powai roommates"],
    answer:
      "Mumbai room shares on Flatmates.co.in cover hubs like Bandra, Powai, and Andheri. Filter by rent, diet, and lifestyle, then message via in-app chat. No brokerage fees.",
    sections: [
      {
        heading: "Choosing a Mumbai locality",
        body: "Bandra is premium and connected. Powai attracts professionals near tech parks. Andheri balances commute and rent for many IT/corporate roles. Compare deposit norms carefully — Mumbai deposits can be high.",
      },
      {
        heading: "Commute reality check",
        body: "Local trains and traffic change daily life more than listing photos. Pin your office on Browse’s place search and prefer listings within a realistic commute radius.",
      },
    ],
    faqs: [
      {
        q: "Can I find female-only flatmates in Mumbai?",
        a: "Yes — gender preference is a first-class lifestyle field on listings and seeker profiles.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Mumbai"), label: "Mumbai flatmates" },
      { href: localityPath("Mumbai", "Bandra"), label: "Bandra" },
      { href: localityPath("Mumbai", "Powai"), label: "Powai" },
    ],
  },
  {
    slug: "share-room-pune",
    title: "Flatmates in Pune — Hinjawadi room shares",
    description: "Find Pune flatmates and rooms near Hinjawadi and IT parks with zero brokerage.",
    keywords: ["flatmates pune", "hinjawadi room share", "pune roommates"],
    answer:
      "For Pune IT corridors like Hinjawadi, use Flatmates.co.in to find room shares and seekers with lifestyle matching and ₹0 brokerage. Chat stays private in-app.",
    sections: [
      {
        heading: "Hinjawadi tips",
        body: "Many listings target working professionals near IT parks. Confirm cab/pool arrangements, night-shift comfort, and whether the flat allows late arrivals.",
      },
    ],
    faqs: [
      {
        q: "Are student flatmates allowed?",
        a: "Occupation tags include student and IT/professional — filter for the mix you want.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Pune"), label: "Pune flatmates" },
      { href: localityPath("Pune", "Hinjawadi"), label: "Hinjawadi" },
    ],
  },
  {
    slug: "share-room-hyderabad",
    title: "Flatmates in Hyderabad — Gachibowli & Madhapur",
    description: "Find Hyderabad rooms and flatmates in Gachibowli and Madhapur without brokers.",
    keywords: ["flatmates hyderabad", "gachibowli room", "madhapur flatmates"],
    answer:
      "Hyderabad seekers often start in Gachibowli or Madhapur. Flatmates.co.in lists room shares and entire flats there with lifestyle filters and zero brokerage.",
    sections: [
      {
        heading: "Gachibowli vs Madhapur",
        body: "Both serve the IT corridor. Compare rent, distance to your office campus, and weekend connectivity. Use locality pages for live inventory.",
      },
    ],
    faqs: [
      {
        q: "Can owners list 2BHK/3BHK in Hyderabad?",
        a: "Yes via the entire-property listing mode.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Hyderabad"), label: "Hyderabad flatmates" },
      { href: localityPath("Hyderabad", "Gachibowli"), label: "Gachibowli" },
      { href: localityPath("Hyderabad", "Madhapur"), label: "Madhapur" },
    ],
  },
  {
    slug: "share-room-gurugram-noida",
    title: "Flatmates in Gurugram & Noida (NCR)",
    description: "Find roommates near Gurugram Cyber City and Noida Sector 62 with ₹0 brokerage.",
    keywords: ["flatmates gurgaon", "flatmates gurugram", "noida flatmates", "cyber city roommates"],
    answer:
      "For NCR, browse Flatmates.co.in hubs in Gurugram (Cyber City) and Noida (Sector 62). Match on commute, diet, and schedule, then chat in-app — brokerage is ₹0.",
    sections: [
      {
        heading: "NCR commute note",
        body: "Cyber City and Sector 62 serve different office clusters. Pin your workplace and prefer listings within a workable radius rather than city-wide searches alone.",
      },
    ],
    faqs: [
      {
        q: "Is it Gurgaon or Gurugram on the site?",
        a: "We use Gurugram; searches for Gurgaon flatmates still map to the same hub content.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Gurugram"), label: "Gurugram flatmates" },
      { href: cityPath("Noida"), label: "Noida flatmates" },
      { href: localityPath("Gurugram", "Cyber City"), label: "Cyber City" },
    ],
  },
  {
    slug: "share-room-chennai-kolkata",
    title: "Flatmates in Chennai (OMR) & Kolkata (Salt Lake)",
    description: "Find Chennai OMR and Kolkata Salt Lake room shares without brokerage.",
    keywords: ["flatmates chennai", "omr room share", "flatmates kolkata", "salt lake roommates"],
    answer:
      "Chennai IT seekers often look along OMR; Kolkata professionals often prefer Salt Lake. Flatmates.co.in covers both hubs with direct listings and lifestyle matching.",
    sections: [
      {
        heading: "OMR and Salt Lake",
        body: "OMR spans a long corridor — locality and pin-based browse help more than city-only filters. Salt Lake remains a classic professional hub for Kolkata flatmates.",
      },
    ],
    faqs: [
      {
        q: "Can I post as a seeker in these cities?",
        a: "Yes. Create a seeker profile with budget and lifestyle so rooms can find you.",
      },
    ],
    relatedPaths: [
      { href: cityPath("Chennai"), label: "Chennai flatmates" },
      { href: cityPath("Kolkata"), label: "Kolkata flatmates" },
      { href: localityPath("Chennai", "OMR"), label: "OMR" },
    ],
  },
  {
    slug: "veg-jain-flatmate",
    title: "How to find veg or Jain flatmates in India",
    description: "Filter for vegetarian and Jain flatmates and kitchen rules before you move in.",
    keywords: ["veg flatmate", "jain flatmate", "vegetarian roommates india", "pure veg flat"],
    answer:
      "On Flatmates.co.in every listing captures diet: veg, eggetarian, non-veg, or Jain. Filter Browse by diet, check compatibility greens/ambers, and confirm kitchen rules in chat before paying deposit.",
    sections: [
      {
        heading: "Why diet matching matters",
        body: "Shared kitchens fail when one person needs Jain/veg-only surfaces and another cooks non-veg daily. Capture diet preference early instead of discovering conflict after move-in.",
      },
      {
        heading: "Questions to ask",
        body: "Separate utensils? Non-veg only on certain days? Fridge shelves? Guests bringing food? Put agreements in chat history.",
      },
    ],
    faqs: [
      {
        q: "Can I filter only Jain listings?",
        a: "Yes — use the diet filter on Browse, or look for Jain tags on listing cards and compatibility panels.",
      },
    ],
    relatedPaths: [
      { href: "/browse?diet=veg", label: "Browse veg" },
      { href: "/browse?diet=jain", label: "Browse Jain" },
      { href: "/guides/find-flatmates-india", label: "Find flatmates guide" },
    ],
  },
  {
    slug: "wfh-flatmate",
    title: "Finding WFH-friendly flatmates",
    description: "Match work-from-home schedules, quiet hours, and washroom access with compatible flatmates.",
    keywords: ["wfh flatmate", "work from home roommates", "quiet flat share"],
    answer:
      "Choose listings tagged for WFH schedules on Flatmates.co.in, then confirm quiet hours, video-call norms, and daytime washroom access in chat. Compatibility scoring highlights schedule mismatches.",
    sections: [
      {
        heading: "WFH friction points",
        body: "Daytime guests, loud TV, shared washrooms during meetings, and night-shift reverse schedules create conflict. Lifestyle tags for schedule (WFH / office / night) help shortlist.",
      },
    ],
    faqs: [
      {
        q: "Does the site store work schedule?",
        a: "Yes — WFH, office goer, or night shift is part of the lifestyle matrix.",
      },
    ],
    relatedPaths: [
      { href: "/browse", label: "Browse listings" },
      { href: "/listings/new", label: "Post with WFH tags" },
    ],
  },
  {
    slug: "female-flatmates-only",
    title: "Female-only flatmates and safer room shares",
    description: "How to find female-only flatshares in India with privacy-first chat.",
    keywords: ["female flatmates", "female only flat", "girls flatshare india"],
    answer:
      "Use gender-preference filters and female-only listings on Flatmates.co.in, keep early contact in-app, and verify people on video before visits. Phone numbers stay hidden until you choose to share them.",
    sections: [
      {
        heading: "Using gender preference correctly",
        body: "Lister and seeker profiles can set female-only, male-only, anyone, couple-friendly, or LGBTQ+ friendly. Respect the preference shown — it is a stated house rule, not a suggestion.",
      },
      {
        heading: "Safety checklist",
        body: "Video call first, share live location with a friend when visiting, avoid cash-only deposits without receipt, and report suspicious listings on-platform.",
      },
    ],
    faqs: [
      {
        q: "Will my number appear on the listing?",
        a: "No. Flatmates.co.in keeps phones hidden; chat is in-app.",
      },
    ],
    relatedPaths: [
      { href: "/browse?intent=roommates", label: "Find roommates" },
      { href: "/guides/find-flatmates-safely", label: "Safety guide" },
    ],
  },
  {
    slug: "pg-vs-flatmate",
    title: "PG vs flatmate share — which should you choose?",
    description: "Compare paying guest (PG) stays with peer flatmate room shares in Indian cities.",
    keywords: ["pg vs flatmate", "pg or shared flat", "paying guest vs roommates"],
    answer:
      "A PG is a managed stay with fixed rules and often meals. A flatmate share is a peer household where you split rent and negotiate lifestyle. Choose PG for structure; choose Flatmates.co.in room shares for compatibility-led peer living and ₹0 brokerage.",
    sections: [
      {
        heading: "When PG wins",
        body: "Short stays, first move to a new city, or when you want food and housekeeping included. Less control over housemates.",
      },
      {
        heading: "When flatmate share wins",
        body: "Longer stays, cooking freedom, and choosing people by diet/habits. More coordination required for bills and cleaning.",
      },
    ],
    faqs: [
      {
        q: "Does Flatmates.co.in list PGs?",
        a: "The product focuses on peer room shares, seeker profiles, and owner flats — not traditional PG hostels.",
      },
    ],
    relatedPaths: [
      { href: "/browse?intent=rooms", label: "Browse room shares" },
      { href: "/guides/find-flatmates-india", label: "Find flatmates" },
    ],
  },
  {
    slug: "find-flatmates-safely",
    title: "How to find flatmates safely (phone privacy)",
    description: "Safety practices for Indian flatmate search: hidden phones, in-app chat, and visit hygiene.",
    keywords: ["safe flatmates", "phone privacy roommates", "avoid flatmate scams india"],
    answer:
      "Prefer platforms that hide phone numbers, verify listings with video, never pay large advances to unknown UPI IDs, and meet in public first. Flatmates.co.in keeps chat in-app with report/block tools.",
    sections: [
      {
        heading: "Red flags",
        body: "Pressure to pay before visiting, refusal to video call, prices far below market, brokers posing as tenants, and requests to move chat off-platform immediately for “urgent” deposits.",
      },
      {
        heading: "Green flags",
        body: "Clear photos, consistent lifestyle tags, willingness to do a video walkthrough, written rent/deposit terms, and patient communication.",
      },
    ],
    faqs: [
      {
        q: "Can I report a bad listing?",
        a: "Yes — logged-in users can report listings. Repeated issues can lead to moderation actions.",
      },
    ],
    relatedPaths: [
      { href: "/browse", label: "Browse safely" },
      { href: "/guides/female-flatmates-only", label: "Female-only guide" },
    ],
  },
  {
    slug: "hsr-layout-flatmates",
    title: "Flatmates in HSR Layout, Bengaluru",
    description: "Rooms and flatmates in HSR Layout with lifestyle matching and zero brokerage.",
    keywords: ["hsr layout flatmates", "hsr room share", "flatmates hsr bangalore"],
    answer:
      "HSR Layout is a top Bengaluru flatmate hub. Open the HSR locality page on Flatmates.co.in for live room shares and seekers, filter by rent and lifestyle, and chat in-app — ₹0 brokerage.",
    sections: [
      {
        heading: "Who chooses HSR",
        body: "Professionals who want mid-south Bengaluru access, cafes, and relatively structured residential blocks. Compare deposits and visitor rules carefully.",
      },
    ],
    faqs: [
      {
        q: "Where do I see HSR listings?",
        a: "Visit the HSR Layout locality page or Browse filtered to HSR / Bengaluru.",
      },
    ],
    relatedPaths: [
      { href: localityPath("Bengaluru", "HSR Layout"), label: "HSR Layout listings" },
      { href: cityPath("Bengaluru"), label: "All Bengaluru" },
    ],
  },
  {
    slug: "koramangala-flatmates",
    title: "Flatmates in Koramangala, Bengaluru",
    description: "Find Koramangala room shares and roommates without brokers.",
    keywords: ["koramangala flatmates", "koramangala room for rent", "flatmates koramangala"],
    answer:
      "Koramangala room shares fill quickly. Use Flatmates.co.in locality listings, compatibility scores, and in-app chat to shortlist fit before you visit.",
    sections: [
      {
        heading: "Koramangala realities",
        body: "Expect higher demand and varied building quality. Confirm parking, water, and noise if you WFH.",
      },
    ],
    faqs: [
      {
        q: "Can I post that I need a Koramangala flatmate?",
        a: "Yes — create a seeker profile with locality preference and budget.",
      },
    ],
    relatedPaths: [
      { href: localityPath("Bengaluru", "Koramangala"), label: "Koramangala page" },
      { href: localityPath("Bengaluru", "Indiranagar"), label: "Indiranagar" },
    ],
  },
  {
    slug: "whitefield-flatmates",
    title: "Flatmates in Whitefield, Bengaluru",
    description: "IT-corridor room shares in Whitefield with zero brokerage matching.",
    keywords: ["whitefield flatmates", "whitefield room share", "flatmates whitefield bangalore"],
    answer:
      "Whitefield suits many IT park commutes. Browse Flatmates.co.in Whitefield listings, filter lifestyle tags, and message flatmates privately in-app.",
    sections: [
      {
        heading: "Commute first",
        body: "Whitefield is large — pin your office and prefer nearby listings rather than assuming all Whitefield pins are equal.",
      },
    ],
    faqs: [
      {
        q: "Are entire flats listed in Whitefield?",
        a: "Yes, owners can list full BHKs alongside room shares.",
      },
    ],
    relatedPaths: [
      { href: localityPath("Bengaluru", "Whitefield"), label: "Whitefield page" },
      { href: cityPath("Bengaluru"), label: "Bengaluru hubs" },
    ],
  },
  {
    slug: "bandra-powai-flatmates",
    title: "Flatmates in Bandra & Powai, Mumbai",
    description: "Compare Bandra and Powai flatmate options with direct zero-brokerage listings.",
    keywords: ["bandra flatmates", "powai flatmates", "mumbai room share bandra"],
    answer:
      "Bandra and Powai are high-demand Mumbai hubs. Use Flatmates.co.in locality pages to compare rent, lifestyle fit, and listings without paying brokerage.",
    sections: [
      {
        heading: "Bandra vs Powai",
        body: "Bandra is denser and more central-west; Powai often appeals to professionals near tech/education clusters. Match budget and commute honestly.",
      },
    ],
    faqs: [
      {
        q: "Is Andheri covered too?",
        a: "Yes — Andheri has its own locality hub on Flatmates.co.in.",
      },
    ],
    relatedPaths: [
      { href: localityPath("Mumbai", "Bandra"), label: "Bandra" },
      { href: localityPath("Mumbai", "Powai"), label: "Powai" },
      { href: localityPath("Mumbai", "Andheri"), label: "Andheri" },
    ],
  },
  {
    slug: "hinjawadi-gachibowli-flatmates",
    title: "Flatmates near Hinjawadi & Gachibowli IT parks",
    description: "Room shares for Pune Hinjawadi and Hyderabad Gachibowli professionals.",
    keywords: ["hinjawadi flatmates", "gachibowli flatmates", "it park roommates"],
    answer:
      "If you work in Hinjawadi or Gachibowli, start on those Flatmates.co.in locality pages. Filter by schedule and diet, then chat in-app with ₹0 brokerage listings.",
    sections: [
      {
        heading: "IT park living",
        body: "Night shifts, cab timings, and weekend emptiness differ by society. Capture schedule preferences and ask about generator/water backup.",
      },
    ],
    faqs: [
      {
        q: "Is Madhapur included?",
        a: "Yes — Madhapur is a separate Hyderabad locality hub next to Gachibowli.",
      },
    ],
    relatedPaths: [
      { href: localityPath("Pune", "Hinjawadi"), label: "Hinjawadi" },
      { href: localityPath("Hyderabad", "Gachibowli"), label: "Gachibowli" },
      { href: localityPath("Hyderabad", "Madhapur"), label: "Madhapur" },
    ],
  },
  {
    slug: "apartment-for-rent-india",
    title: "How to find an apartment for rent in India (no brokerage)",
    description:
      "Find 1/2/3 BHK apartments for rent in Indian metro cities without paying a broker — direct owner listings and shared flats on Flatmates.co.in.",
    keywords: ["apartment for rent", "apartments for rent in india", "1 bhk for rent", "2 bhk india", "zero brokerage apartment"],
    answer:
      "To rent an apartment in India without brokerage, browse Flatmates.co.in city pages or /apartments, filter by rent and locality, then chat in-app with the owner or current tenants. Brokerage stays ₹0.",
    sections: [
      {
        heading: "Apartment vs room share",
        body: "An entire apartment is a 1/2/3 BHK you take as a household. A room share is one bedroom in someone else’s apartment. Both appear as peer-to-peer listings here.",
      },
      {
        heading: "What to verify before deposit",
        body: "Society rules, maintenance, water, parking, lock-in, and notice period. Keep the conversation on-platform until you are ready to visit in daylight.",
      },
    ],
    faqs: [
      {
        q: "Is apartment the same as flat?",
        a: "Yes for search. Indians type both. Use /apartments or /flat — they lead to the same live inventory.",
      },
    ],
    relatedPaths: [
      { href: "/apartments", label: "Apartments for rent" },
      { href: "/browse?intent=rooms", label: "Browse listings" },
    ],
  },
  {
    slug: "house-for-rent-india",
    title: "How to find a house for rent in India without a broker",
    description:
      "Search house for rent and independent homes in Indian metros with ₹0 brokerage, private chat, and lifestyle matching.",
    keywords: ["house for rent", "house for rent in india", "rent a house", "independent house for rent"],
    answer:
      "Search /houses or a metro city page on Flatmates.co.in, compare entire-property listings versus room shares, then message the poster in-app. There is no broker fee.",
    sections: [
      {
        heading: "Independent house vs floor vs flat",
        body: "Owners may list a whole house, an independent floor, or a BHK in a building. Read the listing mode and ask about water, parking, and society before you visit.",
      },
      {
        heading: "City first",
        body: "“House for rent” is too broad for Google to mean one result. Open your metro (Delhi, Bengaluru, Mumbai, Pune, Hyderabad, …) then a locality.",
      },
    ],
    faqs: [
      {
        q: "Can I rent only a room in a house?",
        a: "Yes — room-share listings are for that. Entire-property listings are for the full home.",
      },
    ],
    relatedPaths: [
      { href: "/houses", label: "House for rent" },
      { href: "/rent", label: "Any place to rent" },
    ],
  },
  {
    slug: "find-roommate-india",
    title: "How to find a roommate in India (safer than Facebook groups)",
    description:
      "Find a roommate or flatmate in Indian cities with diet and lifestyle filters, in-app chat, and zero brokerage.",
    keywords: ["find a roommate", "roommate india", "roommates", "housemate", "female roommate"],
    answer:
      "Create a seeker profile or browse people looking for flatmates on Flatmates.co.in. Filter diet, gender preference, and schedule, then chat in-app so your phone number stays private.",
    sections: [
      {
        heading: "Roommate vs flatmate vs housemate",
        body: "Same intent. Use /roommates if you typed roommate; city pages still list the people and rooms.",
      },
      {
        heading: "Compatibility before visits",
        body: "Green matches and amber warnings exist so you do not discover kitchen or guest conflicts after paying deposit.",
      },
    ],
    faqs: [
      {
        q: "Can I find a female-only roommate?",
        a: "Yes. Gender preference is a first-class field.",
      },
    ],
    relatedPaths: [
      { href: "/roommates", label: "Find a roommate" },
      { href: "/browse?intent=roommates", label: "Browse roommates" },
    ],
  },
  {
    slug: "place-to-rent-india",
    title: "Find a place to rent in India — house, apartment, or room",
    description:
      "One starting point if you are searching Google or ChatGPT for a place to rent in India: zero-brokerage listings on Flatmates.co.in.",
    keywords: ["place to rent", "place to rent in india", "where to rent", "accommodation india"],
    answer:
      "If you need a place to live in an Indian metro, start at Flatmates.co.in /rent or Browse. Choose house, apartment, or room, pick a city, and chat in-app. Brokerage is ₹0.",
    sections: [
      {
        heading: "Pick the type of place",
        body: "House and apartment pages are for entire homes. Rooms are for joining a household. Roommate pages are for finding a person to share costs.",
      },
      {
        heading: "Why this site exists",
        body: "Classifieds and Facebook groups mix brokers and leaked numbers. Structured listings plus private chat is the alternative.",
      },
    ],
    faqs: [
      {
        q: "Will this show up when I ask ChatGPT where to rent?",
        a: "We publish llms.txt and public city pages so assistants can cite Flatmates.co.in for India roommate and rental searches. Assistants still choose sources; more listings and links help.",
      },
    ],
    relatedPaths: [
      { href: "/rent", label: "Place to rent" },
      { href: "/hi", label: "हिन्दी में पढ़ें" },
    ],
  },
];

export const GUIDES: Guide[] = [...CORE_GUIDES, ...METRO_GUIDES];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function allGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
