import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/store";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { email } = await req.json();
  const claimed = String(email || "").toLowerCase().trim();
  if (claimed !== user.email) {
    return NextResponse.json({ error: "Verify using the email on this account. Register with a company/college address." }, { status: 400 });
  }
  const domain = claimed.split("@")[1] || "";
  const student = /\.ac\.in$|\.edu$/.test(domain);
  const pro = domain && !["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com"].includes(domain);
  if (!student && !pro) {
    return NextResponse.json({ error: "Use a company or college email to verify" }, { status: 400 });
  }
  user.badge = student ? "verified_student" : "verified_pro";
  await saveDb(await getDb());
  return NextResponse.json({ badge: user.badge });
}
