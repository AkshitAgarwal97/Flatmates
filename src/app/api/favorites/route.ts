import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { listingId } = await req.json();
  const i = user.favorites.indexOf(listingId);
  if (i >= 0) user.favorites.splice(i, 1);
  else user.favorites.push(listingId);
  await saveDb(await getDb());
  return NextResponse.json({ favorites: user.favorites });
}
