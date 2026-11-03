import { getDb, newId, saveDb } from "./store";
import type { User } from "./types";

export async function upsertIdentity(partial: {
  name: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  googleId?: string;
  facebookId?: string;
  instagramId?: string;
  passwordHash?: string;
}): Promise<User> {
  const db = await getDb();
  const email = partial.email.toLowerCase().trim();
  const phone = partial.phone?.replace(/\D/g, "");

  let user =
    (partial.googleId && db.users.find((u) => u.googleId === partial.googleId)) ||
    (partial.facebookId && db.users.find((u) => u.facebookId === partial.facebookId)) ||
    (partial.instagramId && db.users.find((u) => u.instagramId === partial.instagramId)) ||
    (phone && db.users.find((u) => u.phone === phone || u.phone === `+91${phone}` || u.phone === `91${phone}`)) ||
    db.users.find((u) => u.email === email);

  if (!user) {
    user = {
      id: newId("u"),
      name: partial.name.trim().slice(0, 80) || email.split("@")[0] || "Member",
      email,
      passwordHash: partial.passwordHash || "",
      emailVerified: Boolean(partial.emailVerified),
      phone: partial.phone,
      phoneVerified: Boolean(partial.phoneVerified),
      googleId: partial.googleId,
      facebookId: partial.facebookId,
      instagramId: partial.instagramId,
      blockedIds: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      pwdScheme: "v1",
    };
    db.users.push(user);
  } else {
    user.name = partial.name.trim() || user.name;
    if (partial.emailVerified) user.emailVerified = true;
    if (partial.phone) user.phone = partial.phone;
    if (partial.phoneVerified) user.phoneVerified = true;
    if (partial.googleId) user.googleId = partial.googleId;
    if (partial.facebookId) user.facebookId = partial.facebookId;
    if (partial.instagramId) user.instagramId = partial.instagramId;
    if (partial.passwordHash && !user.passwordHash) user.passwordHash = partial.passwordHash;
    if (email && (!user.email || user.email.endsWith("@phone.flatmates.co.in") || user.email.endsWith("@ig.flatmates.co.in"))) {
      user.email = email;
    }
  }
  await saveDb(db);
  return user;
}
