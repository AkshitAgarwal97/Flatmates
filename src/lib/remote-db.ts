import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { Redis } from "@upstash/redis";
import { dataDir } from "./data-dir";
import type { DB } from "./types";

const DB_KEY = "flatmates:db";
const IMG_PREFIX = "flatmates:img:";
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"] as const;

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function imageDir() {
  const dir = path.join(dataDir(), "images");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function slimDb(db: DB): DB {
  return {
    ...db,
    listings: db.listings.map((l) => ({
      ...l,
      images: (l.images || [])
        .map((img) => (img.startsWith("data:") ? "/room.svg" : img))
        .slice(0, 5),
    })),
    emails: (db.emails || []).slice(-40),
  };
}

export type RemoteLoad =
  | { status: "ok"; db: DB | null }
  | { status: "error"; error: string }
  | { status: "disabled" };

export async function loadRemoteDb(): Promise<RemoteLoad> {
  const client = redis();
  if (!client) return { status: "disabled" };
  try {
    const data = await client.get<DB>(DB_KEY);
    if (!data || typeof data !== "object") return { status: "ok", db: null };
    if (!Array.isArray((data as DB).listings)) return { status: "ok", db: null };
    return { status: "ok", db: data as DB };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "redis error" };
  }
}

export async function saveRemoteDb(db: DB): Promise<void> {
  const client = redis();
  if (!client) return;
  await client.set(DB_KEY, slimDb(db));
}

function parseDataUrl(dataUrl: string): { mime: string; buf: Buffer } | null {
  const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!m) return null;
  const mime = m[1].toLowerCase() === "image/jpg" ? "image/jpeg" : m[1].toLowerCase();
  try {
    return { mime, buf: Buffer.from(m[2].replace(/\s/g, ""), "base64") };
  } catch {
    return null;
  }
}

function extFor(mime: string) {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

function mimeForExt(ext: string) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export function safeImageKey(key: string) {
  return /^[a-zA-Z0-9._-]+$/.test(key) ? key : null;
}

function saveImageDisk(id: string, buf: Buffer, contentType: string): string | null {
  try {
    const ext = extFor(contentType);
    writeFileSync(path.join(imageDir(), `${id}.${ext}`), buf);
    return `/api/media/${id}`;
  } catch {
    return null;
  }
}

function loadImageDisk(id: string): { contentType: string; buf: Buffer } | null {
  const dir = path.join(dataDir(), "images");
  for (const ext of IMAGE_EXTS) {
    const file = path.join(dir, `${id}.${ext}`);
    if (!existsSync(file)) continue;
    try {
      return { contentType: mimeForExt(ext), buf: readFileSync(file) };
    } catch {
      return null;
    }
  }
  return null;
}

/** Durable public URL: Vercel Blob, else Redis, else local disk + /api/media. */
export async function persistImageBytes(key: string, buf: Buffer, contentType: string): Promise<string | null> {
  const id = safeImageKey(key);
  if (!id || buf.length < 24 || buf.length > 1_400_000) return null;

  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    try {
      const blob = await Promise.race([
        put(`listings/${id}.${extFor(contentType)}`, buf, {
          access: "public",
          contentType,
          addRandomSuffix: true,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      if (blob?.url) return blob.url;
    } catch {
      /* blob token missing or quota — fall through */
    }
  }

  const client = redis();
  if (client) {
    await client.set(`${IMG_PREFIX}${id}`, { t: contentType, b: buf.toString("base64") });
    return `/api/media/${id}`;
  }

  return saveImageDisk(id, buf, contentType);
}

export async function loadPersistedImage(key: string): Promise<{ contentType: string; buf: Buffer } | null> {
  const id = safeImageKey(key);
  if (!id) return null;

  const disk = loadImageDisk(id);
  if (disk) return disk;

  const client = redis();
  if (!client) return null;
  const row = await client.get<{ t?: string; b?: string } | string>(`${IMG_PREFIX}${id}`);
  if (!row) return null;
  if (typeof row === "string") {
    return { contentType: "image/jpeg", buf: Buffer.from(row, "base64") };
  }
  if (!row.b) return null;
  return { contentType: row.t || "image/jpeg", buf: Buffer.from(row.b, "base64") };
}

export async function uploadListingImage(
  listingId: string,
  index: number,
  dataUrl: string
): Promise<string | null> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  return persistImageBytes(`${listingId}-${index}`, parsed.buf, parsed.mime);
}

export function isRemoteConfigured() {
  return Boolean(redis());
}
