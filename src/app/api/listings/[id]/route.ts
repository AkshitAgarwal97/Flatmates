import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { publicListing } from "@/lib/safe";
import { getDb, listingExpiry, saveDb } from "@/lib/store";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb({ fresh: true });
  const listing = db.listings.find((l) => l.id === params.id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  listing.views = (listing.views || 0) + 1;
  const owner = db.users.find((u) => u.id === listing.userId);
  return NextResponse.json({
    listing: publicListing(listing),
    owner: owner ? { id: owner.id, name: owner.name, badge: owner.badge } : null,
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const db = await getDb({ fresh: true });
  const listing = db.listings.find((l) => l.id === params.id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "report") {
    if (listing.userId === user.id) return NextResponse.json({ error: "Cannot report own listing" }, { status: 400 });
    if (listing.reports.some((r) => r.userId === user.id)) {
      return NextResponse.json({ error: "Already reported" }, { status: 400 });
    }
    listing.reports.push({
      userId: user.id,
      reason: body.reason || "inaccurate",
      at: new Date().toISOString(),
    });
    const unique = new Set(listing.reports.map((r) => r.userId));
    if (unique.size >= 3) listing.status = "hidden";
    await saveDb(db);
    return NextResponse.json({ listing: publicListing(listing), strikes: unique.size });
  }

  if (listing.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "renew") {
    listing.status = "active";
    listing.expiresAt = listingExpiry();
    listing.updatedAt = new Date().toISOString();
  } else if (action === "rented") {
    listing.status = "rented";
    listing.updatedAt = new Date().toISOString();
  } else if (action === "delete") {
    listing.status = "hidden";
    listing.updatedAt = new Date().toISOString();
  }
  await saveDb(db);
  return NextResponse.json({ listing });
}
