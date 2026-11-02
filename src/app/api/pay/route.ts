import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { SKUS, type Sku } from "@/lib/pay";
import { getDb, newId, saveDb } from "@/lib/store";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { sku, listingId } = (await req.json()) as { sku: Sku; listingId?: string };
  const plan = SKUS[sku];
  if (!plan) return NextResponse.json({ error: "Unknown SKU" }, { status: 400 });
  const sandbox = process.env.PAYMENTS_SANDBOX === "true";
  const db = await getDb();
  const listing = listingId ? db.listings.find((l) => l.id === listingId) : undefined;
  if ((sku === "boost" || sku === "urgent") && (!listing || listing.userId !== user.id)) {
    return NextResponse.json({ error: "Own listing required" }, { status: 400 });
  }
  const until = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
  const order = {
    id: newId("ord"),
    userId: user.id,
    sku,
    amount: plan.amount,
    listingId,
    status: sandbox ? ("paid" as const) : ("pending" as const),
    upi: `upi://pay?pa=flatmates@upi&pn=Flatmates&am=${plan.amount}&cu=INR&tn=${sku}`,
    at: new Date().toISOString(),
  };
  if (sandbox) {
    if (sku === "boost" && listing) listing.boostUntil = until(7);
    if (sku === "urgent" && listing) listing.urgentUntil = until(7);
    if (sku === "pro") {
      user.badge = "verified_pro";
      user.proUntil = until(365);
    }
  }
  db.orders.push(order);
  db.notices.push({
    id: newId("n"),
    userId: user.id,
    text: sandbox
      ? `Sandbox payment ₹${plan.amount} for ${plan.label} applied.`
      : `Order ${order.id} pending. Entitlements apply after Razorpay/UPI webhook confirmation.`,
    at: order.at,
    read: false,
  });
  await saveDb(db);
  return NextResponse.json({ order });
}
