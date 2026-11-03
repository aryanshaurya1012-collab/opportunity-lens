import { defaultChecklist } from "@/lib/domain/checklists";
import type { UserDataActions, UserDataState } from "./types";

const STORAGE_KEY = "opportunitylens:demo:v1";
const MAX_ASSESSMENTS = 50;

export const EMPTY_STATE: UserDataState = {
  version: 1,
  profile: null,
  saved: [],
  applications: [],
  assessments: [],
};

let state: UserDataState = EMPTY_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function isUserDataState(value: unknown): value is UserDataState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<UserDataState>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.saved) &&
    Array.isArray(candidate.applications) &&
    Array.isArray(candidate.assessments) &&
    (candidate.profile === null || typeof candidate.profile === "object")
  );
}

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (isUserDataState(parsed)) state = parsed;
  } catch {
    state = EMPTY_STATE;
  }
}

function commit(next: UserDataState): void {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be full or blocked (private mode); keep the in-memory state.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY) return;
  loaded = false;
  state = EMPTY_STATE;
  load();
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): UserDataState {
  load();
  return state;
}

export function getServerSnapshot(): UserDataState | null {
  return null;
}

function id(): string {
  return crypto.randomUUID();
}

export const localActions: UserDataActions = {
  saveProfile(profile) {
    commit({ ...getSnapshot(), profile: { ...profile, updatedAt: new Date().toISOString() } });
  },

  toggleSaved(opportunityId) {
    const current = getSnapshot();
    const isSaved = current.saved.some((item) => item.opportunityId === opportunityId);
    commit({
      ...current,
      saved: isSaved
        ? current.saved.filter((item) => item.opportunityId !== opportunityId)
        : [{ opportunityId, savedAt: new Date().toISOString() }, ...current.saved],
    });
  },

  trackApplication({ opportunityId, category, status = "interested", personalDeadline = null }) {
    const current = getSnapshot();
    const existing = current.applications.find((item) => item.opportunityId === opportunityId);
    if (existing) return existing.id;
    const now = new Date().toISOString();
    const application = {
      id: id(),
      opportunityId,
      status,
      personalDeadline,
      notes: "",
      checklist: defaultChecklist(category),
      createdAt: now,
      updatedAt: now,
    };
    commit({ ...current, applications: [application, ...current.applications] });
    return application.id;
  },

  updateApplication(applicationId, patch) {
    const current = getSnapshot();
    commit({
      ...current,
      applications: current.applications.map((item) =>
        item.id === applicationId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    });
  },

  removeApplication(applicationId) {
    const current = getSnapshot();
    commit({ ...current, applications: current.applications.filter((item) => item.id !== applicationId) });
  },

  recordAssessment(assessment) {
    const current = getSnapshot();
    commit({
      ...current,
      assessments: [{ ...assessment, id: id() }, ...current.assessments].slice(0, MAX_ASSESSMENTS),
    });
  },

  resetAll() {
    commit(EMPTY_STATE);
  },
};
