import { defaultData, type AppData } from "./domain";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordOrDefault<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  return isRecord(value) ? (value as T) : fallback;
}

function arrayOrDefault<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeAppData(value: unknown): AppData {
  if (!isRecord(value)) return defaultData;

  return {
    ...defaultData,
    users: arrayOrDefault(value.users, defaultData.users),
    currentUser: typeof value.currentUser === "string" ? value.currentUser : defaultData.currentUser,
    assignments: recordOrDefault(value.assignments, defaultData.assignments),
    planner: recordOrDefault(value.planner, defaultData.planner),
    sessions: recordOrDefault(value.sessions, defaultData.sessions),
    lessons: recordOrDefault(value.lessons, defaultData.lessons),
    gpaHistory: recordOrDefault(value.gpaHistory, defaultData.gpaHistory),
    quizBanks: recordOrDefault(value.quizBanks, defaultData.quizBanks),
    quizAttempts: recordOrDefault(value.quizAttempts, defaultData.quizAttempts),
    quizReviews: recordOrDefault(value.quizReviews, defaultData.quizReviews),
    backups: recordOrDefault(value.backups, defaultData.backups),
    settings: recordOrDefault(value.settings, defaultData.settings),
    streaks: recordOrDefault(value.streaks, defaultData.streaks),
    achievements: arrayOrDefault(value.achievements, defaultData.achievements),
    leaderboard: arrayOrDefault(value.leaderboard, defaultData.leaderboard),
    referrals: recordOrDefault(value.referrals, defaultData.referrals),
    studyGroups: arrayOrDefault(value.studyGroups, defaultData.studyGroups),
    socialProof: recordOrDefault(value.socialProof, defaultData.socialProof),
  };
}

export function loadAppData(storageKey: string): AppData {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultData;
    return normalizeAppData(JSON.parse(raw));
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
