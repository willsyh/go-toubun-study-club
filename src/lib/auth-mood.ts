"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a form on the page is currently showing an error. The auth artwork
 * swaps to a flustered Itsuki while this is true.
 */
let errors = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Registers one visible error; call the returned function when it goes away. */
export function showErrorMood() {
  errors += 1;
  emit();
  return () => {
    errors = Math.max(0, errors - 1);
    emit();
  };
}

export function useErrorMood() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => errors > 0,
    () => false,
  );
}
