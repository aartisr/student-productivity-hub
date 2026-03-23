import { type Dispatch, type SetStateAction } from "react";
import { buildProviderCompatibility, type QuizBank } from "../quizEngine";
import { type AppData, type Lesson, type SharePack, uid } from "../domain";

type UseLessonShareManagerArgs = {
  ensureSignedIn: () => boolean;
  currentUser: string;
  setStore: Dispatch<SetStateAction<AppData>>;
  lessons: Lesson[];
  quizBanks: QuizBank[];
  lessonDraftId: string;
  setLessonDraftId: (value: string) => void;
  lessonTitle: string;
  setLessonTitle: (value: string) => void;
  lessonTopic: string;
  setLessonTopic: (value: string) => void;
  lessonContent: string;
  setLessonContent: (value: string) => void;
  lessonEstimatedMinutes: number;
  setLessonEstimatedMinutes: (value: number) => void;
  lessonTagsText: string;
  setLessonTagsText: (value: string) => void;
  lessonLinkedQuizIdsText: string;
  setLessonLinkedQuizIdsText: (value: string) => void;
  setLessonStatus: (value: string) => void;
  shareKind: "lesson" | "quiz" | "bundle";
  shareLessonId: string;
  shareQuizId: string;
  sharePayload: string;
  setSharePayload: (value: string) => void;
  setShareStatus: (value: string) => void;
};

export function useLessonShareManager(args: UseLessonShareManagerArgs) {
  const {
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
  } = args;

  const splitTokens = (raw: string) =>
    raw
      .split(/\n|,/)
      .map((token) => token.trim())
      .filter(Boolean);

  const resetLessonForm = (statusText = "Lesson form reset.") => {
    setLessonDraftId("");
    setLessonTitle("");
    setLessonTopic("");
    setLessonContent("");
    setLessonEstimatedMinutes(20);
    setLessonTagsText("");
    setLessonLinkedQuizIdsText("");
    setLessonStatus(statusText);
  };

  const saveLesson = () => {
    if (!ensureSignedIn()) return;
    const title = lessonTitle.trim();
    const content = lessonContent.trim();
    if (!title || !content) {
      setLessonStatus("Lesson title and content are required.");
      return;
    }

    const nextLesson: Lesson = {
      id: lessonDraftId || uid(),
      title,
      topic: lessonTopic.trim() || "General",
      content,
      estimatedMinutes: Math.max(5, Math.min(240, Number(lessonEstimatedMinutes) || 20)),
      tags: splitTokens(lessonTagsText),
      linkedQuizBankIds: splitTokens(lessonLinkedQuizIdsText),
      updatedAt: Date.now(),
    };

    setStore((prev) => {
      const existing = prev.lessons[currentUser] || [];
      const hasExisting = existing.some((lesson) => lesson.id === nextLesson.id);
      const nextList = hasExisting ? existing.map((lesson) => (lesson.id === nextLesson.id ? nextLesson : lesson)) : [nextLesson, ...existing];

      return {
        ...prev,
        lessons: {
          ...prev.lessons,
          [currentUser]: nextList,
        },
      };
    });

    setLessonDraftId(nextLesson.id);
    setLessonStatus(`Lesson ${lessonDraftId ? "updated" : "saved"}: ${nextLesson.title}.`);
  };

  const editLesson = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    setLessonDraftId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonTopic(lesson.topic);
    setLessonContent(lesson.content);
    setLessonEstimatedMinutes(lesson.estimatedMinutes);
    setLessonTagsText(lesson.tags.join(", "));
    setLessonLinkedQuizIdsText(lesson.linkedQuizBankIds.join(", "));
    setLessonStatus(`Editing lesson: ${lesson.title}.`);
  };

  const deleteLesson = (lessonId: string) => {
    if (!ensureSignedIn()) return;
    setStore((prev) => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [currentUser]: (prev.lessons[currentUser] || []).filter((lesson) => lesson.id !== lessonId),
      },
    }));
    if (lessonDraftId === lessonId) resetLessonForm("Lesson removed.");
    setLessonStatus("Lesson removed.");
  };

  const generateSharePack = () => {
    if (!ensureSignedIn()) return;

    const lesson = lessons.find((item) => item.id === shareLessonId);
    const quiz = quizBanks.find((item) => item.id === shareQuizId);

    const pack: SharePack = {
      version: 1,
      type: shareKind,
      author: currentUser,
      createdAt: Date.now(),
      lessons: shareKind === "lesson" ? (lesson ? [lesson] : []) : shareKind === "bundle" ? lessons.slice(0, 20) : [],
      quizBanks: shareKind === "quiz" ? (quiz ? [quiz] : []) : shareKind === "bundle" ? quizBanks.slice(0, 20) : [],
    };

    if (shareKind === "lesson" && !pack.lessons.length) {
      setShareStatus("Select a lesson to share.");
      return;
    }
    if (shareKind === "quiz" && !pack.quizBanks.length) {
      setShareStatus("Select a quiz bank to share.");
      return;
    }

    setSharePayload(JSON.stringify(pack, null, 2));
    setShareStatus(`Prepared ${shareKind} share pack.`);
  };

  const importSharePack = () => {
    if (!ensureSignedIn()) return;
    const raw = sharePayload.trim();
    if (!raw) {
      setShareStatus("Paste a share pack payload to import.");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SharePack;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.lessons) || !Array.isArray(parsed.quizBanks)) {
        setShareStatus("Invalid share pack payload.");
        return;
      }

      const existingLessons = lessons;
      const existingQuizzes = quizBanks;
      const lessonNameSet = new Set(existingLessons.map((item) => item.title.toLowerCase()));
      const quizNameSet = new Set(existingQuizzes.map((item) => item.title.toLowerCase()));

      const makeUniqueTitle = (base: string, used: Set<string>) => {
        const normalized = base.trim() || "Shared Item";
        let candidate = normalized;
        let suffix = 2;
        while (used.has(candidate.toLowerCase())) {
          candidate = `${normalized} (${suffix})`;
          suffix += 1;
        }
        used.add(candidate.toLowerCase());
        return candidate;
      };

      const importedLessons = parsed.lessons.map((lesson) => ({
        ...lesson,
        id: uid(),
        title: makeUniqueTitle(lesson.title, lessonNameSet),
        updatedAt: Date.now(),
      }));

      const importedBanks = parsed.quizBanks.map((bank) => ({
        ...bank,
        id: uid(),
        title: makeUniqueTitle(bank.title, quizNameSet),
        source: `shared:${parsed.author || "peer"}`,
        compatibility: buildProviderCompatibility(bank.compatibility || []),
      }));

      setStore((prev) => ({
        ...prev,
        lessons: {
          ...prev.lessons,
          [currentUser]: [...importedLessons, ...(prev.lessons[currentUser] || [])],
        },
        quizBanks: {
          ...prev.quizBanks,
          [currentUser]: [...importedBanks, ...(prev.quizBanks[currentUser] || [])],
        },
      }));

      setShareStatus(`Imported ${importedLessons.length} lesson(s) and ${importedBanks.length} quiz bank(s) from share pack.`);
    } catch {
      setShareStatus("Share import failed. Verify JSON payload.");
    }
  };

  return {
    resetLessonForm,
    saveLesson,
    editLesson,
    deleteLesson,
    generateSharePack,
    importSharePack,
  };
}
