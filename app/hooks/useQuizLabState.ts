import { useState } from "react";
import { PROVIDER_PROFILES, type ImportFormat, type QuestionKind, type QuizQuestion } from "../quizEngine";

export function useQuizLabState() {
  const [quizWorkspace, setQuizWorkspace] = useState<"study" | "create" | "share">("study");
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

  return {
    quizWorkspace,
    setQuizWorkspace,
    quizTitle,
    setQuizTitle,
    quizSubject,
    setQuizSubject,
    quizDifficulty,
    setQuizDifficulty,
    quizPrompt,
    setQuizPrompt,
    quizKind,
    setQuizKind,
    quizQuestionDifficulty,
    setQuizQuestionDifficulty,
    quizChoicesText,
    setQuizChoicesText,
    quizCorrectText,
    setQuizCorrectText,
    quizExplanation,
    setQuizExplanation,
    quizDraftQuestions,
    setQuizDraftQuestions,
    quizTargets,
    setQuizTargets,
    quizImportFormat,
    setQuizImportFormat,
    quizImportText,
    setQuizImportText,
    quizExportFormat,
    setQuizExportFormat,
    quizExportText,
    setQuizExportText,
    quizStatus,
    setQuizStatus,
  };
}
