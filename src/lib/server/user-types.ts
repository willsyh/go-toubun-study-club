export type UserRecord = {
  id: string;
  email: string;
  passwordHash?: string;
  googleSub?: string;
  createdAt: string;
  sessionVersion: number;
  resetTokenHash?: string;
  /** Milliseconds since epoch. */
  resetTokenExpires?: number;
};

/** Fields that can be changed after sign-up. A key set to `undefined` clears that field. */
export type UserPatch = Partial<Pick<UserRecord, "passwordHash" | "resetTokenHash" | "resetTokenExpires">> & {
  /** Signs the user out of every other device. */
  bumpSessionVersion?: boolean;
};

export class EmailTakenError extends Error {}

/** Everything the app needs from wherever accounts are stored. Emails arrive already normalised. */
export type UserStore = {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  findByResetHash(hash: string): Promise<UserRecord | null>;
  /** Throws EmailTakenError if the email is already registered. */
  create(email: string, passwordHash: string): Promise<UserRecord>;
  /** Finds the account for a Google sign-in, linking by email or creating it. */
  upsertGoogle(sub: string, email: string): Promise<UserRecord>;
  update(id: string, patch: UserPatch): Promise<UserRecord | null>;
  remove(id: string): Promise<boolean>;
};
