"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildProviderCompatibility,
  PROVIDER_PROFILES,
  type ImportFormat,
  type QuestionKind,
  type QuizBank,
  type QuizQuestion,
} from "./quizEngine";
import {
  LMS_CONNECTORS,
} from "./lmsConnectors";
import {
  DEFAULT_VIEW_ORDER,
  STORAGE_KEY,
  QUOTES,
  defaultData,
  gradeScale,
  MODULE_CATALOG,
  MODULE_PROFILES,
  daysUntil,
  defaultUserSettings,
  hhmmss,
  mmss,
  normalizeUserSettings,
  uid,
  type Assignment,
  type AppData,
  type GpaEntry,
  type Lesson,
  type ModuleDescriptor,
  type PlannerTask,
  type PreviewMode,
  type Priority,
  type ProfileImportAction,
  type ProfileImportPlan,
  type Session,
  type SharePack,
  type Snapshot,
  type UserModuleProfile,
  type UserSettings,
  type ViewKey,
} from "./domain";
import { loadAppData, saveAppData } from "./persistence";
import { AccessDeniedPanel, AssignmentsPanel, AuthPanel, PlannerPanel } from "./components/corePanels";
import { CommandCenterPanel, ModuleWorkspacePanel, OnboardingPanel, WorkloadRiskPanel } from "./components/homePanels";
import { AnalyticsPanel, GpaPanel, TimerPanel } from "./components/progressPanels";
import { AssessmentRuntimePanel, CompatibilityTargetsPanel, InstructorModePanel, LessonStudioPanel, LmsConnectorPanel, QuestionBankBuilderPanel, QuizAdapterPanel, QuizBanksPanel, QuizOverviewPanel, ShareExchangePanel } from "./components/quizPanels";
import { BackupPanel, MotivationPanel, StudyCoachPanel } from "./components/systemPanels";
import { useAuthManager } from "./hooks/useAuthManager";
import { useSystemManager } from "./hooks/useSystemManager";
import { useWorkManager } from "./hooks/useWorkManager";
import { useQuizInsights } from "./hooks/useQuizInsights";
import { useQuizBankManager } from "./hooks/useQuizBankManager";
import { useQuizRuntime } from "./hooks/useQuizRuntime";
import { useLessonShareManager } from "./hooks/useLessonShareManager";
import { useModuleProfileManager } from "./hooks/useModuleProfileManager";
import { useCoachManager } from "./hooks/useCoachManager";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewKey>("home");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("auto");
  const [store, setStore] = useState<AppData>(defaultData);
  const [authMsg, setAuthMsg] = useState("");
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [authReturnToLabel, setAuthReturnToLabel] = useState("Student Productivity Hub");

  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("");
  const [hwDue, setHwDue] = useState("");
  const [hwPriority, setHwPriority] = useState<Priority>("Medium");
  const [hwStatus, setHwStatus] = useState("");

  const [taskText, setTaskText] = useState("");
  const [taskStatus, setTaskStatus] = useState("");

  const [lessonDraftId, setLessonDraftId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonEstimatedMinutes, setLessonEstimatedMinutes] = useState(20);
  const [lessonTagsText, setLessonTagsText] = useState("");
  const [lessonLinkedQuizIdsText, setLessonLinkedQuizIdsText] = useState("");
  const [lessonStatus, setLessonStatus] = useState("");
  const [shareKind, setShareKind] = useState<"lesson" | "quiz" | "bundle">("bundle");
  const [shareLessonId, setShareLessonId] = useState("");
  const [shareQuizId, setShareQuizId] = useState("");
  const [sharePayload, setSharePayload] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const [timerMode, setTimerMode] = useState<"study" | "break">("study");
  const [remainingSec, setRemainingSec] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [timerStatus, setTimerStatus] = useState("Ready");

  const [gInputs, setGInputs] = useState(["", "", "", ""]);
  const [gpaText, setGpaText] = useState("");
  const [quizTitle, setQuizTitle] = useState("General Mastery Quiz");
  const [quizSubject, setQuizSubject] = useState("General");
  const [quizDifficulty, setQuizDifficulty] = useState("mixed");
  const [quizPrompt, setQuizPrompt] = useState("");
  const [quizKind, setQuizKind] = useState<QuestionKind>("single");
  const [quizQuestionDifficulty, setQuizQuestionDifficulty] = useState(3);
  const [quizChoicesText, setQuizChoicesText] = useState("");
  const [quizCorrectText, setQuizCorrectText] = useState("");
  const [quizExplanation, setQuizExplanation] = useState("");
  const [quizDraftQuestions, setQuizDraftQuestions] = useState<QuizQuestion[]>([]);
  const [quizTargets, setQuizTargets] = useState<string[]>(PROVIDER_PROFILES.map((provider) => provider.id));
  const [quizImportFormat, setQuizImportFormat] = useState<ImportFormat>("auto");
  const [quizImportText, setQuizImportText] = useState("");
  const [quizExportFormat, setQuizExportFormat] = useState<Exclude<ImportFormat, "auto">>("generic-json");
  const [quizExportText, setQuizExportText] = useState("");
  const [quizStatus, setQuizStatus] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [availableMinutes, setAvailableMinutes] = useState(60);
  const [coachPlan, setCoachPlan] = useState("");

  const [quote, setQuote] = useState<string>(QUOTES[0]);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [backupStatus, setBackupStatus] = useState("");
  const [moduleStatus, setModuleStatus] = useState("");
  const [customProfileName, setCustomProfileName] = useState("");
  const [customProfilesTransferText, setCustomProfilesTransferText] = useState("");
  const [customProfilesImportMode, setCustomProfilesImportMode] = useState<"replace" | "merge">("replace");
  const [customProfileConflictMode, setCustomProfileConflictMode] = useState<"rename" | "overwrite" | "skip">("rename");

  useEffect(() => {
    setStore(loadAppData(STORAGE_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "required") {
      setIsAuthRequired(true);
      const returnTo = params.get("returnTo") || "/";
      const returnPath = returnTo.startsWith("/") ? returnTo : "/";
      setAuthReturnToLabel(returnPath === "/" ? "Student Productivity Hub" : returnPath);
      setView("auth");
      setAuthMsg("Please sign in to continue.");
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveAppData(STORAGE_KEY, store);
  }, [store, ready]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev > 1) return prev - 1;
        completePomodoroCycle();
        return 1;
      });
    }, 1000);
    return () => clearInterval(id);
  });

  const currentUser = store.currentUser.trim();
  const settings = currentUser
    ? normalizeUserSettings(store.settings[currentUser], currentUser.split("@")[0])
    : defaultUserSettings("Scholar");

  const assignments = currentUser ? store.assignments[currentUser] || [] : [];
  const planner = currentUser ? store.planner[currentUser] || [] : [];
  const sessions = currentUser ? store.sessions[currentUser] || [] : [];
  const lessons = currentUser ? store.lessons[currentUser] || [] : [];
  const gpaHistory = currentUser ? store.gpaHistory[currentUser] || [] : [];
  const quizBanks = currentUser ? store.quizBanks[currentUser] || [] : [];
  const quizAttempts = currentUser ? store.quizAttempts[currentUser] || [] : [];
  const quizReviews = currentUser ? store.quizReviews[currentUser] || [] : [];
  const backups = currentUser ? store.backups[currentUser] || [] : [];

  const ensureSignedIn = () => {
    if (!currentUser) {
      setView("auth");
      setAuthMsg("Sign in to continue.");
      return false;
    }
    return true;
  };

  const {
    session,
    role,
    sessionStatus,
    providers,
    loginPendingProviderId,
    login,
    logout,
  } = useAuthManager({
    setAuthMsg,
    setView,
  });

  useEffect(() => {
    if (!ready) return;

    const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? "";

    if (!sessionEmail && store.currentUser) {
      setStore((prev) => (prev.currentUser ? { ...prev, currentUser: "" } : prev));
      return;
    }

    if (!sessionEmail || store.currentUser === sessionEmail) return;

    const userSettings = normalizeUserSettings(store.settings[sessionEmail], sessionEmail.split("@")[0]);
    setStore((prev) => {
      const hasSettings = Boolean(prev.settings[sessionEmail]);
      return {
        ...prev,
        currentUser: sessionEmail,
        settings: hasSettings
          ? prev.settings
          : {
              ...prev.settings,
              [sessionEmail]: userSettings,
            },
      };
    });
    setAuthMsg(`Welcome, ${session?.user?.name || sessionEmail}.`);
    setView(userSettings.defaultView);
    setRemainingSec(userSettings.studyMinutes * 60);
  }, [ready, session, setStore, setView, setRemainingSec, setAuthMsg, store.currentUser, store.settings]);

  const canUseInstructorFeatures = role === "instructor" || role === "admin";
  const authRequiredViews = new Set<ViewKey>(["assignments", "planner", "quiz", "timer", "gpa", "analytics", "backup", "coach"]);

  useEffect(() => {
    if (!currentUser && authRequiredViews.has(view)) {
      setView("auth");
      setAuthMsg("Sign in to access this module.");
    }
  }, [currentUser, view]);

  const {
    addAssignment,
    markAssignment,
    deleteAssignment,
    addTask,
    toggleTask,
    removeTask,
  } = useWorkManager({
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
  });

  const {
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
  } = useSystemManager({
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
  });

  const {
    selectedQuizId,
    setSelectedQuizId,
    selectedQuiz,
    connectorTarget,
    setConnectorTarget,
    connectorRuns,
    connectorAuthConnected,
    setConnectorAuthConnected,
    connectorRequestLogs,
    instructorMode,
    setInstructorMode,
    blueprint,
    setBlueprint,
    masteryBands,
    itemAnalysis,
    blueprintAudit,
    connectorPresetNotes,
    applyConnectorPreset,
    runConnectorSimulation,
    copyConnectorPayload,
    copyConnectorCurl,
  } = useQuizInsights({
    quizBanks,
    quizAttempts,
    setQuizImportFormat,
    setQuizExportFormat,
    setQuizStatus,
  });

  useEffect(() => {
    if (!canUseInstructorFeatures && instructorMode) {
      setInstructorMode(false);
    }
  }, [canUseInstructorFeatures, instructorMode, setInstructorMode]);

  const {
    quizAdaptiveMode,
    setQuizAdaptiveMode,
    quizSkillBand,
    activeQuizId,
    activeQuestionIndex,
    setActiveQuestionIndex,
    activeAnswers,
    activeScore,
    activeQuiz,
    activeQuestion,
    startQuizAttempt,
    setSingleAnswer,
    setShortAnswer,
    toggleMultiAnswer,
    goAdaptiveNext,
    submitQuizAttempt,
    clearActiveQuiz,
  } = useQuizRuntime({
    quizBanks,
    quizReviews,
    currentUser,
    ensureSignedIn,
    setStore,
    setQuizStatus,
    onSelectQuizBank: setSelectedQuizId,
  });

  const {
    toggleQuizTarget,
    addDraftQuestion,
    saveDraftQuizBank,
    importQuizBanks,
    exportSelectedQuiz,
    deleteQuizBank,
  } = useQuizBankManager({
    ensureSignedIn,
    currentUser,
    setStore,
    setQuizStatus,
    quizTargets,
    setQuizTargets,
    quizPrompt,
    quizKind,
    quizChoicesText,
    quizCorrectText,
    quizQuestionDifficulty,
    quizExplanation,
    setQuizPrompt,
    setQuizChoicesText,
    setQuizCorrectText,
    setQuizExplanation,
    quizDraftQuestions,
    setQuizDraftQuestions,
    quizTitle,
    quizSubject,
    quizDifficulty,
    setSelectedQuizId,
    selectedQuizId,
    activeQuizId,
    clearActiveQuiz,
    quizImportText,
    quizImportFormat,
    quizExportFormat,
    setQuizExportText,
    selectedQuiz,
  });

  const {
    resetLessonForm,
    saveLesson,
    editLesson,
    deleteLesson,
    generateSharePack,
    importSharePack,
  } = useLessonShareManager({
    ensureSignedIn,
    currentUser,
    setStore,
    lessons,
    quizBanks,
    lessonDraftId,
    setLessonDraftId,
    lessonTitle,
    setLessonTitle,
    lessonTopic,
    setLessonTopic,
    lessonContent,
    setLessonContent,
    lessonEstimatedMinutes,
    setLessonEstimatedMinutes,
    lessonTagsText,
    setLessonTagsText,
    lessonLinkedQuizIdsText,
    setLessonLinkedQuizIdsText,
    setLessonStatus,
    shareKind,
    shareLessonId,
    shareQuizId,
    sharePayload,
    setSharePayload,
    setShareStatus,
  });

  const {
    customProfileImportPreview,
    toggleModule,
    moveModule,
    setDefaultModule,
    resetModuleLayout,
    applyModuleProfile,
    saveCurrentAsCustomProfile,
    applyCustomProfile,
    deleteCustomProfile,
    exportCustomProfiles,
    importCustomProfiles,
  } = useModuleProfileManager({
    ensureSignedIn,
    currentUser,
    settings,
    setStore,
    setView,
    setModuleStatus,
    customProfileName,
    setCustomProfileName,
    customProfilesTransferText,
    setCustomProfilesTransferText,
    customProfilesImportMode,
    customProfileConflictMode,
  });

  const navModules = useMemo(() => {
    if (!currentUser) {
      const guestOrder: ViewKey[] = ["home", "auth", "coach"];
      const byKey = new Map(MODULE_CATALOG.map((item) => [item.key, item]));
      return guestOrder
        .map((key) => byKey.get(key))
        .filter((item): item is ModuleDescriptor => Boolean(item));
    }

    const byKey = new Map(MODULE_CATALOG.map((item) => [item.key, item]));
    const order = settings.viewOrder.filter((key) => byKey.has(key));
    const enabled = new Set(settings.enabledViews.filter((key) => byKey.has(key)));
    const ordered = order.map((key) => byKey.get(key)).filter((item): item is ModuleDescriptor => Boolean(item));
    const visible = ordered.filter((item) => enabled.has(item.key));
    return visible.length ? visible : [{ key: "home" as ViewKey, label: "Home" }];
  }, [currentUser, settings.viewOrder, settings.enabledViews]);

  useEffect(() => {
    if (!navModules.some((module) => module.key === view)) {
      setView(navModules[0].key);
    }
  }, [navModules, view]);

  const quizMastery = useMemo(() => {
    if (!quizAttempts.length) return { attempts: 0, best: 0, avg: 0 };
    const best = Math.max(...quizAttempts.map((attempt) => attempt.percent));
    const avg = Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.percent, 0) / quizAttempts.length);
    return { attempts: quizAttempts.length, best, avg };
  }, [quizAttempts]);

  const upcomingReviews = useMemo(() => {
    const now = Date.now();
    return quizReviews
      .filter((row) => row.dueAt <= now + 1000 * 60 * 60 * 24 * 7)
      .sort((a, b) => a.dueAt - b.dueAt)
      .slice(0, 8);
  }, [quizReviews]);


  const sortedAssignments = useMemo(
    () =>
      [...assignments].sort((a, b) => {
        if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
        const p = { High: 1, Medium: 2, Low: 3 };
        if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
        return a.dueDate.localeCompare(b.dueDate);
      }),
    [assignments],
  );

  const pendingPlanner = useMemo(() => planner.filter((item) => !item.done), [planner]);

  const nextAssignment = useMemo(() => {
    const active = sortedAssignments.filter((item) => !item.completed);
    if (!active.length) return null;
    return [...active].sort((a, b) => {
      const dueDelta = daysUntil(a.dueDate) - daysUntil(b.dueDate);
      if (dueDelta !== 0) return dueDelta;
      const p = { High: 1, Medium: 2, Low: 3 };
      return p[a.priority] - p[b.priority];
    })[0];
  }, [sortedAssignments]);

  const workload = useMemo(() => {
    const activeAssignments = sortedAssignments.filter((item) => !item.completed);
    const overdue = activeAssignments.filter((item) => daysUntil(item.dueDate) < 0).length;
    const dueIn3Days = activeAssignments.filter((item) => daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 3).length;
    const dueIn7Days = activeAssignments.filter((item) => daysUntil(item.dueDate) >= 0 && daysUntil(item.dueDate) <= 7).length;
    const pendingTasks = pendingPlanner.length;
    const riskLevel = overdue > 0 || dueIn3Days >= 3 ? "high" : dueIn3Days > 0 || pendingTasks > 6 ? "medium" : "low";
    return { overdue, dueIn3Days, dueIn7Days, pendingTasks, riskLevel };
  }, [sortedAssignments, pendingPlanner]);

  const nextStep = useMemo(() => {
    if (!currentUser) {
      return {
        title: "Sign in to personalize your plan",
        detail: "Your recommendations, workload alerts, and timer guidance become available after login.",
        actionLabel: "Go to Auth",
        action: () => setView("auth" as ViewKey),
      };
    }

    if (workload.overdue > 0) {
      return {
        title: "Rescue overdue work first",
        detail: `You have ${workload.overdue} overdue assignment(s). Start with ${nextAssignment?.title || "the oldest assignment"}.`,
        actionLabel: "Open Assignments",
        action: () => setView("assignments" as ViewKey),
      };
    }

    if (nextAssignment && daysUntil(nextAssignment.dueDate) <= 3) {
      return {
        title: "Protect your near-deadline assignment",
        detail: `${nextAssignment.title} is due in ${Math.max(daysUntil(nextAssignment.dueDate), 0)} day(s). Schedule a focused sprint now.`,
        actionLabel: "Start Focus Timer",
        action: () => {
          setTimerMode("study");
          setRemainingSec(45 * 60);
          setTimerStatus("Deadline sprint ready: 45-minute study block set.");
          setView("timer" as ViewKey);
        },
      };
    }

    if (pendingPlanner.length > 0) {
      return {
        title: "Clear one planner task for momentum",
        detail: `You have ${pendingPlanner.length} pending planner task(s). Completing one creates instant progress momentum.`,
        actionLabel: "Open Planner",
        action: () => setView("planner" as ViewKey),
      };
    }

    return {
      title: "Run a retention-focused study block",
      detail: "Use retrieval practice on the last topic you studied, then self-test before moving on.",
      actionLabel: "Open Study Coach",
      action: () => setView("coach" as ViewKey),
    };
  }, [currentUser, workload.overdue, nextAssignment, pendingPlanner]);

  const { generateCoachPlan } = useCoachManager({
    ensureSignedIn,
    energyLevel,
    availableMinutes,
    nextAssignment,
    setTimerMode,
    setRemainingSec,
    setTimerStatus,
    setCoachPlan,
  });

  const totals = useMemo(() => {
    const total = sessions.reduce((sum, s) => sum + s.durationSec, 0);
    const study = sessions.filter((s) => s.mode === "study").reduce((sum, s) => sum + s.durationSec, 0);
    const brk = sessions.filter((s) => s.mode === "break").reduce((sum, s) => sum + s.durationSec, 0);
    const avg = sessions.length ? Math.round(total / sessions.length) : 0;
    const max = sessions.length ? Math.max(...sessions.map((s) => s.durationSec)) : 0;
    const min = sessions.length ? Math.min(...sessions.map((s) => s.durationSec)) : 0;
    return { total, study, brk, avg, max, min };
  }, [sessions]);

  if (!ready) {
    return <main className="main-shell">Loading...</main>;
  }

  return (
    <main className={`main-shell ${previewMode === "auto" ? "" : `preview-${previewMode}`}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <section className="hero">
        <div className="hero-head">
          <h1>Student Productivity Hub</h1>
          <div className="preview-picker" role="group" aria-label="Device preview mode">
            <label htmlFor="preview-mode">Preview</label>
            <select
              id="preview-mode"
              title="Preview device viewport"
              value={previewMode}
              onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}
            >
              <option value="auto">Auto</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>
        </div>
        <p>Mobile-first study OS inspired by your AppLab architecture: auth, planner, timer, GPA, analytics, and backup lifecycle.</p>
        <div className="kpi-row">
          <div className="kpi">
            <span>Active assignments</span>
            <strong>{sortedAssignments.filter((x) => !x.completed).length}</strong>
          </div>
          <div className="kpi">
            <span>Planner tasks</span>
            <strong>{planner.length}</strong>
          </div>
          <div className="kpi">
            <span>Study time</span>
            <strong>{hhmmss(totals.study)}</strong>
          </div>
          <div className="kpi">
            <span>Current user</span>
            <strong>{currentUser || "Guest"}</strong>
          </div>
          <div className="kpi">
            <span>Role</span>
            <strong>{role.toUpperCase()}</strong>
          </div>
        </div>
      </section>

      <nav className="nav-tabs" aria-label="Sections">
        {navModules.map((module) => (
          <button
            key={module.key}
            className={view === module.key ? "active" : ""}
            aria-current={view === module.key ? "page" : undefined}
            onClick={() => {
              if (!currentUser && authRequiredViews.has(module.key)) {
                setView("auth");
                setAuthMsg("Sign in to access this module.");
                return;
              }
              setView(module.key);
            }}
          >
            {module.label}
          </button>
        ))}
      </nav>

      <section id="main-content" className="section-grid">
        {view === "home" && (
          <>
            <OnboardingPanel
              isSignedIn={Boolean(currentUser)}
              hasAssignments={assignments.length > 0}
              hasPlannerTasks={planner.length > 0}
              hasQuizBanks={quizBanks.length > 0}
              hasStudySessions={sessions.some((entry) => entry.mode === "study")}
              onGoAuth={() => setView("auth")}
              onGoAssignments={() => setView("assignments")}
              onGoPlanner={() => setView("planner")}
              onGoQuiz={() => setView("quiz")}
              onGoTimer={() => setView("timer")}
            />

            <CommandCenterPanel
              title={nextStep.title}
              detail={nextStep.detail}
              actionLabel={nextStep.actionLabel}
              onPrimaryAction={nextStep.action}
              onOpenCoach={() => setView("coach")}
            />

            <WorkloadRiskPanel
              overdue={workload.overdue}
              dueIn3Days={workload.dueIn3Days}
              dueIn7Days={workload.dueIn7Days}
              pendingTasks={workload.pendingTasks}
              riskLevel={workload.riskLevel}
            />

            {currentUser ? (
              <ModuleWorkspacePanel
                currentUser={currentUser}
                moduleProfiles={MODULE_PROFILES}
                moduleCatalog={MODULE_CATALOG}
                settings={settings}
                moduleStatus={moduleStatus}
                customProfileName={customProfileName}
                customProfilesTransferText={customProfilesTransferText}
                customProfilesImportMode={customProfilesImportMode}
                customProfileConflictMode={customProfileConflictMode}
                customProfileImportPreview={customProfileImportPreview}
                setCustomProfileName={setCustomProfileName}
                setCustomProfilesTransferText={setCustomProfilesTransferText}
                setCustomProfilesImportMode={setCustomProfilesImportMode}
                setCustomProfileConflictMode={setCustomProfileConflictMode}
                onApplyModuleProfile={applyModuleProfile}
                onSaveCurrentAsCustomProfile={saveCurrentAsCustomProfile}
                onExportCustomProfiles={exportCustomProfiles}
                onImportCustomProfiles={importCustomProfiles}
                onApplyCustomProfile={applyCustomProfile}
                onDeleteCustomProfile={deleteCustomProfile}
                onToggleModule={toggleModule}
                onMoveModule={moveModule}
                onSetDefaultModule={setDefaultModule}
                onResetModuleLayout={resetModuleLayout}
              />
            ) : null}
          </>
        )}

        {view === "coach" && (
          <StudyCoachPanel
            energyLevel={energyLevel}
            availableMinutes={availableMinutes}
            coachPlan={coachPlan}
            setEnergyLevel={setEnergyLevel}
            setAvailableMinutes={setAvailableMinutes}
            onGeneratePlan={generateCoachPlan}
            onOpenTimer={() => setView("timer")}
          />
        )}

        {view === "auth" && (
          <AuthPanel
            currentUser={currentUser}
            role={role}
            sessionStatus={sessionStatus}
            oauthProviders={providers.map((provider) => ({ id: provider.id, name: provider.name }))}
            isAuthRequired={isAuthRequired}
            returnToLabel={authReturnToLabel}
            loginPendingProviderId={loginPendingProviderId}
            authMsg={authMsg}
            onLogin={login}
            onLogout={logout}
          />
        )}

        {view === "assignments" && (
          <AssignmentsPanel
            hwTitle={hwTitle}
            hwSubject={hwSubject}
            hwDue={hwDue}
            hwPriority={hwPriority}
            hwStatus={hwStatus}
            sortedAssignments={sortedAssignments}
            setHwTitle={setHwTitle}
            setHwSubject={setHwSubject}
            setHwDue={setHwDue}
            setHwPriority={setHwPriority}
            onAddAssignment={addAssignment}
            onMarkAssignment={markAssignment}
            onDeleteAssignment={deleteAssignment}
          />
        )}

        {view === "planner" && (
          <PlannerPanel
            taskText={taskText}
            taskStatus={taskStatus}
            planner={planner}
            setTaskText={setTaskText}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onRemoveTask={removeTask}
          />
        )}

        {view === "quiz" && (
          <>
            <QuizOverviewPanel
              quizBankCount={quizBanks.length}
              attempts={quizMastery.attempts}
              bestScore={quizMastery.best}
              averageScore={quizMastery.avg}
              reviewsDueSoon={upcomingReviews.length}
            />

            <CompatibilityTargetsPanel
              providerProfiles={PROVIDER_PROFILES}
              selectedTargets={quizTargets}
              onToggleTarget={toggleQuizTarget}
            />

            <QuestionBankBuilderPanel
              quizTitle={quizTitle}
              quizSubject={quizSubject}
              quizDifficulty={quizDifficulty}
              quizPrompt={quizPrompt}
              quizKind={quizKind}
              quizQuestionDifficulty={quizQuestionDifficulty}
              quizChoicesText={quizChoicesText}
              quizCorrectText={quizCorrectText}
              quizExplanation={quizExplanation}
              quizDraftQuestions={quizDraftQuestions}
              setQuizTitle={setQuizTitle}
              setQuizSubject={setQuizSubject}
              setQuizDifficulty={setQuizDifficulty}
              setQuizPrompt={setQuizPrompt}
              setQuizKind={setQuizKind}
              setQuizQuestionDifficulty={setQuizQuestionDifficulty}
              setQuizChoicesText={setQuizChoicesText}
              setQuizCorrectText={setQuizCorrectText}
              setQuizExplanation={setQuizExplanation}
              onAddDraftQuestion={addDraftQuestion}
              onSaveDraftQuizBank={saveDraftQuizBank}
            />

            <QuizAdapterPanel
              quizImportFormat={quizImportFormat}
              quizImportText={quizImportText}
              quizExportFormat={quizExportFormat}
              quizExportText={quizExportText}
              setQuizImportFormat={setQuizImportFormat}
              setQuizImportText={setQuizImportText}
              setQuizExportFormat={setQuizExportFormat}
              setQuizExportText={setQuizExportText}
              onImportQuizBanks={importQuizBanks}
              onExportSelectedQuiz={exportSelectedQuiz}
            />

            <article className="panel">
              <h2>Lesson Studio</h2>
              <p className="compact-line">Create your own lessons, link them to quiz banks, and personalize learning paths.</p>
              <div className="form-row">
                <label>Lesson title</label>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Cell Biology Fundamentals" />
              </div>
              <div className="form-row">
                <label>Topic and estimated minutes</label>
                <div className="btn-row">
                  <input className="inline-input" value={lessonTopic} onChange={(e) => setLessonTopic(e.target.value)} placeholder="Biology" />
                  <input
                    className="inline-input"
                    title="Estimated lesson minutes"
                    type="number"
                    min={5}
                    max={240}
                    value={lessonEstimatedMinutes}
                    onChange={(e) => setLessonEstimatedMinutes(Number(e.target.value) || 20)}
                  />
                </div>
              </div>
              <div className="form-row">
                <label>Lesson content</label>
                <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} placeholder="Explain concepts, worked examples, and reflection prompts..." />
              </div>
              <div className="form-row">
                <label>Tags (comma-separated)</label>
                <input value={lessonTagsText} onChange={(e) => setLessonTagsText(e.target.value)} placeholder="revision, chapter-3, exam" />
              </div>
              <div className="form-row">
                <label>Linked quiz bank IDs (comma-separated)</label>
                <input value={lessonLinkedQuizIdsText} onChange={(e) => setLessonLinkedQuizIdsText(e.target.value)} placeholder="quiz-bank-id-1, quiz-bank-id-2" />
              </div>
              <div className="btn-row mt-8">
                <button className="primary" onClick={saveLesson}>{lessonDraftId ? "Update lesson" : "Save lesson"}</button>
                <button className="ghost" onClick={() => resetLessonForm("Lesson form reset.")}>
                  Reset form
                </button>
              </div>
              {lessonStatus ? <p className="status">{lessonStatus}</p> : null}

              <h3 className="mt-8">My Lessons</h3>
              <ul className="list">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <strong>{lesson.title}</strong>
                    <div className="compact-line">{lesson.topic} · {lesson.estimatedMinutes} min · updated {new Date(lesson.updatedAt).toLocaleString()}</div>
                    <div className="compact-line">Tags: {lesson.tags.length ? lesson.tags.join(", ") : "none"}</div>
                    <div className="compact-line">Linked quizzes: {lesson.linkedQuizBankIds.length ? lesson.linkedQuizBankIds.join(", ") : "none"}</div>
                    <div className="btn-row mt-6">
                      <button className="secondary" onClick={() => editLesson(lesson.id)}>Edit</button>
                      <button className="ghost" onClick={() => deleteLesson(lesson.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <h2>Share Exchange</h2>
              <p className="compact-line">Share your custom lessons and quizzes with other users via portable JSON packs.</p>
              <div className="form-row">
                <label>Share type</label>
                <select title="Share pack type" value={shareKind} onChange={(e) => setShareKind(e.target.value as "lesson" | "quiz" | "bundle")}>
                  <option value="bundle">Bundle (lessons + quizzes)</option>
                  <option value="lesson">Single lesson</option>
                  <option value="quiz">Single quiz bank</option>
                </select>
              </div>

              {shareKind === "lesson" ? (
                <div className="form-row">
                  <label>Select lesson</label>
                  <select title="Lesson to share" value={shareLessonId} onChange={(e) => setShareLessonId(e.target.value)}>
                    <option value="">Select lesson</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {shareKind === "quiz" ? (
                <div className="form-row">
                  <label>Select quiz bank</label>
                  <select title="Quiz bank to share" value={shareQuizId} onChange={(e) => setShareQuizId(e.target.value)}>
                    <option value="">Select quiz bank</option>
                    {quizBanks.map((bank) => (
                      <option key={bank.id} value={bank.id}>{bank.title}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="btn-row mt-8">
                <button className="primary" onClick={generateSharePack}>Generate share pack</button>
                <button className="secondary" onClick={importSharePack}>Import share pack</button>
              </div>

              <div className="form-row mt-8">
                <label>Share payload</label>
                <textarea
                  value={sharePayload}
                  onChange={(e) => setSharePayload(e.target.value)}
                  placeholder="Copy this payload and share it, or paste a received payload and import"
                />
              </div>
              {shareStatus ? <p className="status">{shareStatus}</p> : null}
            </article>

            <QuizBanksPanel
              quizBanks={quizBanks}
              onSelectQuizBank={setSelectedQuizId}
              onStartQuizBank={startQuizAttempt}
              onDeleteQuizBank={deleteQuizBank}
            />

            <AssessmentRuntimePanel
              activeQuiz={activeQuiz}
              activeQuestion={activeQuestion}
              activeQuestionIndex={activeQuestionIndex}
              activeAnswers={activeAnswers}
              quizAdaptiveMode={quizAdaptiveMode}
              quizSkillBand={quizSkillBand}
              activeScore={activeScore}
              quizAttempts={quizAttempts}
              upcomingReviews={upcomingReviews}
              quizStatus={quizStatus}
              selectedQuizTitle={selectedQuiz?.title || ""}
              setSingleAnswer={setSingleAnswer}
              toggleMultiAnswer={toggleMultiAnswer}
              setShortAnswer={setShortAnswer}
              onToggleAdaptive={() => setQuizAdaptiveMode((prev) => !prev)}
              onPrevQuestion={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
              onNextQuestion={() => setActiveQuestionIndex((prev) => Math.min((activeQuiz?.questions.length || 1) - 1, prev + 1))}
              onAdaptiveNext={goAdaptiveNext}
              onSubmitQuiz={submitQuizAttempt}
            />

            {canUseInstructorFeatures ? (
              <>
                <LmsConnectorPanel
                  canManageConnectors={canUseInstructorFeatures}
                  connectorTarget={connectorTarget}
                  connectorOptions={LMS_CONNECTORS}
                  connectorPresetNotes={connectorPresetNotes}
                  connectorAuthConnected={connectorAuthConnected}
                  connectorRuns={connectorRuns}
                  connectorRequestLogs={connectorRequestLogs}
                  setConnectorTarget={setConnectorTarget}
                  onToggleMockAuth={() => setConnectorAuthConnected((prev) => !prev)}
                  onApplyPreset={applyConnectorPreset}
                  onRunDryRun={runConnectorSimulation}
                  onCopyPayload={copyConnectorPayload}
                  onCopyCurl={copyConnectorCurl}
                />

                <InstructorModePanel
                  canAccessInstructorMode={canUseInstructorFeatures}
                  instructorMode={instructorMode}
                  blueprint={blueprint}
                  blueprintAudit={blueprintAudit}
                  masteryBands={masteryBands}
                  itemAnalysis={itemAnalysis}
                  setInstructorMode={setInstructorMode}
                  setBlueprint={setBlueprint}
                />
              </>
            ) : (
              <>
                <AccessDeniedPanel
                  heading="LMS Connector Access"
                  detail="Connector simulation and payload diagnostics are restricted to instructor and admin roles."
                  role={role}
                  actionLabel="Open Auth"
                  onAction={() => setView("auth")}
                />
                <AccessDeniedPanel
                  heading="Instructor Mode Access"
                  detail="Blueprint analytics, mastery segmentation, and item analysis require an instructor/admin account."
                  role={role}
                  actionLabel="Open Auth"
                  onAction={() => setView("auth")}
                />
              </>
            )}
          </>
        )}

        {view === "timer" && (
          <TimerPanel
            timerMode={timerMode}
            timerStatus={timerStatus}
            remainingText={mmss(remainingSec)}
            totalStudyText={hhmmss(totals.study)}
            totalBreakText={hhmmss(totals.brk)}
            onStart={() => setRunning(true)}
            onPause={() => setRunning(false)}
            onReset={resetTimer}
            onToggleMode={toggleTimerMode}
          />
        )}

        {view === "gpa" && <GpaPanel gInputs={gInputs} gpaText={gpaText} setGInputs={setGInputs} onRunGpa={runGpa} />}

        {view === "motivation" && <MotivationPanel quote={quote} onRandomQuote={randomQuote} />}

        {view === "analytics" && (
          <AnalyticsPanel
            completedAssignments={assignments.filter((assignment) => assignment.completed).length}
            sessionsCount={sessions.length}
            avgSessionText={mmss(totals.avg)}
            maxSessionText={mmss(totals.max)}
            minSessionText={mmss(totals.min)}
          />
        )}

        {view === "backup" && (
          <BackupPanel
            exportText={exportText}
            importText={importText}
            backupStatus={backupStatus}
            backups={backups}
            settings={settings}
            setExportText={setExportText}
            setImportText={setImportText}
            onGenerateExport={generateExport}
            onImport={importBundle}
            onCreateBackup={createBackup}
            onRestoreBackup={restoreBackup}
            onSaveSettings={saveSettings}
          />
        )}
      </section>
    </main>
  );
}
