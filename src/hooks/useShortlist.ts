"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "nvvri.shortlist";

/**
 * Tracks a parent's shortlist of nursery IDs in localStorage.
 *
 * Designed to be a stepping stone to real auth-backed shortlists. When parent
 * accounts ship, the shape of this hook stays the same: replace the storage
 * layer with an API call, every consumer keeps working.
 *
 * Returns a tuple of [ids, helpers]. Helpers all accept a nursery id.
 */
export function useShortlist(): {
  ids: string[];
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  ready: boolean;
} {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Load on mount. We can't read localStorage during SSR or first paint,
  // so the hook is "not ready" for one render cycle.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          setIds(parsed);
        }
      }
    } catch {
      // Corrupt localStorage value, ignore and start fresh.
    } finally {
      setReady(true);
    }
  }, []);

  // Persist on every change, but only after we've hydrated.
  // Skipping the initial empty array prevents wiping a user's
  // saved list on the first render.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Quota exceeded or private mode. We accept the loss.
    }
  }, [ids, ready]);

  // Sync across tabs. If the user adds a nursery in one tab, the others
  // pick it up.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          setIds(parsed);
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { ids, toggle, add, remove, has, ready };
}
