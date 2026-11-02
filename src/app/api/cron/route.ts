import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { runAutonomousJobs } from "@/lib/store";
import { pingGoogleSitemap, pingIndexNow } from "@/lib/indexnow";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || "";
  const a = createHmac("sha256", "cron").update(token).digest();
  const b = createHmac("sha256", "cron").update(secret).digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  runAutonomousJobs();
  const indexNow = await pingIndexNow();
  const google = await pingGoogleSitemap();
  return NextResponse.json({ ok: true, indexNow, google });
}
