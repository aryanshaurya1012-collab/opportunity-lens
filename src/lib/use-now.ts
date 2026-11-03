"use client";

import { useSyncExternalStore } from "react";
import { SERVER_REFERENCE_DATE } from "@/lib/domain/reference-date";

const MINUTE = 60_000;
let cached = new Date(Math.floor(Date.now() / MINUTE) * MINUTE);

function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(() => {
    cached = new Date(Math.floor(Date.now() / MINUTE) * MINUTE);
    onChange();
  }, MINUTE);
  return () => window.clearInterval(timer);
}

export function useNow(): { now: Date; isClient: boolean } {
  const value = useSyncExternalStore(
    subscribe,
    () => cached,
    () => null,
  );
  return { now: value ?? SERVER_REFERENCE_DATE, isClient: value !== null };
}
