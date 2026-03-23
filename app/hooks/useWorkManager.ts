import { type Dispatch, type SetStateAction } from "react";
import { uid, type AppData, type PlannerTask, type Priority } from "../domain";

type UseWorkManagerArgs = {
  ensureSignedIn: () => boolean;
  currentUser: string;
  setStore: Dispatch<SetStateAction<AppData>>;
  hwTitle: string;
  hwSubject: string;
  hwDue: string;
  hwPriority: Priority;
  setHwTitle: (value: string) => void;
  setHwSubject: (value: string) => void;
  setHwDue: (value: string) => void;
  setHwStatus: (value: string) => void;
  taskText: string;
  setTaskText: (value: string) => void;
  setTaskStatus: (value: string) => void;
};

export function useWorkManager(args: UseWorkManagerArgs) {
  const {
    ensureSignedIn,
    currentUser,
    setStore,
    hwTitle,
    hwSubject,
    hwDue,
    hwPriority,
    setHwTitle,
    setHwSubject,
    setHwDue,
    setHwStatus,
    taskText,
    setTaskText,
    setTaskStatus,
  } = args;

  const addAssignment = () => {
    if (!ensureSignedIn()) return;
    if (!hwTitle || !hwSubject || !hwDue) {
      setHwStatus("Fill title, subject, due date.");
      return;
    }
    const row = {
      id: uid(),
      title: hwTitle,
      subject: hwSubject,
      dueDate: hwDue,
      priority: hwPriority,
      completed: false,
      createdAt: Date.now(),
    };
    setStore((prev) => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [currentUser]: [...(prev.assignments[currentUser] || []), row],
      },
    }));
    setHwTitle("");
    setHwSubject("");
    setHwDue("");
    setHwStatus("Assignment added.");
  };

  const markAssignment = (id: string, completed: boolean) => {
    if (!ensureSignedIn()) return;
    setStore((prev) => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [currentUser]: (prev.assignments[currentUser] || []).map((a) => (a.id === id ? { ...a, completed } : a)),
      },
    }));
  };

  const deleteAssignment = (id: string) => {
    if (!ensureSignedIn()) return;
    setStore((prev) => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        [currentUser]: (prev.assignments[currentUser] || []).filter((a) => a.id !== id),
      },
    }));
  };

  const addTask = () => {
    if (!ensureSignedIn()) return;
    const text = taskText.trim();
    if (!text) {
      setTaskStatus("Type a task first.");
      return;
    }
    const row: PlannerTask = { id: uid(), text, done: false, createdAt: Date.now() };
    setStore((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        [currentUser]: [...(prev.planner[currentUser] || []), row],
      },
    }));
    setTaskText("");
    setTaskStatus("Task added.");
  };

  const toggleTask = (id: string) => {
    if (!ensureSignedIn()) return;
    setStore((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        [currentUser]: (prev.planner[currentUser] || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      },
    }));
  };

  const removeTask = (id: string) => {
    if (!ensureSignedIn()) return;
    setStore((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        [currentUser]: (prev.planner[currentUser] || []).filter((t) => t.id !== id),
      },
    }));
  };

  return {
    addAssignment,
    markAssignment,
    deleteAssignment,
    addTask,
    toggleTask,
    removeTask,
  };
}
