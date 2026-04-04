import { SessionData } from "@/types";

const TWO_HOURS = 2 * 60 * 60 * 1000;

// Pin to global so Next.js hot reloads don't reset the Map
declare global {
  // eslint-disable-next-line no-var
  var sessionStore: Map<string, SessionData> | undefined;
}
const store: Map<string, SessionData> = global.sessionStore ?? new Map();
global.sessionStore = store;

function purgeExpired(): void {
  const now = Date.now();
  store.forEach((value, key) => {
    if (now - value.createdAt > TWO_HOURS) {
      store.delete(key);
    }
  });
}

export function getSession(id: string): SessionData | undefined {
  purgeExpired();
  return store.get(id);
}

export function setSession(id: string, data: SessionData): void {
  store.set(id, data);
}

export function deleteSession(id: string): void {
  store.delete(id);
}
