import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { uploadListingImage } from "@/lib/remote-db";
import { listingExpiry, getDb, newId, saveDb } from "@/lib/store";
import { publicListing } from "@/lib/safe";
import { listingSlug } from "@/lib/seo";
import type { Listing, ListingMode, Lifestyle } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const locality = searchParams.get("locality") || "";
  const mode = searchParams.get("mode") || "";
  const maxRent = Number(searchParams.get("maxRent") || 0);
  const diet = searchParams.get("diet") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const db = await getDb();
  let items = db.listings.filter((l) => l.status === "active");
  if (city) items = items.filter((l) => l.city === city);
  if (locality) items = items.filter((l) => l.locality === locality);
  if (mode) items = items.filter((l) => l.mode === mode);
  if (maxRent) items = items.filter((l) => l.mode === "seeker" || l.rent <= maxRent);
  if (diet) items = items.filter((l) => l.lifestyle.diet === diet);
  if (q) items = items.filter((l) => `${l.title} ${l.description} ${l.locality}`.toLowerCase().includes(q));
  return NextResponse.json({ listings: items.map(publicListing) });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body (photos may be too large — try fewer/smaller images)" },
      { status: 413 }
    );
  }

  const id = newId("l");
  const rawImages = Array.isArray(body.images)
    ? (body.images as unknown[])
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.slice(0, 900_000))
        .filter((x) => x.startsWith("data:image/") || x.startsWith("https://") || x.startsWith("/"))
        .slice(0, 5)
    : [];

  const images: string[] = [];
  for (let i = 0; i < rawImages.length; i++) {
    const src = rawImages[i];
    if (src.startsWith("data:image/")) {
      const url = await uploadListingImage(id, i, src);
      images.push(url || "/room.svg");
    } else {
      images.push(src);
    }
  }

  const listing: Listing = {
    id,
    mode: body.mode as ListingMode,
    userId: user.id,
    title: String(body.title || "").slice(0, 120),
    description: String(body.description || "").slice(0, 2000),
    city: String(body.city || "").trim(),
    locality: String(body.locality || "").trim(),
    lat: Number(body.lat) || 0,
    lng: Number(body.lng) || 0,
    rent: Number(body.rent) || 0,
    deposit: Number(body.deposit) || 0,
    maintenanceIncluded: Boolean(body.maintenanceIncluded),
    images: images.length ? images : ["/room.svg"],
    lifestyle: body.lifestyle as Lifestyle,
    moveInDate: body.moveInDate as string | undefined,
    bhk: body.bhk as string | undefined,
    status: "active",
    reports: [],
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: listingExpiry(),
  };

  if (!listing.title || !listing.rent || !listing.city) {
    return NextResponse.json({ error: "Title, rent, and location are required" }, { status: 400 });
  }
  if (!listing.locality) listing.locality = listing.city;

  // Generate SEO-friendly slug from title + locality + short ID
  listing.slug = listingSlug(listing.title, listing.locality, id);


  const db = await getDb({ fresh: true });
  db.listings.push(listing);
  await saveDb(db);
  return NextResponse.json({ listing: publicListing(listing) });
}
