import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { appendChatMessage } from "@/lib/chat";
import { getDb, newId, saveDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const db = await getDb({ fresh: true });
  const threads = db.threads
    .filter((t) => t.a === user.id || t.b === user.id)
    .map((t) => {
      const otherId = t.a === user.id ? t.b : t.a;
      const other = db.users.find((u) => u.id === otherId);
      const listing = db.listings.find((l) => l.id === t.listingId);
      const last = db.messages.filter((m) => m.threadId === t.id).slice(-1)[0];
      const unread = db.messages.filter((m) => m.threadId === t.id && !m.readBy.includes(user.id) && m.fromId !== user.id).length;
      return { thread: t, other: other ? { id: other.id, name: other.name } : null, listing, last, unread };
    })
    .sort((a, b) => b.thread.lastAt.localeCompare(a.thread.lastAt));
  return NextResponse.json({ threads });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  const db = await getDb({ fresh: true });
  const listing = db.listings.find((l) => l.id === body.listingId);
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const otherId = listing.userId === user.id ? body.toId : listing.userId;
  if (!otherId || otherId === user.id) return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  const other = db.users.find((u) => u.id === otherId);
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.blockedIds.includes(otherId) || other.blockedIds.includes(user.id)) {
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }
  let thread = db.threads.find(
    (t) => t.listingId === listing.id && ((t.a === user.id && t.b === otherId) || (t.b === user.id && t.a === otherId))
  );
  if (!thread) {
    thread = { id: newId("t"), listingId: listing.id, a: user.id, b: otherId, lastAt: new Date().toISOString() };
    db.threads.push(thread);
  }
  const posted = appendChatMessage(db, thread, user, body);
  if ("error" in posted) return NextResponse.json({ error: posted.error }, { status: posted.status });
  await saveDb(db);
  return NextResponse.json({ thread, message: posted.message });
}
