import { NextResponse } from "next/server";
import { getDb } from "@/lib/store";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase() || "";
  const db = await getDb();
  const hits = db.listings
    .filter((l) => l.status === "active" && `${l.title} ${l.locality} ${l.city}`.toLowerCase().includes(q))
    .slice(0, 8)
    .map((l) => ({ id: l.id, label: `${l.locality}, ${l.city} · ${l.title}` }));
  return NextResponse.json({ hits });
}
