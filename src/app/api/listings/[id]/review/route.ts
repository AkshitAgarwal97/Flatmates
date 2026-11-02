import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getDb, newId, saveDb } from "@/lib/store";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { rating, text } = await req.json();
  const db = await getDb();
  if (!db.listings.some((l) => l.id === params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db.reviews = db.reviews.filter((r) => !(r.listingId === params.id && r.userId === user.id));
  db.reviews.push({
    id: newId("r"),
    listingId: params.id,
    userId: user.id,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: String(text || "").slice(0, 400),
    at: new Date().toISOString(),
  });
  await saveDb(db);
  return NextResponse.json({ ok: true });
}
