import { fileStore } from "./user-store-file";
import { getNeonStore } from "./user-store-neon";
import type { UserPatch, UserRecord, UserStore } from "./user-types";

export { EmailTakenError, type UserRecord } from "./user-types";

/**
 * Account storage. With DATABASE_URL set, accounts live in Neon Postgres.
 * Without it, development falls back to data/users.json; production refuses to start.
 * Only accounts live here — chats, notes and memory stay in the browser.
 */
let warned = false;

function store(): UserStore {
  if (process.env.DATABASE_URL) return getNeonStore();
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set in production (your Neon connection string).");
  }
  if (!warned) {
    warned = true;
    console.warn("[users] DATABASE_URL not set — storing accounts in data/users.json (development only).");
  }
  return fileStore;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function findUserByEmail(email: string) {
  return store().findByEmail(normalizeEmail(email));
}

export function findUserById(id: string) {
  return store().findById(id);
}

export function findUserByResetHash(hash: string) {
  return store().findByResetHash(hash);
}

export function createUser(email: string, passwordHash: string) {
  return store().create(normalizeEmail(email), passwordHash);
}

export function upsertGoogleUser(sub: string, email: string) {
  return store().upsertGoogle(sub, normalizeEmail(email));
}

export function updateUser(id: string, patch: UserPatch) {
  return store().update(id, patch);
}

export function deleteUser(id: string) {
  return store().remove(id);
}

/** What the browser is allowed to see about an account. */
export function publicUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    hasPassword: Boolean(user.passwordHash),
    google: Boolean(user.googleSub),
  };
}

export type PublicUser = ReturnType<typeof publicUser>;
