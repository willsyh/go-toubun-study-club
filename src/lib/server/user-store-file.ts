import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { EmailTakenError, type UserPatch, type UserRecord, type UserStore } from "./user-types";

/**
 * Development fallback used when DATABASE_URL is not set: users are kept in
 * data/users.json. Never used in production.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "users.json");

let writeQueue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<UserRecord[]> {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as UserRecord[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(users: UserRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(users, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

/** Serialises read-modify-write cycles so concurrent requests don't clobber each other. */
function mutate<T>(fn: (users: UserRecord[]) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const users = await readAll();
    const result = await fn(users);
    await writeAll(users);
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export const fileStore: UserStore = {
  async findByEmail(email) {
    return (await readAll()).find((u) => u.email === email) ?? null;
  },
  async findById(id) {
    return (await readAll()).find((u) => u.id === id) ?? null;
  },
  async findByResetHash(hash) {
    return (await readAll()).find((u) => u.resetTokenHash === hash) ?? null;
  },
  create(email, passwordHash) {
    return mutate((users) => {
      if (users.some((u) => u.email === email)) throw new EmailTakenError();
      const user: UserRecord = {
        id: randomUUID(),
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
        sessionVersion: 1,
      };
      users.push(user);
      return user;
    });
  },
  upsertGoogle(sub, email) {
    return mutate((users) => {
      const existing = users.find((u) => u.googleSub === sub) ?? users.find((u) => u.email === email);
      if (existing) {
        existing.googleSub = sub;
        return existing;
      }
      const user: UserRecord = {
        id: randomUUID(),
        email,
        googleSub: sub,
        createdAt: new Date().toISOString(),
        sessionVersion: 1,
      };
      users.push(user);
      return user;
    });
  },
  update(id, patch: UserPatch) {
    return mutate((users) => {
      const user = users.find((u) => u.id === id);
      if (!user) return null;
      const { bumpSessionVersion, ...fields } = patch;
      Object.assign(user, fields);
      if (bumpSessionVersion) user.sessionVersion += 1;
      return user;
    });
  },
  remove(id) {
    return mutate((users) => {
      const index = users.findIndex((u) => u.id === id);
      if (index >= 0) users.splice(index, 1);
      return index >= 0;
    });
  },
};
