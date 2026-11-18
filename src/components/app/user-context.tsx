"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setStoreUser } from "@/lib/local-store";

export type CurrentUser = {
  id: string;
  email: string;
  createdAt: string;
  hasPassword: boolean;
  google: boolean;
};

type UserState = {
  user: CurrentUser | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserState | null>(null);

/** null = couldn't tell (offline / server error); keep the current state. */
type MeResult = CurrentUser | "signed-out" | null;

async function fetchMe(): Promise<MeResult> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.status === 401) return "signed-out";
    if (!res.ok) return null;
    return ((await res.json()) as { user: CurrentUser }).user;
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  const apply = useCallback(
    (result: MeResult) => {
      if (result === "signed-out") {
        setStoreUser(null);
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
        window.location.assign("/login");
      } else if (result) {
        setStoreUser(result.id);
        setUser(result);
      }
    },
    [],
  );

  const refresh = useCallback(async () => apply(await fetchMe()), [apply]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setStoreUser(null);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth boundary: full reload drops the previous session's cached routes and in-memory data
    window.location.assign("/login");
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMe().then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  return <UserContext value={{ user, refresh, logout }}>{children}</UserContext>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
