"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_STATE, getServerSnapshot, getSnapshot, localActions, subscribe } from "./local-store";
import type { UserDataActions, UserDataState } from "./types";

export interface UseUserData {
  /** False during server render and hydration, before localStorage has been read. */
  ready: boolean;
  data: UserDataState;
  actions: UserDataActions;
}

export function useUserData(): UseUserData {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ready: snapshot !== null,
    data: snapshot ?? EMPTY_STATE,
    actions: localActions,
  };
}
