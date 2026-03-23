import { type Dispatch, type SetStateAction } from "react";
import { QUOTES, gradeScale, uid, type AppData, type GpaEntry, type Session, type Snapshot, type UserSettings } from "../domain";

type UseSystemManagerArgs = {
  ensureSignedIn: () => boolean;
  currentUser: string;
  timerMode: "study" | "break";
  running: boolean;
  settings: UserSettings;
  setStore: Dispatch<SetStateAction<AppData>>;
  setTimerMode: (value: "study" | "break") => void;
  setRemainingSec: (value: number) => void;
  setRunning: (value: boolean) => void;
  setTimerStatus: (value: string) => void;
  gInputs: string[];
  setGpaText: (value: string) => void;
  setQuote: (value: string) => void;
  assignments: AppData["assignments"][string];
  planner: AppData["planner"][string];
  sessions: AppData["sessions"][string];
  lessons: AppData["lessons"][string];
  gpaHistory: AppData["gpaHistory"][string];
  quizBanks: AppData["quizBanks"][string];
  quizAttempts: AppData["quizAttempts"][string];
  quizReviews: AppData["quizReviews"][string];
  backups: AppData["backups"][string];
  importText: string;
  setExportText: (value: string) => void;
  setBackupStatus: (value: string) => void;
};

export function useSystemManager(args: UseSystemManagerArgs) {
  const {
    ensureSignedIn,
    currentUser,
    timerMode,
    running,
    settings,
    setStore,
    setTimerMode,
    setRemainingSec,
    setRunning,
    setTimerStatus,
    gInputs,
    setGpaText,
    setQuote,
    assignments,
    planner,
    sessions,
    lessons,
    gpaHistory,
    quizBanks,
    quizAttempts,
    quizReviews,
    backups,
    importText,
    setExportText,
    setBackupStatus,
  } = args;

  const completePomodoroCycle = () => {
    if (!currentUser) return;
    const durationSec = timerMode === "study" ? settings.studyMinutes * 60 : settings.breakMinutes * 60;
    const row: Session = {
      id: uid(),
      mode: timerMode,
      durationSec,
      startedAt: Date.now(),
    };

    setStore((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [currentUser]: [...(prev.sessions[currentUser] || []), row],
      },
    }));

    const nextMode = timerMode === "study" ? "break" : "study";
    setTimerMode(nextMode);
    setRemainingSec((nextMode === "study" ? settings.studyMinutes : settings.breakMinutes) * 60);
    setTimerStatus(`Cycle done. Switched to ${nextMode}.`);
  };

  const resetTimer = () => {
    setRunning(false);
    setRemainingSec((timerMode === "study" ? settings.studyMinutes : settings.breakMinutes) * 60);
    setTimerStatus("Timer reset.");
  };

  const toggleTimerMode = () => {
    const nextMode = timerMode === "study" ? "break" : "study";
    setTimerMode(nextMode);
    setRemainingSec((nextMode === "study" ? settings.studyMinutes : settings.breakMinutes) * 60);
    setRunning(false);
  };

  const runGpa = () => {
    if (!ensureSignedIn()) return;
    const rows: Array<{ grade: string; credits: number }> = [];
    let quality = 0;
    let creditsTotal = 0;

    for (const raw of gInputs) {
      const text = raw.trim();
      if (!text) continue;
      const normalized = text.replace(/[: ]+/g, ",");
      const parts = normalized.split(",").filter(Boolean);
      const grade = (parts[0] || "").toUpperCase();
      const credits = Number(parts[1] || 3);

      if (!(grade in gradeScale) || credits <= 0) {
        setGpaText(`Invalid line: ${text}`);
        return;
      }

      rows.push({ grade, credits });
      quality += gradeScale[grade] * credits;
      creditsTotal += credits;
    }

    if (!creditsTotal) {
      setGpaText("Enter at least one grade, example: A,3");
      return;
    }

    const gpa = quality / creditsTotal;
    const entry: GpaEntry = { id: uid(), gpa, grades: rows, createdAt: Date.now() };

    setStore((prev) => ({
      ...prev,
      gpaHistory: {
        ...prev.gpaHistory,
        [currentUser]: [...(prev.gpaHistory[currentUser] || []), entry],
      },
    }));

    setGpaText(`GPA ${gpa.toFixed(3)} for ${creditsTotal} credits.`);
  };

  const randomQuote = () => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  };

  const generateExport = () => {
    if (!ensureSignedIn()) return;
    const snapshot: Snapshot = {
      version: 1,
      createdAt: Date.now(),
      data: {
        assignments,
        planner,
        sessions,
        lessons,
        gpaHistory,
        quizBanks,
        quizAttempts,
        quizReviews,
      },
    };
    const txt = JSON.stringify(snapshot, null, 2);
    setExportText(txt);
  };

  const importBundle = () => {
    if (!ensureSignedIn()) return;
    try {
      const parsed = JSON.parse(importText) as Snapshot;
      if (!parsed.data) throw new Error("Invalid payload");
      setStore((prev) => ({
        ...prev,
        assignments: { ...prev.assignments, [currentUser]: parsed.data.assignments || [] },
        planner: { ...prev.planner, [currentUser]: parsed.data.planner || [] },
        sessions: { ...prev.sessions, [currentUser]: parsed.data.sessions || [] },
        lessons: { ...prev.lessons, [currentUser]: parsed.data.lessons || [] },
        gpaHistory: { ...prev.gpaHistory, [currentUser]: parsed.data.gpaHistory || [] },
        quizBanks: { ...prev.quizBanks, [currentUser]: parsed.data.quizBanks || [] },
        quizAttempts: { ...prev.quizAttempts, [currentUser]: parsed.data.quizAttempts || [] },
        quizReviews: { ...prev.quizReviews, [currentUser]: parsed.data.quizReviews || [] },
      }));
      setBackupStatus("Import complete.");
    } catch {
      setBackupStatus("Import failed. Check JSON.");
    }
  };

  const createBackup = () => {
    if (!ensureSignedIn()) return;
    const snapshot: Snapshot = {
      version: 1,
      createdAt: Date.now(),
      data: { assignments, planner, sessions, lessons, gpaHistory, quizBanks, quizAttempts, quizReviews },
    };

    setStore((prev) => ({
      ...prev,
      backups: {
        ...prev.backups,
        [currentUser]: [snapshot, ...(prev.backups[currentUser] || [])].slice(0, 8),
      },
    }));
    setBackupStatus("Backup created.");
  };

  const restoreBackup = (index: number) => {
    if (!ensureSignedIn()) return;
    const item = backups[index];
    if (!item) return;
    setStore((prev) => ({
      ...prev,
      assignments: { ...prev.assignments, [currentUser]: item.data.assignments || [] },
      planner: { ...prev.planner, [currentUser]: item.data.planner || [] },
      sessions: { ...prev.sessions, [currentUser]: item.data.sessions || [] },
      lessons: { ...prev.lessons, [currentUser]: item.data.lessons || [] },
      gpaHistory: { ...prev.gpaHistory, [currentUser]: item.data.gpaHistory || [] },
      quizBanks: { ...prev.quizBanks, [currentUser]: item.data.quizBanks || [] },
      quizAttempts: { ...prev.quizAttempts, [currentUser]: item.data.quizAttempts || [] },
      quizReviews: { ...prev.quizReviews, [currentUser]: item.data.quizReviews || [] },
    }));
    setBackupStatus(`Restored backup from ${new Date(item.createdAt).toLocaleString()}.`);
  };

  const saveSettings = (name: string, study: number, brk: number) => {
    if (!ensureSignedIn()) return;
    if (study < 1 || study > 180 || brk < 1 || brk > 60) {
      setBackupStatus("Study 1-180 and break 1-60.");
      return;
    }
    setStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [currentUser]: {
          ...settings,
          displayName: name || settings.displayName,
          studyMinutes: study,
          breakMinutes: brk,
        },
      },
    }));
    if (!running) {
      setRemainingSec((timerMode === "study" ? study : brk) * 60);
    }
    setBackupStatus("Settings updated.");
  };

  return {
    completePomodoroCycle,
    resetTimer,
    toggleTimerMode,
    runGpa,
    randomQuote,
    generateExport,
    importBundle,
    createBackup,
    restoreBackup,
    saveSettings,
  };
}
