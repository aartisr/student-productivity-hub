import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { runConnectorDryRun, getConnectorPreset, type ConnectorDryRunResult, type LmsConnectorId } from "../lmsConnectors";
import { type ImportFormat, type QuizBank } from "../quizEngine";
import { type BlueprintConstraints, type ConnectorRequestLog, type QuizAttempt, uid } from "../domain";

type ItemAnalysisRow = { questionId: string; prompt: string; facility: number; discrimination: number; attempts: number };
type BlueprintAudit = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  meetsCount: boolean;
  easyGap: number;
  mediumGap: number;
  hardGap: number;
};

type UseQuizInsightsArgs = {
  quizBanks: QuizBank[];
  quizAttempts: QuizAttempt[];
  setQuizImportFormat: Dispatch<SetStateAction<ImportFormat>>;
  setQuizExportFormat: Dispatch<SetStateAction<Exclude<ImportFormat, "auto">>>;
  setQuizStatus: (value: string) => void;
};

export function useQuizInsights(args: UseQuizInsightsArgs) {
  const { quizBanks, quizAttempts, setQuizImportFormat, setQuizExportFormat, setQuizStatus } = args;

  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [connectorTarget, setConnectorTarget] = useState<LmsConnectorId>("moodle");
  const [connectorRuns, setConnectorRuns] = useState<ConnectorDryRunResult[]>([]);
  const [connectorAuthConnected, setConnectorAuthConnected] = useState(false);
  const [connectorRequestLogs, setConnectorRequestLogs] = useState<ConnectorRequestLog[]>([]);
  const [instructorMode, setInstructorMode] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintConstraints>({ targetQuestions: 20, easyPct: 30, mediumPct: 40, hardPct: 30 });

  const selectedQuiz = useMemo(() => quizBanks.find((bank) => bank.id === selectedQuizId) || null, [quizBanks, selectedQuizId]);
  const connectorPresetNotes = getConnectorPreset(connectorTarget).notes;

  const masteryBands = useMemo(() => {
    const bands = { emerging: 0, developing: 0, proficient: 0, mastery: 0 };
    for (const attempt of quizAttempts) {
      if (attempt.percent < 60) bands.emerging += 1;
      else if (attempt.percent < 75) bands.developing += 1;
      else if (attempt.percent < 90) bands.proficient += 1;
      else bands.mastery += 1;
    }
    return bands;
  }, [quizAttempts]);

  const itemAnalysis = useMemo(() => {
    if (!selectedQuiz || !quizAttempts.length) return [] as ItemAnalysisRow[];

    const related = quizAttempts.filter((attempt) => attempt.quizId === selectedQuiz.id);
    if (!related.length) return [] as ItemAnalysisRow[];

    const sorted = [...related].sort((a, b) => b.percent - a.percent);
    const groupSize = Math.max(1, Math.floor(sorted.length * 0.27));
    const upper = sorted.slice(0, groupSize);
    const lower = sorted.slice(-groupSize);

    return selectedQuiz.questions.map((question) => {
      const all = related.map((attempt) => attempt.byQuestion.find((row) => row.questionId === question.id)?.isCorrect ?? false);
      const p = all.filter(Boolean).length / Math.max(1, all.length);

      const upperP = upper
        .map((attempt) => attempt.byQuestion.find((row) => row.questionId === question.id)?.isCorrect ?? false)
        .filter(Boolean).length / Math.max(1, upper.length);

      const lowerP = lower
        .map((attempt) => attempt.byQuestion.find((row) => row.questionId === question.id)?.isCorrect ?? false)
        .filter(Boolean).length / Math.max(1, lower.length);

      return {
        questionId: question.id,
        prompt: question.prompt,
        facility: Math.round(p * 100),
        discrimination: Math.round((upperP - lowerP) * 100),
        attempts: all.length,
      };
    });
  }, [selectedQuiz, quizAttempts]);

  const blueprintAudit = useMemo(() => {
    if (!selectedQuiz) return null as BlueprintAudit | null;
    const total = selectedQuiz.questions.length;
    const easy = selectedQuiz.questions.filter((question) => (question.difficulty || 3) <= 2).length;
    const medium = selectedQuiz.questions.filter((question) => (question.difficulty || 3) === 3).length;
    const hard = selectedQuiz.questions.filter((question) => (question.difficulty || 3) >= 4).length;

    const easyPct = total ? Math.round((easy / total) * 100) : 0;
    const mediumPct = total ? Math.round((medium / total) * 100) : 0;
    const hardPct = total ? Math.round((hard / total) * 100) : 0;

    return {
      total,
      easy,
      medium,
      hard,
      easyPct,
      mediumPct,
      hardPct,
      meetsCount: total >= blueprint.targetQuestions,
      easyGap: easyPct - blueprint.easyPct,
      mediumGap: mediumPct - blueprint.mediumPct,
      hardGap: hardPct - blueprint.hardPct,
    };
  }, [selectedQuiz, blueprint]);

  const applyConnectorPreset = () => {
    const preset = getConnectorPreset(connectorTarget);
    setQuizImportFormat(preset.importFormat);
    setQuizExportFormat(preset.exportFormat);
    setQuizStatus(`Applied ${connectorTarget} preset: import ${preset.importFormat}, export ${preset.exportFormat}.`);
  };

  const runConnectorSimulation = () => {
    if (!selectedQuiz) {
      setQuizStatus("Select a quiz bank before running connector dry-run.");
      return;
    }

    const result = runConnectorDryRun(selectedQuiz, connectorTarget, { authConnected: connectorAuthConnected });
    setConnectorRuns((prev) => [result, ...prev].slice(0, 10));

    const logEntry: ConnectorRequestLog = {
      id: uid(),
      createdAt: Date.now(),
      connectorName: result.connectorName,
      method: result.requestPreview.method,
      endpointHint: result.requestPreview.endpointHint,
      authMode: result.requestPreview.authMode,
      payloadBytes: result.payloadBytes,
      payloadPreview: result.payloadPreview,
      itemCount: result.itemCount,
      status: result.status,
      warnings: result.warnings,
    };
    setConnectorRequestLogs((prev) => [logEntry, ...prev].slice(0, 20));

    setQuizStatus(`${result.connectorName} dry-run complete: ${result.status.toUpperCase()}.`);
  };

  const copyTextToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      if (typeof document === "undefined") {
        return false;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  };

  const copyConnectorPayload = async (log: ConnectorRequestLog) => {
    const copied = await copyTextToClipboard(log.payloadPreview);
    setQuizStatus(copied ? `Copied payload preview for ${log.connectorName}.` : "Unable to copy payload preview in this browser context.");
  };

  const copyConnectorCurl = async (log: ConnectorRequestLog) => {
    const toSlugPath = (hint: string) => {
      if (hint.startsWith("/")) return hint;
      const slug = hint.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `/mock/${slug || "import"}`;
    };

    const escapeSingle = (value: string) => value.replaceAll("'", `"'"'"'`);
    const endpointPath = toSlugPath(log.endpointHint);
    const authHeader = log.authMode === "mock-token" ? " \\\n+  -H 'Authorization: Bearer MOCK_TOKEN'" : "";

    const curlCommand = [
      `curl -X ${log.method} 'https://api.example-lms.local${endpointPath}' \\\\`,
      `  -H 'Content-Type: text/plain; charset=utf-8'${authHeader} \\\\`,
      `  --data-raw '${escapeSingle(log.payloadPreview)}'`,
    ].join("\n");

    const copied = await copyTextToClipboard(curlCommand);
    setQuizStatus(copied ? `Copied mock cURL for ${log.connectorName}.` : "Unable to copy cURL command in this browser context.");
  };

  return {
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
  };
}
