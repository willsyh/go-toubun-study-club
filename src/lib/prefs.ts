"use client";

import { useSyncExternalStore } from "react";

/** Small device-level preferences (theme, sidebar, last tutor) kept in localStorage. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setPref(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
  listeners.forEach((l) => l());
}

export function usePref<T extends string>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => (read(key) as T | null) ?? fallback,
    () => fallback,
  );
}

export type Theme = "light" | "dark";

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => "light",
  );
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  setPref("gt:theme", theme);
}
