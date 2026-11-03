"use client";

/** SHA-256 token so plaintext password never appears in Network payloads. */
export async function passwordToken(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`flatmates.v1:${email.toLowerCase().trim()}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const timer = window.setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load timed out"));
    }, 12_000);
    img.onload = () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** Compress image to a JPEG data-URL before upload. */
export async function imageToDataUrl(file: File, maxW = 1280, quality = 0.72): Promise<string> {
  if (file.size > 6 * 1024 * 1024) throw new Error("Image max 6MB");
  const img = await loadImg(file);
  const scale = Math.min(1, maxW / Math.max(1, img.naturalWidth || img.width));
  const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(img, 0, 0, w, h);
  const url = canvas.toDataURL("image/jpeg", quality);
  if (url.length > 900_000) throw new Error("Image still too large — try another photo");
  return url;
}
