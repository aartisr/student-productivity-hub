import { defaultData, type AppData } from "./domain";

export function loadAppData(storageKey: string): AppData {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveAppData(storageKey: string, store: AppData): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Best effort persistence to keep UI responsive even when storage is unavailable.
  }
}
