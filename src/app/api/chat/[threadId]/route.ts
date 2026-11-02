import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { appendChatMessage, otherParticipant } from "@/lib/chat";
import { getDb, saveDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { threadId: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const db = await getDb({ fresh: true });
  const thread = db.threads.find((t) => t.id === params.threadId);
  if (!thread || (thread.a !== user.id && thread.b !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const messages = db.messages.filter((m) => m.threadId === thread.id);
  let changed = false;
  for (const m of messages) {
    if (!m.readBy.includes(user.id)) {
      m.readBy.push(user.id);
      changed = true;
    }
  }
  if (changed) await saveDb(db);
  const otherId = otherParticipant(thread, user.id);
  const other = db.users.find((u) => u.id === otherId);
  const listing = db.listings.find((l) => l.id === thread.listingId);
  return NextResponse.json({
    thread,
    messages,
    listing,
    other: other ? { id: other.id, name: other.name, badge: other.badge } : null,
    me: user.id,
  });
}

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  const db = await getDb({ fresh: true });
  const thread = db.threads.find((t) => t.id === params.threadId);
  if (!thread || (thread.a !== user.id && thread.b !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const otherId = otherParticipant(thread, user.id);
  const other = db.users.find((u) => u.id === otherId);

  if (body.action === "block") {
    if (otherId && !user.blockedIds.includes(otherId)) user.blockedIds.push(otherId);
    await saveDb(db);
    return NextResponse.json({ ok: true });
  }

  if (other && (user.blockedIds.includes(otherId) || other.blockedIds.includes(user.id))) {
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  const posted = appendChatMessage(db, thread, user, body);
  if ("error" in posted) return NextResponse.json({ error: posted.error }, { status: posted.status });
  await saveDb(db);
  return NextResponse.json({ thread, message: posted.message });
}
