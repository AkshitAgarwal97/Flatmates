import { NextResponse } from "next/server";
import { loadPersistedImage, safeImageKey } from "@/lib/remote-db";

export async function GET(_: Request, { params }: { params: { key: string } }) {
  const key = safeImageKey(params.key);
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const img = await loadPersistedImage(key);
  if (!img) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(img.buf), {
    headers: {
      "Content-Type": img.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
