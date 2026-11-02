import { createWriteStream } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const dir = dirname(fileURLToPath(import.meta.url));
mkdirSync(dir, { recursive: true });

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function png(w, h, paint) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b] = paint(x, y, w, h);
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const body = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return body;
}

const files = [
  [
    "living-room.png",
    (x, y, w, h) => {
      const sky = [40, 90, 140];
      const wall = [210, 190, 160];
      const sofa = [30, 120, 110];
      if (y < h * 0.35) return sky;
      if (y > h * 0.62 && x > w * 0.15 && x < w * 0.85) return sofa;
      return wall;
    },
  ],
  [
    "bedroom.png",
    (x, y, w, h) => {
      const wall = [180, 160, 200];
      const bed = [90, 50, 80];
      const window = [220, 230, 245];
      if (x > w * 0.7 && y < h * 0.45) return window;
      if (y > h * 0.5) return bed;
      return wall;
    },
  ],
  [
    "kitchen.png",
    (x, y, w, h) => {
      const tile = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 ? [230, 230, 220] : [200, 200, 190];
      const cabinet = [80, 90, 70];
      if (y > h * 0.7) return cabinet;
      return tile;
    },
  ],
];

for (const [name, paint] of files) {
  const out = join(dir, name);
  const buf = png(640, 480, paint);
  createWriteStream(out).end(buf);
  console.log("wrote", out, buf.length);
}
