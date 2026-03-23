import { type Dispatch, type SetStateAction } from "react";
import {
  buildProviderCompatibility,
  parseQuizImport,
  serializeQuizBank,
  validateQti21PackageBundle,
  type ImportFormat,
  type QuestionKind,
  type QuizBank,
  type QuizQuestion,
} from "../quizEngine";
import { type AppData, uid } from "../domain";

type UseQuizBankManagerArgs = {
  ensureSignedIn: () => boolean;
  currentUser: string;
  setStore: Dispatch<SetStateAction<AppData>>;
  setQuizStatus: (value: string) => void;
  quizTargets: string[];
  setQuizTargets: Dispatch<SetStateAction<string[]>>;
  quizPrompt: string;
  quizKind: QuestionKind;
  quizChoicesText: string;
  quizCorrectText: string;
  quizQuestionDifficulty: number;
  quizExplanation: string;
  setQuizPrompt: (value: string) => void;
  setQuizChoicesText: (value: string) => void;
  setQuizCorrectText: (value: string) => void;
  setQuizExplanation: (value: string) => void;
  quizDraftQuestions: QuizQuestion[];
  setQuizDraftQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
  quizTitle: string;
  quizSubject: string;
  quizDifficulty: string;
  setSelectedQuizId: (value: string) => void;
  selectedQuizId: string;
  activeQuizId: string;
  clearActiveQuiz: () => void;
  quizImportText: string;
  quizImportFormat: ImportFormat;
  quizExportFormat: Exclude<ImportFormat, "auto">;
  setQuizExportText: (value: string) => void;
  selectedQuiz: QuizBank | null;
};

export function useQuizBankManager(args: UseQuizBankManagerArgs) {
  const {
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
  } = args;

  const splitTokens = (raw: string) =>
    raw
      .split(/\n|,/)
      .map((token) => token.trim())
      .filter(Boolean);

  const resolveAnswerTokens = (tokens: string[], choices: string[]) => {
    return tokens
      .map((token) => {
        if (/^[A-Z]$/i.test(token)) {
          const idx = token.toUpperCase().charCodeAt(0) - 65;
          return choices[idx] || "";
        }
        const numeric = Number(token);
        if (Number.isInteger(numeric) && numeric >= 1 && numeric <= choices.length) {
          return choices[numeric - 1] || "";
        }
        return token;
      })
      .filter(Boolean);
  };

  const toggleQuizTarget = (providerId: string) => {
    setQuizTargets((prev) => (prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]));
  };

  const addDraftQuestion = () => {
    const prompt = quizPrompt.trim();
    if (!prompt) {
      setQuizStatus("Question prompt is required.");
      return;
    }

    const choices =
      quizKind === "boolean"
        ? ["True", "False"]
        : quizKind === "short"
          ? []
          : splitTokens(quizChoicesText);

    if ((quizKind === "single" || quizKind === "multi") && choices.length < 2) {
      setQuizStatus("Provide at least two choices for single/multi questions.");
      return;
    }

    const rawAnswers = splitTokens(quizCorrectText);
    if (!rawAnswers.length) {
      setQuizStatus("Provide at least one correct answer.");
      return;
    }

    const resolvedAnswers = quizKind === "short" ? rawAnswers : resolveAnswerTokens(rawAnswers, choices);
    if (!resolvedAnswers.length) {
      setQuizStatus("Correct answer does not match available choices.");
      return;
    }

    const question: QuizQuestion = {
      id: uid(),
      kind: quizKind,
      prompt,
      choices,
      correctAnswers: quizKind === "multi" ? Array.from(new Set(resolvedAnswers)) : [resolvedAnswers[0]],
      difficulty: Math.max(1, Math.min(5, Number(quizQuestionDifficulty) || 3)),
      explanation: quizExplanation.trim() || undefined,
    };

    setQuizDraftQuestions((prev) => [...prev, question]);
    setQuizPrompt("");
    setQuizChoicesText("");
    setQuizCorrectText("");
    setQuizExplanation("");
    setQuizStatus("Question added to draft.");
  };

  const saveDraftQuizBank = () => {
    if (!ensureSignedIn()) return;
    if (!quizDraftQuestions.length) {
      setQuizStatus("Add at least one question before saving.");
      return;
    }

    const bank: QuizBank = {
      id: uid(),
      title: quizTitle.trim() || "Untitled Quiz",
      subject: quizSubject.trim() || "General",
      difficulty: quizDifficulty.trim() || "mixed",
      source: "manual",
      updatedAt: Date.now(),
      compatibility: buildProviderCompatibility(quizTargets),
      questions: quizDraftQuestions,
    };

    setStore((prev) => ({
      ...prev,
      quizBanks: {
        ...prev.quizBanks,
        [currentUser]: [bank, ...(prev.quizBanks[currentUser] || [])],
      },
    }));

    setQuizDraftQuestions([]);
    setSelectedQuizId(bank.id);
    setQuizStatus(`Saved quiz bank: ${bank.title}.`);
  };

  const importQuizBanks = () => {
    if (!ensureSignedIn()) return;
    const payload = quizImportText.trim();
    if (!payload) {
      setQuizStatus("Paste quiz content to import.");
      return;
    }

    try {
      const shouldValidatePackage =
        quizImportFormat === "qti21-package" ||
        (quizImportFormat === "auto" && payload.includes("===FILE:imsmanifest.xml==="));

      if (shouldValidatePackage) {
        const report = validateQti21PackageBundle(payload);
        if (!report.valid) {
          setQuizStatus(`QTI package validation failed: ${report.errors.join(" ")}`);
          return;
        }
        if (report.warnings.length) {
          setQuizStatus(`QTI package validation warnings: ${report.warnings.join(" ")}`);
        }
      }

      const { banks, usedFormat } = parseQuizImport(payload, quizImportFormat, quizTitle.trim() || "Imported Quiz");
      if (!banks.length) {
        setQuizStatus("No compatible quiz banks were found in that payload.");
        return;
      }

      setStore((prev) => ({
        ...prev,
        quizBanks: {
          ...prev.quizBanks,
          [currentUser]: [...banks, ...(prev.quizBanks[currentUser] || [])],
        },
      }));

      setSelectedQuizId(banks[0].id);
      setQuizStatus(`Imported ${banks.length} bank(s) using ${usedFormat}.`);
    } catch {
      setQuizStatus("Import parse failed. Validate format and payload.");
    }
  };

  const exportSelectedQuiz = () => {
    if (!selectedQuiz) {
      setQuizStatus("Select a quiz bank to export.");
      return;
    }
    const text = serializeQuizBank(selectedQuiz, quizExportFormat);
    setQuizExportText(text);
    setQuizStatus(`Exported ${selectedQuiz.title} as ${quizExportFormat}.`);
  };

  const deleteQuizBank = (bankId: string) => {
    if (!ensureSignedIn()) return;

    setStore((prev) => ({
      ...prev,
      quizBanks: {
        ...prev.quizBanks,
        [currentUser]: (prev.quizBanks[currentUser] || []).filter((bank) => bank.id !== bankId),
      },
    }));

    if (selectedQuizId === bankId) {
      setSelectedQuizId("");
    }

    if (activeQuizId === bankId) {
      clearActiveQuiz();
    }
  };

  return {
    toggleQuizTarget,
    addDraftQuestion,
    saveDraftQuizBank,
    importQuizBanks,
    exportSelectedQuiz,
    deleteQuizBank,
  };
}
