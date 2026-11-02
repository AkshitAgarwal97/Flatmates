import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { persistImageBytes } from "@/lib/remote-db";
import { sniffImage } from "@/lib/safe";
import { newId } from "@/lib/store";

function fromDataUrl(raw: string): { buf: Buffer; mime: string } | null {
  const m = raw.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!m || raw.length > 1_200_000) return null;
  const mime = m[1].toLowerCase() === "image/jpg" ? "image/jpeg" : m[1].toLowerCase();
  return { mime, buf: Buffer.from(m[2].replace(/\s/g, ""), "base64") };
}

/** Stores the file in Blob/Redis and returns a fetchable URL (not a data-URL). */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  let buf: Buffer | null = null;
  let mime = "image/jpeg";

  if (file instanceof File) {
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Max 4MB" }, { status: 400 });
    buf = Buffer.from(await file.arrayBuffer());
    const kind = sniffImage(buf);
    if (kind) mime = kind === "jpg" ? "image/jpeg" : `image/${kind}`;
  }

  if (!buf || !sniffImage(buf)) {
    const raw = form.get("dataUrl");
    const parsed = typeof raw === "string" ? fromDataUrl(raw) : null;
    if (!parsed) {
      return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed" }, { status: 400 });
    }
    buf = parsed.buf;
    mime = parsed.mime;
  }

  const url = await persistImageBytes(newId("img"), buf, mime);
  if (!url) {
    return NextResponse.json({ error: "Could not store photo — try again" }, { status: 503 });
  }
  return NextResponse.json({ url });
}
