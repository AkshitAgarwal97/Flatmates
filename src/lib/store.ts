import { createHash, scryptSync } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { dataDir } from "./data-dir";
import { HUBS } from "./hubs";
import { passwordToken } from "./otp";
import { loadRemoteDb, saveRemoteDb } from "./remote-db";
import { listingSlug } from "./seo";
import type { ChatMessage, DB, Lifestyle, Listing, Thread, User } from "./types";

function seedHash(email: string, plain: string) {
  const token = passwordToken(email, plain);
  const s = createHash("sha256").update(`flatmates-demo-salt:${email}`).digest("hex").slice(0, 32);
  return `${s}:${scryptSync(token, s, 32, { N: 16384, r: 8, p: 1 }).toString("hex")}`;
}

const DEMO_ACCOUNTS: User[] = [
  {
    id: "u_demo",
    name: "Rahul Sharma",
    email: "demo@flatmates.co.in",
    passwordHash: seedHash("demo@flatmates.co.in", "demo123"),
    emailVerified: true,
    badge: "verified_pro",
    blockedIds: [],
    favorites: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    pwdScheme: "v1",
  },
  {
    id: "u_seeker",
    name: "Ananya Iyer",
    email: "seeker@flatmates.co.in",
    passwordHash: seedHash("seeker@flatmates.co.in", "demo123"),
    emailVerified: true,
    badge: "verified_student",
    blockedIds: [],
    favorites: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    pwdScheme: "v1",
  },
  {
    id: "u_owner",
    name: "Meera Patel",
    email: "owner@flatmates.co.in",
    passwordHash: seedHash("owner@flatmates.co.in", "demo123"),
    emailVerified: true,
    badge: "verified_pro",
    blockedIds: [],
    favorites: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    pwdScheme: "v1",
  },
];

const CACHE_MS = 30_000;
const DATA_DIR = dataDir();
const DB_PATH = path.join(DATA_DIR, "db.json");

declare global {
  // Persist DB across warm serverless invocations in the same isolate
  // eslint-disable-next-line no-var
  var __flatmatesDb: DB | undefined;
  // eslint-disable-next-line no-var
  var __flatmatesDbReady: Promise<DB> | undefined;
  // eslint-disable-next-line no-var
  var __flatmatesCacheAt: number | undefined;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

const defaultLifestyle = (over: Partial<Lifestyle> = {}): Lifestyle => ({
  genderPref: "anyone",
  diet: "veg",
  smoking: "no",
  drinking: "no",
  occupation: "it",
  schedule: "office",
  pets: "none",
  guests: "no_parties",
  washroom: "attached",
  roomType: "private",
  furnishing: "semi",
  ...over,
});


function seed(): DB {
  const now = new Date().toISOString();
  const users: User[] = DEMO_ACCOUNTS.map((u) => ({ ...u, favorites: [], blockedIds: [] }));

  const pics = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80",
  ];

  const listings: Listing[] = HUBS.slice(0, 10).map((h, i) => {
    const modes: Listing["mode"][] = ["room_share", "owner", "seeker"];
    const mode = modes[i % 3];
    const rent = [12000, 18000, 22000, 28000, 16000][i % 5];
    return {
      id: `l_${i + 1}`,
      mode,
      userId: mode === "seeker" ? "u_seeker" : mode === "owner" ? "u_owner" : "u_demo",
      title:
        mode === "seeker"
          ? `Looking for a room in ${h.locality}`
          : mode === "owner"
            ? `${2 + (i % 2)}BHK entire flat in ${h.locality}`
            : `Private room in occupied ${2 + (i % 2)}BHK · ${h.locality}`,
      description:
        mode === "seeker"
          ? "Working professional relocating. Need a compatible flatmate, attached washroom preferred. Chat in-app only — no brokers."
          : "Direct from occupant/owner. Zero brokerage. Visit via in-app request. House-trained, respectful, and looking for a long stay.",
      city: h.city,
      locality: h.locality,
      lat: h.lat,
      lng: h.lng,
      rent: mode === "seeker" ? 20000 + (i % 3) * 2000 : rent,
      deposit: rent * 2,
      maintenanceIncluded: i % 2 === 0,
      images: [pics[i % pics.length], pics[(i + 1) % pics.length]],
      lifestyle: defaultLifestyle({
        diet: (["veg", "jain", "nonveg", "eggetarian"] as const)[i % 4],
        smoking: i % 4 === 0 ? "yes" : "no",
        drinking: i % 3 === 0 ? "yes" : "no",
        genderPref: (["anyone", "female_only", "male_only", "lgbtq"] as const)[i % 4],
        pets: i % 5 === 0 ? "friendly" : "none",
        washroom: i % 2 === 0 ? "attached" : "shared",
        furnishing: (["full", "semi", "none"] as const)[i % 3],
      }),
      moveInDate: daysFromNow(7 + i),
      bhk: `${2 + (i % 2)}BHK`,
      status: "active",
      reports: [],
      views: 40 + i * 7,
      createdAt: now,
      expiresAt: daysFromNow(21),
      slug: listingSlug(
        mode === "seeker"
          ? `Looking for a room in ${h.locality}`
          : mode === "owner"
            ? `${2 + (i % 2)}BHK entire flat in ${h.locality}`
            : `Private room in occupied ${2 + (i % 2)}BHK · ${h.locality}`,
        h.locality,
        `l_${i + 1}`
      ),
    };
  });

  return { users, listings, threads: [], messages: [], emails: [], reviews: [], orders: [], notices: [] };
}

function migrate(db: DB): DB {
  db.reviews ||= [];
  db.orders ||= [];
  db.notices ||= [];
  for (const u of db.users) {
    u.favorites ||= [];
    if (u.emailVerified === undefined) u.emailVerified = true;
  }
  for (const l of db.listings) {
    l.views ||= 0;
    if (!l.slug) l.slug = listingSlug(l.title, l.locality, l.id);
  }
  for (const demo of DEMO_ACCOUNTS) {
    const u = db.users.find((x) => x.email === demo.email);
    if (!u) {
      db.users.push({ ...demo, favorites: [], blockedIds: [] });
    } else {
      u.passwordHash = demo.passwordHash;
      u.pwdScheme = "v1";
      u.emailVerified = true;
      if (demo.badge && !u.badge) u.badge = demo.badge;
    }
  }
  return db;
}

function ts(iso?: string) {
  return iso ? Date.parse(iso) || 0 : 0;
}

function mergeUser(a?: User, b?: User): User {
  if (!a) return b!;
  if (!b) return a;
  return {
    ...a,
    ...b,
    passwordHash: b.passwordHash || a.passwordHash,
    emailVerified: Boolean(a.emailVerified || b.emailVerified),
    badge: b.badge || a.badge,
    favorites: [...new Set([...(a.favorites || []), ...(b.favorites || [])])],
    blockedIds: [...new Set([...(a.blockedIds || []), ...(b.blockedIds || [])])],
  };
}

function mergeListing(a?: Listing, b?: Listing): Listing {
  if (!a) return b!;
  if (!b) return a;
  const newer = ts(b.updatedAt || b.createdAt) >= ts(a.updatedAt || a.createdAt) ? b : a;
  const older = newer === b ? a : b;
  const reports = [...older.reports];
  for (const r of newer.reports) {
    if (!reports.some((x) => x.userId === r.userId)) reports.push(r);
  }
  return {
    ...older,
    ...newer,
    views: Math.max(a.views || 0, b.views || 0),
    reports,
    images: (newer.images?.length ? newer.images : older.images) || ["/room.svg"],
  };
}

function byId<T extends { id: string }>(a: T[] = [], b: T[] = [], merge?: (x?: T, y?: T) => T): T[] {
  const map = new Map<string, T>();
  for (const x of a) map.set(x.id, x);
  for (const y of b) map.set(y.id, merge ? merge(map.get(y.id), y) : y);
  return [...map.values()];
}

/** Union two snapshots. Rows that exist on only one side are kept (lost-update safe). */
function mergeDb(base: DB, remote: DB): DB {
  const users = new Map<string, User>();
  for (const u of base.users || []) users.set(u.email, u);
  for (const u of remote.users || []) users.set(u.email, mergeUser(users.get(u.email), u));

  const emailKey = (e: DB["emails"][number]) => `${e.to}|${e.subject}|${e.at}`;
  const emails = new Map<string, DB["emails"][number]>();
  for (const e of [...(base.emails || []), ...(remote.emails || [])]) emails.set(emailKey(e), e);

  return migrate({
    users: [...users.values()],
    listings: byId(base.listings, remote.listings, mergeListing),
    threads: byId(base.threads, remote.threads, (a, b) => {
      if (!a) return b!;
      if (!b) return a;
      return { ...b, lastAt: a.lastAt > b.lastAt ? a.lastAt : b.lastAt } satisfies Thread;
    }),
    messages: byId(base.messages, remote.messages, (a, b) => {
      if (!a) return b!;
      if (!b) return a;
      return { ...b, readBy: [...new Set([...(a.readBy || []), ...(b.readBy || [])])] } satisfies ChatMessage;
    }),
    emails: [...emails.values()].slice(-80),
    reviews: byId(base.reviews, remote.reviews),
    orders: byId(base.orders, remote.orders),
    notices: byId(base.notices, remote.notices).slice(-100),
  });
}

let cache: DB | null = null;

function readDisk(): DB | null {
  try {
    if (!existsSync(DB_PATH)) return null;
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as DB;
  } catch {
    return null;
  }
}

function writeDisk(db: DB) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db));
  } catch {
    // Disk write failed; the in-memory copy still serves this process.
  }
}

function loadLocal(): DB {
  if (cache) return cache;
  if (globalThis.__flatmatesDb) {
    cache = globalThis.__flatmatesDb;
    return cache;
  }
  const disk = readDisk();
  cache = migrate(disk || seed());
  globalThis.__flatmatesDb = cache;
  writeDisk(cache);
  return cache;
}

/** Shared DB: data/db.json on disk, with an in-memory cache. */
export async function getDb(opts?: { fresh?: boolean }): Promise<DB> {
  try {
    if (!globalThis.__flatmatesDbReady) {
      globalThis.__flatmatesDbReady = (async () => {
        const local = loadLocal();
        const remote = await loadRemoteDb();
        if (remote.status === "ok" && remote.db) {
          cache = mergeDb(local, remote.db);
        } else if (remote.status === "ok" && remote.db === null) {
          cache = local;
          try {
            await saveRemoteDb(cache);
          } catch {
            /* ignore */
          }
        } else {
          cache = local;
        }
        globalThis.__flatmatesDb = cache;
        globalThis.__flatmatesCacheAt = Date.now();
        writeDisk(cache!);
        return cache!;
      })().catch((err) => {
        globalThis.__flatmatesDbReady = undefined;
        throw err;
      });
    }
    const boot = await globalThis.__flatmatesDbReady;
    if (!cache) cache = boot || loadLocal();

    const now = Date.now();
    if (opts?.fresh || !globalThis.__flatmatesCacheAt || now - globalThis.__flatmatesCacheAt > CACHE_MS) {
      const remote = await loadRemoteDb();
      if (remote.status === "ok" && remote.db) {
        cache = mergeDb(cache || loadLocal(), remote.db);
        globalThis.__flatmatesDb = cache;
        globalThis.__flatmatesCacheAt = Date.now();
        writeDisk(cache);
      } else if (remote.status === "ok") {
        globalThis.__flatmatesCacheAt = now;
      }
    }
    return cache || loadLocal();
  } catch {
    return loadLocal();
  }
}

export async function saveDb(db: DB) {
  let next = db;
  const remote = await loadRemoteDb();
  if (remote.status === "error") {
    cache = db;
    globalThis.__flatmatesDb = db;
    writeDisk(db);
    return;
  }
  if (remote.status === "ok" && remote.db) {
    next = mergeDb(remote.db, db);
  }
  cache = next;
  globalThis.__flatmatesDb = next;
  globalThis.__flatmatesCacheAt = Date.now();
  writeDisk(next);
  try {
    await saveRemoteDb(next);
  } catch {
    /* local still holds */
  }
}

export function newId(prefix: string) {
  return uid(prefix);
}

export function listingExpiry(from = new Date()) {
  return new Date(from.getTime() + 21 * 86400000).toISOString();
}

export async function runAutonomousJobs() {
  const db = await getDb();
  const now = Date.now();
  let changed = false;
  for (const l of db.listings) {
    if (l.status === "active" && new Date(l.expiresAt).getTime() < now) {
      l.status = "expired";
      changed = true;
    }
    const uniqueReports = new Set(l.reports.map((r) => r.userId));
    if (l.status === "active" && uniqueReports.size >= 3) {
      l.status = "hidden";
      changed = true;
    }
    const daysLeft = (new Date(l.expiresAt).getTime() - now) / 86400000;
    if (l.status === "active" && daysLeft <= 3 && daysLeft > 0) {
      const owner = db.users.find((u) => u.id === l.userId);
      const already = db.emails.some(
        (e) => e.subject.includes(l.id) && e.subject.includes("renew")
      );
      if (owner && !already) {
        db.emails.push({
          to: owner.email,
          subject: `renew:${l.id} Is your listing still available?`,
          body: `Hi ${owner.name}, listing "${l.title}" expires soon. Open /dashboard and tap Keep Active for 21 days, or Mark as Rented.`,
          at: new Date().toISOString(),
        });
        changed = true;
      }
    }
  }
  for (const seeker of db.listings.filter((l) => l.mode === "seeker" && l.status === "active")) {
    const owner = db.users.find((u) => u.id === seeker.userId);
    const matches = db.listings.filter(
      (l) =>
        l.mode !== "seeker" &&
        l.status === "active" &&
        l.city === seeker.city &&
        l.rent <= seeker.rent * 1.1
    );
    if (owner && matches.length) {
      const sub = `digest:${new Date().toISOString().slice(0, 10)}:${seeker.userId}`;
      if (!db.emails.some((e) => e.subject === sub)) {
        db.emails.push({
          to: owner.email,
          subject: sub,
          body: `Hey ${owner.name}, ${matches.length} rooms matching your budget in ${seeker.city} were listed recently.`,
          at: new Date().toISOString(),
        });
        changed = true;
      }
    }
  }
  if (changed) await saveDb(db);
  return db.emails.slice(-20);
}

