export type ListingMode = "room_share" | "seeker" | "owner";

export type Lifestyle = {
  genderPref: "female_only" | "male_only" | "anyone" | "couple" | "lgbtq";
  diet: "veg" | "eggetarian" | "nonveg" | "jain";
  smoking: "no" | "occasional" | "yes";
  drinking: "no" | "yes";
  occupation: "it" | "student" | "freelancer" | "any";
  schedule: "wfh" | "office" | "night";
  pets: "friendly" | "none";
  guests: "overnight_ok" | "no_parties";
  washroom: "attached" | "shared";
  roomType: "private" | "twin";
  furnishing: "full" | "semi" | "none";
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified?: boolean;
  otpHash?: string;
  otpExpires?: string;
  pwdScheme?: "v1";
  badge?: "verified_pro" | "verified_student";
  proUntil?: string;
  blockedIds: string[];
  favorites: string[];
  createdAt: string;
};

export type Listing = {
  id: string;
  slug?: string;
  mode: ListingMode;
  userId: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  lat: number;
  lng: number;
  rent: number;
  deposit: number;
  maintenanceIncluded: boolean;
  images: string[];
  lifestyle: Lifestyle;
  moveInDate?: string;
  bhk?: string;
  status: "active" | "expired" | "hidden" | "rented";
  reports: { userId: string; reason: string; at: string }[];
  views: number;
  boostUntil?: string;
  urgentUntil?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt: string;
};

export type Thread = {
  id: string;
  listingId: string;
  a: string;
  b: string;
  lastAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  fromId: string;
  text: string;
  kind: "text" | "visit_request" | "listing_card";
  attachment?: string;
  readBy: string[];
  createdAt: string;
};

export type Review = { id: string; listingId: string; userId: string; rating: number; text: string; at: string };
export type Order = {
  id: string;
  userId: string;
  sku: "boost" | "urgent" | "pro";
  amount: number;
  listingId?: string;
  status: "paid" | "pending";
  upi: string;
  at: string;
};
export type Notice = { id: string; userId: string; text: string; at: string; read: boolean };

export type DB = {
  users: User[];
  listings: Listing[];
  threads: Thread[];
  messages: ChatMessage[];
  emails: { to: string; subject: string; body: string; at: string }[];
  reviews: Review[];
  orders: Order[];
  notices: Notice[];
};
