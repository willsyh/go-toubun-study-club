"use client";

import { useSyncExternalStore } from "react";
import type { TutorId } from "./tutors";

/**
 * Chats, notes and memory live in localStorage, namespaced per account, so
 * they never leave this browser. Each collection is a small reactive store.
 */

export type Attachment = { name: string; size: number; type: string };

export type Message = {
  id: string;
  role: "user" | "tutor";
  text: string;
  attachments?: Attachment[];
  /** True for placeholder replies written while no AI is connected. */
  demo?: boolean;
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  tutorId: TutorId;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type MemoryItem = { id: string; text: string; createdAt: number };

export type Collections = {
  chats: Chat[];
  notes: Note[];
  memory: MemoryItem[];
};

type Key = keyof Collections;

const EMPTY: Collections = { chats: [], notes: [], memory: [] };

let userId: string | null = null;
const cache: Partial<Collections> = {};
const listeners = new Set<() => void>();

function storageKey(key: Key) {
  return `gt:${userId}:${key}`;
}

function load<K extends Key>(key: K): Collections[K] {
  if (!userId || typeof window === "undefined") return EMPTY[key];
  if (!cache[key]) {
    try {
      const raw = window.localStorage.getItem(storageKey(key));
      cache[key] = raw ? (JSON.parse(raw) as Collections[K]) : EMPTY[key];
    } catch {
      cache[key] = EMPTY[key];
    }
  }
  return cache[key] as Collections[K];
}

function save<K extends Key>(key: K, value: Collections[K]) {
  cache[key] = value;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Storage full or blocked: keep the in-memory copy for this session.
  }
  listeners.forEach((l) => l());
}

export function setStoreUser(id: string | null) {
  if (id === userId) return;
  userId = id;
  for (const k of Object.keys(cache) as Key[]) delete cache[k];
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(`gt:${userId}:`)) {
      for (const k of Object.keys(cache) as Key[]) delete cache[k];
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCollection<K extends Key>(key: K): Collections[K] {
  return useSyncExternalStore(
    subscribe,
    () => load(key),
    () => EMPTY[key],
  );
}

export function update<K extends Key>(key: K, fn: (items: Collections[K]) => Collections[K]) {
  save(key, fn(load(key)));
}

export function getCollection<K extends Key>(key: K): Collections[K] {
  return load(key);
}

/** Removes every chat, note and memory item for the current account from this browser. */
export function clearAllLocalData() {
  if (!userId) return;
  for (const key of Object.keys(EMPTY) as Key[]) {
    try {
      window.localStorage.removeItem(storageKey(key));
    } catch {}
    delete cache[key];
  }
  listeners.forEach((l) => l());
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
