import type { ChatMessage, DB, Thread, User } from "./types";
import { newId } from "./store";

export function contactLeak(text: string) {
  return /\b(\+91[\s-]?)?\d{10}\b/.test(text) || /(?:^|\s)[^\s]+@[^\s]+/.test(text) || /javascript:|data:text\/html/i.test(text);
}

export function otherParticipant(thread: Thread, userId: string) {
  return thread.a === userId ? thread.b : thread.a;
}

export function appendChatMessage(
  db: DB,
  thread: Thread,
  user: User,
  body: { text?: string; kind?: ChatMessage["kind"]; attachment?: string }
) {
  const listing = db.listings.find((l) => l.id === thread.listingId);
  const kind = (body.kind || "text") as ChatMessage["kind"];
  let text =
    kind === "visit_request"
      ? "Requested a room visit. Please confirm a slot in chat."
      : kind === "listing_card"
        ? `Shared listing: ${listing?.title || "listing"}`
        : String(body.text || "").slice(0, 2000);
  if (body.attachment) text = `${text} ${body.attachment}`.trim();
  if (!text) return { error: "Message empty", status: 400 as const };
  if (contactLeak(text)) {
    return { error: "Phone numbers and emails are blocked. Keep chat in-app.", status: 400 as const };
  }
  const msg: ChatMessage = {
    id: newId("m"),
    threadId: thread.id,
    fromId: user.id,
    text,
    kind,
    readBy: [user.id],
    createdAt: new Date().toISOString(),
  };
  db.messages.push(msg);
  thread.lastAt = msg.createdAt;
  const otherId = otherParticipant(thread, user.id);
  db.notices.push({
    id: newId("n"),
    userId: otherId,
    text: `${user.name} sent a chat message${listing ? ` about “${listing.title}”` : ""}`,
    at: msg.createdAt,
    read: false,
  });
  return { message: msg };
}
