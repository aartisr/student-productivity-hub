import { serializeQuizBank, type ImportFormat, type QuizBank } from "./quizEngine";

export type LmsConnectorId =
  | "moodle"
  | "canvas"
  | "blackboard"
  | "schoology"
  | "kahoot"
  | "quizizz"
  | "quizlet"
  | "anki"
  | "google-forms"
  | "microsoft-forms";

export type LmsConnector = {
  id: LmsConnectorId;
  name: string;
  preferredFormat: Exclude<ImportFormat, "auto">;
  endpointHint: string;
};

export type ConnectorPreset = {
  connectorId: LmsConnectorId;
  importFormat: ImportFormat;
  exportFormat: Exclude<ImportFormat, "auto">;
  notes: string;
};

export type ConnectorRequestPreview = {
  method: "POST";
  endpointHint: string;
  authMode: "mock-token" | "none";
};

export type ConnectorDryRunResult = {
  connectorId: LmsConnectorId;
  connectorName: string;
  formatUsed: Exclude<ImportFormat, "auto">;
  endpointHint: string;
  payloadBytes: number;
  payloadPreview: string;
  itemCount: number;
  status: "ready" | "warning";
  warnings: string[];
  recommendation: string;
  requestPreview: ConnectorRequestPreview;
};

export const LMS_CONNECTORS: LmsConnector[] = [
  { id: "moodle", name: "Moodle", preferredFormat: "qti21-package", endpointHint: "POST /webservice/rest/server.php" },
  { id: "canvas", name: "Canvas", preferredFormat: "qti21-package", endpointHint: "POST /api/v1/courses/:course_id/quizzes" },
  { id: "blackboard", name: "Blackboard", preferredFormat: "qti21-package", endpointHint: "POST /learn/api/public/v1/courses/:id/contents" },
  { id: "schoology", name: "Schoology", preferredFormat: "qti21-package", endpointHint: "POST /v1/courses/:id/assessments/import" },
  { id: "kahoot", name: "Kahoot", preferredFormat: "csv-mcq", endpointHint: "CSV batch import endpoint" },
  { id: "quizizz", name: "Quizizz", preferredFormat: "csv-mcq", endpointHint: "CSV import workflow" },
  { id: "quizlet", name: "Quizlet", preferredFormat: "tsv-flashcards", endpointHint: "Set/cards import pipeline" },
  { id: "anki", name: "Anki", preferredFormat: "tsv-flashcards", endpointHint: "AnkiConnect addNotes or CSV import" },
  { id: "google-forms", name: "Google Forms", preferredFormat: "csv-mcq", endpointHint: "Forms API + Sheets transform" },
  { id: "microsoft-forms", name: "Microsoft Forms", preferredFormat: "csv-mcq", endpointHint: "Forms + Graph transform" },
];

export const CONNECTOR_PRESETS: ConnectorPreset[] = [
  {
    connectorId: "moodle",
    importFormat: "qti21-package",
    exportFormat: "qti21-package",
    notes: "Optimized for Moodle question banks and package imports.",
  },
  {
    connectorId: "canvas",
    importFormat: "qti21-package",
    exportFormat: "qti21-package",
    notes: "Canvas performs best with QTI package workflows.",
  },
  {
    connectorId: "blackboard",
    importFormat: "qti21-package",
    exportFormat: "qti21-package",
    notes: "Blackboard package import is typically QTI-first.",
  },
  {
    connectorId: "schoology",
    importFormat: "qti21-package",
    exportFormat: "qti21-package",
    notes: "Schoology assessments align to QTI package transfer.",
  },
  {
    connectorId: "kahoot",
    importFormat: "csv-mcq",
    exportFormat: "csv-mcq",
    notes: "Kahoot supports spreadsheet-centered MCQ import paths.",
  },
  {
    connectorId: "quizizz",
    importFormat: "csv-mcq",
    exportFormat: "csv-mcq",
    notes: "Quizizz authoring pipelines are CSV-friendly.",
  },
  {
    connectorId: "quizlet",
    importFormat: "tsv-flashcards",
    exportFormat: "tsv-flashcards",
    notes: "Quizlet sets map naturally to front-back TSV imports.",
  },
  {
    connectorId: "anki",
    importFormat: "tsv-flashcards",
    exportFormat: "tsv-flashcards",
    notes: "Anki import/export is best through flat card-like tabular formats.",
  },
  {
    connectorId: "google-forms",
    importFormat: "csv-mcq",
    exportFormat: "csv-mcq",
    notes: "Google Forms automation often starts with CSV/Sheet transforms.",
  },
  {
    connectorId: "microsoft-forms",
    importFormat: "csv-mcq",
    exportFormat: "csv-mcq",
    notes: "Microsoft Forms integrations rely on tabular transformations.",
  },
];

export function getConnectorPreset(connectorId: LmsConnectorId): ConnectorPreset {
  return CONNECTOR_PRESETS.find((preset) => preset.connectorId === connectorId) || {
    connectorId,
    importFormat: "auto",
    exportFormat: "generic-json",
    notes: "No specialized preset available; using generic defaults.",
  };
}

export function runConnectorDryRun(
  bank: QuizBank,
  connectorId: LmsConnectorId,
  options?: { authConnected?: boolean },
): ConnectorDryRunResult {
  const connector = LMS_CONNECTORS.find((item) => item.id === connectorId) || LMS_CONNECTORS[0];
  const payload = serializeQuizBank(bank, connector.preferredFormat);
  const authConnected = Boolean(options?.authConnected);

  const warnings: string[] = [];
  const hasShort = bank.questions.some((question) => question.kind === "short");
  const hasMulti = bank.questions.some((question) => question.kind === "multi");

  if ((connector.id === "kahoot" || connector.id === "quizizz") && hasShort) {
    warnings.push("Short-answer items may need manual conversion to MCQ for this connector.");
  }

  if ((connector.id === "quizlet" || connector.id === "anki") && hasMulti) {
    warnings.push("Multi-select items are flattened in flashcard formats; review exported card structure.");
  }

  if (connector.preferredFormat === "qti21-package" && bank.questions.length > 150) {
    warnings.push("Large package detected; consider chunking into multiple assessment banks.");
  }

  if (!authConnected) {
    warnings.push("Mock auth is disconnected; only offline payload validation is available.");
  }

  return {
    connectorId: connector.id,
    connectorName: connector.name,
    formatUsed: connector.preferredFormat,
    endpointHint: connector.endpointHint,
    payloadBytes: new TextEncoder().encode(payload).length,
    payloadPreview: payload,
    itemCount: bank.questions.length,
    status: warnings.length ? "warning" : "ready",
    warnings,
    recommendation: warnings.length
      ? "Review warnings before enabling real API push."
      : "Payload is connector-ready. Next step is wiring auth and endpoint secrets.",
    requestPreview: {
      method: "POST",
      endpointHint: connector.endpointHint,
      authMode: authConnected ? "mock-token" : "none",
    },
  };
}
