import type { QuizBank } from "./quizEngine";

export type ViewKey =
  | "home"
  | "auth"
  | "assignments"
  | "planner"
  | "quiz"
  | "timer"
  | "gpa"
  | "motivation"
  | "analytics"
  | "backup"
  | "coach";

export type ModuleDescriptor = {
  key: ViewKey;
  label: string;
};

export type ModuleProfile = {
  id: string;
  name: string;
  description: string;
  enabledViews: ViewKey[];
  viewOrder: ViewKey[];
  defaultView: ViewKey;
};

export type UserModuleProfile = {
  id: string;
  name: string;
  enabledViews: ViewKey[];
  viewOrder: ViewKey[];
  defaultView: ViewKey;
};

export type ProfileImportAction = "add" | "rename" | "overwrite" | "skip";

export type ProfileImportPlan = {
  valid: boolean;
  message: string;
  incomingCount: number;
  resolvedProfiles: UserModuleProfile[];
  actions: Array<{ sourceName: string; targetName: string; action: ProfileImportAction }>;
  summary: { add: number; rename: number; overwrite: number; skip: number };
};

export type PreviewMode = "auto" | "mobile" | "tablet" | "laptop" | "desktop";

export type Priority = "High" | "Medium" | "Low";

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
};

export type PlannerTask = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

export type Session = {
  id: string;
  mode: "study" | "break";
  durationSec: number;
  startedAt: number;
};

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  content: string;
  estimatedMinutes: number;
  tags: string[];
  linkedQuizBankIds: string[];
  updatedAt: number;
};

export type SharePack = {
  version: 1;
  type: "lesson" | "quiz" | "bundle";
  author: string;
  createdAt: number;
  lessons: Lesson[];
  quizBanks: QuizBank[];
};

export type GpaEntry = {
  id: string;
  gpa: number;
  createdAt: number;
  grades: Array<{ grade: string; credits: number }>;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  quizTitle: string;
  createdAt: number;
  correct: number;
  total: number;
  percent: number;
  byQuestion: Array<{ questionId: string; isCorrect: boolean }>;
};

export type ReviewState = {
  key: string;
  quizId: string;
  questionId: string;
  dueAt: number;
  intervalDays: number;
  ease: number;
  streak: number;
  lastPercent: number;
  updatedAt: number;
};

export type BlueprintConstraints = {
  targetQuestions: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
};

export type ConnectorRequestLog = {
  id: string;
  createdAt: number;
  connectorName: string;
  method: "POST";
  endpointHint: string;
  authMode: "mock-token" | "none";
  payloadBytes: number;
  payloadPreview: string;
  itemCount: number;
  status: "ready" | "warning";
  warnings: string[];
};

export type User = {
  email: string;
  password: string;
  resetCode?: string;
  teacher: boolean;
};

export type Snapshot = {
  version: 1;
  createdAt: number;
  data: {
    assignments: Assignment[];
    planner: PlannerTask[];
    sessions: Session[];
    lessons: Lesson[];
    gpaHistory: GpaEntry[];
    quizBanks: QuizBank[];
    quizAttempts: QuizAttempt[];
    quizReviews: ReviewState[];
  };
};

export type AppData = {
  users: User[];
  currentUser: string;
  assignments: Record<string, Assignment[]>;
  planner: Record<string, PlannerTask[]>;
  sessions: Record<string, Session[]>;
  lessons: Record<string, Lesson[]>;
  gpaHistory: Record<string, GpaEntry[]>;
  quizBanks: Record<string, QuizBank[]>;
  quizAttempts: Record<string, QuizAttempt[]>;
  quizReviews: Record<string, ReviewState[]>;
  backups: Record<string, Snapshot[]>;
  settings: Record<string, UserSettings>;
};

export type UserSettings = {
  displayName: string;
  studyMinutes: number;
  breakMinutes: number;
  enabledViews: ViewKey[];
  viewOrder: ViewKey[];
  defaultView: ViewKey;
  customProfiles: UserModuleProfile[];
};

export const STORAGE_KEY = "student-productivity-hub-v1";

export const QUOTES = [
  "Build quietly, then let your outcomes speak.",
  "A focused hour can outperform a distracted day.",
  "Momentum is the math of repeated small wins.",
  "Discipline is emotional independence.",
  "You do not need more time, you need a sharper intention.",
] as const;

export const defaultData: AppData = {
  users: [{ email: "demo@studenthub.app", password: "demo123", teacher: false }],
  currentUser: "",
  assignments: {},
  planner: {},
  sessions: {},
  lessons: {},
  gpaHistory: {},
  quizBanks: {},
  quizAttempts: {},
  quizReviews: {},
  backups: {},
  settings: {},
};

export const gradeScale: Record<string, number> = {
  A: 4,
  "A-": 3.7,
  "B+": 3.3,
  B: 3,
  "B-": 2.7,
  "C+": 2.3,
  C: 2,
  "C-": 1.7,
  "D+": 1.3,
  D: 1,
  "D-": 0.7,
  F: 0,
};

export const MODULE_CATALOG: ModuleDescriptor[] = [
  { key: "home", label: "Home" },
  { key: "coach", label: "Study Coach" },
  { key: "auth", label: "Auth" },
  { key: "assignments", label: "Assignments" },
  { key: "planner", label: "Planner" },
  { key: "quiz", label: "Quiz Lab" },
  { key: "timer", label: "Pomodoro" },
  { key: "gpa", label: "GPA" },
  { key: "motivation", label: "Motivation" },
  { key: "analytics", label: "Analytics" },
  { key: "backup", label: "Export/Backup" },
];

export const DEFAULT_VIEW_ORDER = MODULE_CATALOG.map((item) => item.key);

export const MODULE_PROFILES: ModuleProfile[] = [
  {
    id: "exam-prep",
    name: "Exam Prep",
    description: "Quiz-heavy flow with coach, deadlines, and focused sessions.",
    enabledViews: ["home", "coach", "assignments", "planner", "quiz", "timer", "analytics", "motivation", "backup", "auth"],
    viewOrder: ["home", "coach", "quiz", "timer", "assignments", "planner", "analytics", "motivation", "backup", "auth", "gpa"],
    defaultView: "coach",
  },
  {
    id: "daily-planner",
    name: "Daily Planner",
    description: "Planning-first setup focused on tasks, assignments, and routine.",
    enabledViews: ["home", "assignments", "planner", "timer", "analytics", "motivation", "backup", "auth"],
    viewOrder: ["home", "assignments", "planner", "timer", "analytics", "motivation", "backup", "auth", "coach", "quiz", "gpa"],
    defaultView: "assignments",
  },
  {
    id: "minimal-focus",
    name: "Minimal Focus",
    description: "Low-noise mode with only core concentration modules visible.",
    enabledViews: ["home", "timer", "coach", "quiz", "motivation", "backup", "auth"],
    viewOrder: ["home", "timer", "coach", "quiz", "motivation", "backup", "auth", "assignments", "planner", "analytics", "gpa"],
    defaultView: "timer",
  },
];

export const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function defaultUserSettings(displayName: string): UserSettings {
  return {
    displayName,
    studyMinutes: 25,
    breakMinutes: 5,
    enabledViews: [...DEFAULT_VIEW_ORDER],
    viewOrder: [...DEFAULT_VIEW_ORDER],
    defaultView: "home",
    customProfiles: [],
  };
}

export function normalizeUserSettings(input: UserSettings | undefined, fallbackName: string): UserSettings {
  const defaults = defaultUserSettings(fallbackName);
  if (!input) return defaults;

  const valid = new Set(DEFAULT_VIEW_ORDER);
  const orderedUnique = (values: ViewKey[] | undefined) => {
    if (!Array.isArray(values)) return [] as ViewKey[];
    return values.filter((key, idx) => valid.has(key) && values.indexOf(key) === idx);
  };

  const viewOrder = orderedUnique(input.viewOrder);
  for (const key of DEFAULT_VIEW_ORDER) {
    if (!viewOrder.includes(key)) viewOrder.push(key);
  }

  const enabledViews = orderedUnique(input.enabledViews);
  const safeEnabled = enabledViews.length ? enabledViews : [input.defaultView || "home"];
  const defaultView = valid.has(input.defaultView) && safeEnabled.includes(input.defaultView) ? input.defaultView : safeEnabled[0];

  const customProfiles = Array.isArray(input.customProfiles)
    ? input.customProfiles
        .map((profile) => {
          const profileOrder = orderedUnique(profile.viewOrder);
          for (const key of DEFAULT_VIEW_ORDER) {
            if (!profileOrder.includes(key)) profileOrder.push(key);
          }

          const profileEnabled = orderedUnique(profile.enabledViews);
          const safeProfileEnabled = profileEnabled.length ? profileEnabled : ["home"];
          const profileDefault = safeProfileEnabled.includes(profile.defaultView) ? profile.defaultView : safeProfileEnabled[0];

          return {
            id: profile.id || uid(),
            name: (profile.name || "My Profile").slice(0, 50),
            enabledViews: safeProfileEnabled,
            viewOrder: profileOrder,
            defaultView: profileDefault,
          } as UserModuleProfile;
        })
        .slice(0, 20)
    : [];

  return {
    displayName: input.displayName || defaults.displayName,
    studyMinutes: Number.isFinite(input.studyMinutes) ? Math.min(180, Math.max(1, input.studyMinutes)) : defaults.studyMinutes,
    breakMinutes: Number.isFinite(input.breakMinutes) ? Math.min(60, Math.max(1, input.breakMinutes)) : defaults.breakMinutes,
    enabledViews: safeEnabled,
    viewOrder,
    defaultView,
    customProfiles,
  };
}

export function hhmmss(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function mmss(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function daysUntil(dateInput: string) {
  if (!dateInput) return Number.POSITIVE_INFINITY;
  const target = new Date(dateInput);
  if (Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}
