import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { dataDir } from "./data-dir";
import type { DB } from "./types";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"] as const;

function imageDir() {
  const dir = path.join(dataDir(), "images");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export type RemoteLoad =
  | { status: "ok"; db: DB | null }
  | { status: "error"; error: string }
  | { status: "disabled" };

/** Listings live in data/db.json on the VM. There is no remote database. */
export async function loadRemoteDb(): Promise<RemoteLoad> {
  return { status: "disabled" };
}

export async function saveRemoteDb(_db: DB): Promise<void> {}

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

/** Stores listing photos on disk and returns /api/media/{id}. */
export async function persistImageBytes(key: string, buf: Buffer, contentType: string): Promise<string | null> {
  const id = safeImageKey(key);
  if (!id || buf.length < 24 || buf.length > 1_400_000) return null;
  return saveImageDisk(id, buf, contentType);
}

export async function loadPersistedImage(key: string): Promise<{ contentType: string; buf: Buffer } | null> {
  const id = safeImageKey(key);
  if (!id) return null;
  return loadImageDisk(id);
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
  return false;
}
