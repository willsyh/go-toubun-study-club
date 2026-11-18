import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { EmailTakenError, type UserPatch, type UserRecord, type UserStore } from "./user-types";

/**
 * Accounts in Postgres (Neon). Every query is parameterised ($1, $2…), so
 * user input never becomes SQL. Neon's driver sends queries over HTTPS, which
 * works on serverless hosts (Vercel etc.) without connection pooling.
 */

type Row = {
  id: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  created_at: string | Date;
  session_version: number;
  reset_token_hash: string | null;
  reset_token_expires: string | Date | null;
};

export type RunQuery = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id                  uuid PRIMARY KEY,
  email               text NOT NULL UNIQUE,
  password_hash       text,
  google_sub          text UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  session_version     integer NOT NULL DEFAULT 1,
  reset_token_hash    text UNIQUE,
  reset_token_expires timestamptz
)`;

const PATCH_COLUMNS = {
  passwordHash: "password_hash",
  resetTokenHash: "reset_token_hash",
  resetTokenExpires: "reset_token_expires",
} as const;

function toRecord(row: Row): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? undefined,
    googleSub: row.google_sub ?? undefined,
    createdAt: new Date(row.created_at).toISOString(),
    sessionVersion: Number(row.session_version),
    resetTokenHash: row.reset_token_hash ?? undefined,
    resetTokenExpires: row.reset_token_expires ? new Date(row.reset_token_expires).getTime() : undefined,
  };
}

function one(rows: Record<string, unknown>[]): UserRecord | null {
  return rows[0] ? toRecord(rows[0] as Row) : null;
}

/** Builds the store on top of any Postgres query function. The table is created on first use. */
export function createPgStore(run: RunQuery): UserStore {
  let ready: Promise<void> | null = null;

  async function q(text: string, params: unknown[] = []) {
    ready ??= run(SCHEMA).then(
      () => undefined,
      (err) => {
        ready = null; // try again on the next request
        throw err;
      },
    );
    await ready;
    return run(text, params);
  }

  const store: UserStore = {
    async findByEmail(email) {
      return one(await q("SELECT * FROM users WHERE email = $1", [email]));
    },

    async findById(id) {
      return one(await q("SELECT * FROM users WHERE id = $1", [id]));
    },

    async findByResetHash(hash) {
      return one(await q("SELECT * FROM users WHERE reset_token_hash = $1", [hash]));
    },

    async create(email, passwordHash) {
      const user = one(
        await q(
          `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)
           ON CONFLICT (email) DO NOTHING RETURNING *`,
          [randomUUID(), email, passwordHash],
        ),
      );
      if (!user) throw new EmailTakenError();
      return user;
    },

    async upsertGoogle(sub, email) {
      const bySub = one(await q("SELECT * FROM users WHERE google_sub = $1", [sub]));
      if (bySub) return bySub;
      // New Google account: link it to an existing email, or create the user.
      const user = one(
        await q(
          `INSERT INTO users (id, email, google_sub) VALUES ($1, $2, $3)
           ON CONFLICT (email) DO UPDATE SET google_sub = EXCLUDED.google_sub RETURNING *`,
          [randomUUID(), email, sub],
        ),
      );
      return user!;
    },

    async update(id, patch: UserPatch) {
      const sets: string[] = [];
      const params: unknown[] = [];
      for (const key of Object.keys(PATCH_COLUMNS) as (keyof typeof PATCH_COLUMNS)[]) {
        if (!(key in patch)) continue;
        const value = patch[key];
        params.push(value === undefined ? null : key === "resetTokenExpires" ? new Date(value as number) : value);
        sets.push(`${PATCH_COLUMNS[key]} = $${params.length}`);
      }
      if (patch.bumpSessionVersion) sets.push("session_version = session_version + 1");
      if (!sets.length) return store.findById(id);
      params.push(id);
      return one(await q(`UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params));
    },

    async remove(id) {
      return (await q("DELETE FROM users WHERE id = $1 RETURNING id", [id])).length > 0;
    },
  };
  return store;
}

let neonStoreInstance: UserStore | null = null;

/** The store backed by Neon, using DATABASE_URL. */
export function getNeonStore(): UserStore {
  if (!neonStoreInstance) {
    const sql = neon(process.env.DATABASE_URL!);
    neonStoreInstance = createPgStore((text, params) => sql.query(text, params));
  }
  return neonStoreInstance;
}
