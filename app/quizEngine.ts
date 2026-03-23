export type QuestionKind = "single" | "multi" | "boolean" | "short";

export type QuizQuestion = {
  id: string;
  prompt: string;
  kind: QuestionKind;
  choices: string[];
  correctAnswers: string[];
  difficulty?: number;
  explanation?: string;
  tags?: string[];
};

export type QuizBank = {
  id: string;
  title: string;
  source: string;
  subject?: string;
  difficulty?: string;
  compatibility: string[];
  questions: QuizQuestion[];
  updatedAt: number;
};

export type ImportFormat = "auto" | "generic-json" | "gift" | "aiken" | "tsv-flashcards" | "csv-mcq" | "qti21" | "qti21-package";

export type QtiPackageFile = {
  path: string;
  content: string;
  mediaType: string;
};

export type QtiPackage = {
  manifest: string;
  files: QtiPackageFile[];
};

export type QtiPackageValidationReport = {
  valid: boolean;
  fileCount: number;
  itemCount: number;
  errors: string[];
  warnings: string[];
};

export type QuizAttemptScore = {
  correct: number;
  total: number;
  percent: number;
  byQuestion: Array<{ questionId: string; isCorrect: boolean }>;
};

export type ProviderProfile = {
  id: string;
  name: string;
  commonExportFormat: string;
  notes: string;
};

export const PROVIDER_PROFILES: ProviderProfile[] = [
  {
    id: "moodle",
    name: "Moodle",
    commonExportFormat: "GIFT, XML",
    notes: "Strong bank import/export; GIFT offers broad compatibility for text-based migration.",
  },
  {
    id: "canvas",
    name: "Canvas",
    commonExportFormat: "QTI",
    notes: "Best compatibility via QTI packages and CSV transforms.",
  },
  {
    id: "blackboard",
    name: "Blackboard",
    commonExportFormat: "QTI, Pools",
    notes: "Typically mapped through QTI or custom CSV intermediates.",
  },
  {
    id: "kahoot",
    name: "Kahoot",
    commonExportFormat: "Spreadsheet CSV",
    notes: "Question-first CSV model; best for rapid MCQ conversion.",
  },
  {
    id: "quizizz",
    name: "Quizizz",
    commonExportFormat: "Spreadsheet CSV",
    notes: "CSV style with explicit answer key columns.",
  },
  {
    id: "quizlet",
    name: "Quizlet",
    commonExportFormat: "TSV term/definition",
    notes: "Flashcard-oriented import often built from tab-separated pairs.",
  },
  {
    id: "anki",
    name: "Anki",
    commonExportFormat: "CSV/TSV front-back",
    notes: "Card data maps well to short-answer and flashcard quizzes.",
  },
  {
    id: "google-forms",
    name: "Google Forms",
    commonExportFormat: "CSV / Form schema",
    notes: "MCQ import is commonly done via structured sheets/CSV workflows.",
  },
  {
    id: "microsoft-forms",
    name: "Microsoft Forms",
    commonExportFormat: "Excel/CSV",
    notes: "Spreadsheet-compatible model for simple quiz pipelines.",
  },
  {
    id: "schoology",
    name: "Schoology",
    commonExportFormat: "QTI, CSV",
    notes: "Assessment banks integrate with QTI and spreadsheet pathways.",
  },
];

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function sanitizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value).trim()).filter(Boolean);
}

function normalizeQuestion(input: unknown, idx: number): QuizQuestion | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const prompt = String(row.prompt || row.question || "").trim();
  if (!prompt) return null;

  const kindRaw = String(row.kind || row.type || "single").toLowerCase();
  const kind: QuestionKind = ["single", "multi", "boolean", "short"].includes(kindRaw)
    ? (kindRaw as QuestionKind)
    : "single";

  const choices = sanitizeArray(row.choices || row.options);
  const correctAnswers = sanitizeArray(row.correctAnswers || row.answers || row.correct || row.answer);
  const difficulty = Math.min(5, Math.max(1, Number(row.difficulty || 3) || 3));

  const normalizedChoices = kind === "boolean" && choices.length === 0 ? ["True", "False"] : choices;

  return {
    id: String(row.id || `q-${idx + 1}`),
    prompt,
    kind,
    choices: normalizedChoices,
    correctAnswers,
    difficulty,
    explanation: row.explanation ? String(row.explanation) : undefined,
    tags: sanitizeArray(row.tags),
  };
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function encodeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeBank(input: unknown, titleHint = "Imported Quiz"): QuizBank | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const rawQuestions = Array.isArray(row.questions) ? row.questions : [];
  const questions = rawQuestions
    .map((question, idx) => normalizeQuestion(question, idx))
    .filter((question): question is QuizQuestion => Boolean(question));

  if (!questions.length) return null;

  return {
    id: String(row.id || uid()),
    title: String(row.title || titleHint),
    source: String(row.source || "imported"),
    subject: row.subject ? String(row.subject) : undefined,
    difficulty: row.difficulty ? String(row.difficulty) : undefined,
    compatibility: sanitizeArray(row.compatibility),
    questions,
    updatedAt: Number(row.updatedAt || Date.now()),
  };
}

function parseGenericJson(raw: string, titleHint?: string): QuizBank[] {
  const parsed = JSON.parse(raw) as unknown;

  if (Array.isArray(parsed)) {
    return parsed
      .map((bank) => normalizeBank(bank, titleHint))
      .filter((bank): bank is QuizBank => Boolean(bank));
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.banks)) {
      return obj.banks
        .map((bank) => normalizeBank(bank, titleHint))
        .filter((bank): bank is QuizBank => Boolean(bank));
    }

    const bank = normalizeBank(obj, titleHint);
    return bank ? [bank] : [];
  }

  return [];
}

function parseGift(raw: string, titleHint = "GIFT Import"): QuizBank[] {
  const blocks = raw
    .split(/\n\s*\n/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const questions: QuizQuestion[] = [];

  for (const [idx, block] of blocks.entries()) {
    const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;

    const combined = lines.join(" ");
    const open = combined.indexOf("{");
    const close = combined.lastIndexOf("}");
    if (open < 1 || close <= open) continue;

    const prompt = combined.slice(0, open).replace(/^::.*?::\s*/, "").trim();
    const answerBody = combined.slice(open + 1, close).trim();

    if (!prompt || !answerBody) continue;

    if (/^(T|TRUE|F|FALSE)$/i.test(answerBody.replace(/[=#~]/g, "").trim())) {
      const normalized = answerBody.replace(/[=#~]/g, "").trim().toLowerCase();
      questions.push({
        id: `gift-${idx + 1}`,
        prompt,
        kind: "boolean",
        choices: ["True", "False"],
        correctAnswers: [normalized.startsWith("t") ? "True" : "False"],
      });
      continue;
    }

    const tokens = answerBody.split(/(?=[~=])/g).map((token) => token.trim()).filter(Boolean);
    const choices: string[] = [];
    const correct: string[] = [];

    for (const token of tokens) {
      const marker = token[0];
      const value = token.slice(1).split("#")[0].trim();
      if (!value) continue;
      choices.push(value);
      if (marker === "=") correct.push(value);
    }

    const kind: QuestionKind = correct.length > 1 ? "multi" : "single";
    questions.push({ id: `gift-${idx + 1}`, prompt, kind, choices, correctAnswers: correct });
  }

  if (!questions.length) return [];

  return [
    {
      id: uid(),
      title: titleHint,
      source: "gift",
      compatibility: ["moodle", "canvas", "blackboard", "schoology"],
      questions,
      updatedAt: Date.now(),
    },
  ];
}

function parseAiken(raw: string, titleHint = "AIKEN Import"): QuizBank[] {
  const lines = raw.split(/\n/);
  const questions: QuizQuestion[] = [];

  let idx = 0;
  while (idx < lines.length) {
    const prompt = lines[idx]?.trim();
    if (!prompt) {
      idx += 1;
      continue;
    }

    idx += 1;
    const choices: string[] = [];
    let answerKey = "";

    while (idx < lines.length) {
      const line = lines[idx].trim();
      if (!line) {
        idx += 1;
        if (answerKey) break;
        continue;
      }

      const answerMatch = line.match(/^ANSWER\s*:\s*([A-Z])$/i);
      if (answerMatch) {
        answerKey = answerMatch[1].toUpperCase();
        idx += 1;
        continue;
      }

      const choiceMatch = line.match(/^([A-Z])[).\-:]\s*(.+)$/);
      if (choiceMatch) {
        choices.push(choiceMatch[2].trim());
        idx += 1;
        continue;
      }

      break;
    }

    if (choices.length && answerKey) {
      const answerIndex = answerKey.charCodeAt(0) - 65;
      const answer = choices[answerIndex];
      questions.push({
        id: `aiken-${questions.length + 1}`,
        prompt,
        kind: "single",
        choices,
        correctAnswers: answer ? [answer] : [],
      });
    }
  }

  if (!questions.length) return [];

  return [
    {
      id: uid(),
      title: titleHint,
      source: "aiken",
      compatibility: ["moodle", "canvas", "blackboard", "schoology"],
      questions,
      updatedAt: Date.now(),
    },
  ];
}

function parseDelimited(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur.trim());
  return out;
}

function parseCsvMcq(raw: string, titleHint = "CSV MCQ Import"): QuizBank[] {
  const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseDelimited(lines[0]).map((h) => h.toLowerCase());
  const qIdx = header.findIndex((h) => h.includes("question") || h.includes("prompt"));
  const correctIdx = header.findIndex((h) => h.includes("correct") || h === "answer");
  const optionIndexes = header
    .map((h, i) => ({ h, i }))
    .filter((row) => row.h.includes("option") || row.h.startsWith("choice") || row.h.match(/^a$|^b$|^c$|^d$/))
    .map((row) => row.i);

  if (qIdx < 0 || correctIdx < 0 || !optionIndexes.length) return [];

  const questions: QuizQuestion[] = [];

  for (const line of lines.slice(1)) {
    const cols = parseDelimited(line);
    const prompt = cols[qIdx]?.trim();
    if (!prompt) continue;

    const choices = optionIndexes.map((i) => cols[i]?.trim()).filter(Boolean);
    const correctRaw = cols[correctIdx]?.trim();
    if (!choices.length || !correctRaw) continue;

    const resolved = correctRaw
      .split(/[|,]/)
      .map((token) => token.trim())
      .map((token) => {
        if (/^[A-Z]$/i.test(token)) {
          const index = token.toUpperCase().charCodeAt(0) - 65;
          return choices[index] || "";
        }
        const numeric = Number(token);
        if (Number.isInteger(numeric) && numeric >= 1 && numeric <= choices.length) {
          return choices[numeric - 1] || "";
        }
        return token;
      })
      .filter(Boolean);

    questions.push({
      id: `csv-${questions.length + 1}`,
      prompt,
      kind: resolved.length > 1 ? "multi" : "single",
      choices,
      correctAnswers: resolved,
    });
  }

  if (!questions.length) return [];

  return [
    {
      id: uid(),
      title: titleHint,
      source: "csv-mcq",
      compatibility: ["kahoot", "quizizz", "google-forms", "microsoft-forms"],
      questions,
      updatedAt: Date.now(),
    },
  ];
}

function parseTsvFlashcards(raw: string, titleHint = "Flashcards Import"): QuizBank[] {
  const lines = raw.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const questions: QuizQuestion[] = [];

  for (const [idx, line] of lines.entries()) {
    const [front, back] = line.split("\t").map((value) => value?.trim());
    if (!front || !back) continue;

    questions.push({
      id: `card-${idx + 1}`,
      prompt: front,
      kind: "short",
      choices: [],
      correctAnswers: [back],
    });
  }

  if (!questions.length) return [];

  return [
    {
      id: uid(),
      title: titleHint,
      source: "tsv-flashcards",
      compatibility: ["quizlet", "anki"],
      questions,
      updatedAt: Date.now(),
    },
  ];
}

function parseQti21(raw: string, titleHint = "QTI 2.1 Import"): QuizBank[] {
  const itemBlocks = [...raw.matchAll(/<assessmentItem\b[\s\S]*?<\/assessmentItem>/gi)].map((match) => match[0]);
  if (!itemBlocks.length) return [];

  const questions: QuizQuestion[] = [];

  for (const [idx, block] of itemBlocks.entries()) {
    const idMatch = block.match(/identifier="([^"]+)"/i);
    const titleMatch = block.match(/title="([^"]+)"/i);

    const promptMatch = block.match(/<prompt[^>]*>([\s\S]*?)<\/prompt>/i) || block.match(/<mattext[^>]*>([\s\S]*?)<\/mattext>/i);
    const prompt = decodeXml((promptMatch?.[1] || titleMatch?.[1] || `Question ${idx + 1}`).replace(/<[^>]+>/g, " "));

    const labels = [...block.matchAll(/<simpleChoice[^>]*identifier="([^"]+)"[^>]*>([\s\S]*?)<\/simpleChoice>/gi)];
    const mappings = labels.map((label) => ({ id: label[1], text: decodeXml(label[2].replace(/<[^>]+>/g, " ")) }));
    const choices = mappings.map((row) => row.text).filter(Boolean);

    const answerRefs = [...block.matchAll(/<value>([^<]+)<\/value>/gi)].map((row) => row[1].trim());
    const correctAnswers = answerRefs
      .map((ref) => mappings.find((row) => row.id === ref)?.text || ref)
      .filter(Boolean);

    let kind: QuestionKind = "single";
    if (!choices.length) kind = "short";
    if (correctAnswers.length > 1) kind = "multi";
    if (choices.length === 2 && choices.includes("True") && choices.includes("False")) kind = "boolean";

    questions.push({
      id: idMatch?.[1] || `qti-${idx + 1}`,
      prompt,
      kind,
      choices,
      correctAnswers,
      difficulty: 3,
    });
  }

  if (!questions.length) return [];

  return [
    {
      id: uid(),
      title: titleHint,
      source: "qti21",
      compatibility: ["canvas", "blackboard", "moodle", "schoology"],
      questions,
      updatedAt: Date.now(),
    },
  ];
}

function parseBundleFiles(raw: string): Array<{ path: string; content: string }> {
  const lines = raw.split(/\n/);
  const files: Array<{ path: string; content: string }> = [];
  let currentPath = "";
  let current: string[] = [];

  const flush = () => {
    if (!currentPath) return;
    files.push({ path: currentPath, content: current.join("\n").trim() });
    currentPath = "";
    current = [];
  };

  for (const line of lines) {
    const marker = line.match(/^===FILE:(.+)===$/);
    if (marker) {
      flush();
      currentPath = marker[1].trim();
      continue;
    }
    current.push(line);
  }
  flush();
  return files;
}

export function validateQti21PackageBundle(raw: string): QtiPackageValidationReport {
  const files = parseBundleFiles(raw);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!files.length) {
    return {
      valid: false,
      fileCount: 0,
      itemCount: 0,
      errors: ["No package files were found. Expected ===FILE:path=== bundle markers."],
      warnings,
    };
  }

  const normalized = files.map((file) => ({ ...file, path: file.path.trim() }));
  const pathCounts = new Map<string, number>();
  for (const file of normalized) {
    pathCounts.set(file.path, (pathCounts.get(file.path) || 0) + 1);
  }

  const duplicates = [...pathCounts.entries()].filter((entry) => entry[1] > 1).map((entry) => entry[0]);
  if (duplicates.length) {
    errors.push(`Duplicate package file paths detected: ${duplicates.join(", ")}.`);
  }

  const manifest = normalized.find((file) => file.path === "imsmanifest.xml");
  if (!manifest) {
    errors.push("Missing imsmanifest.xml in package bundle.");
  }

  const itemFiles = normalized.filter((file) => file.path.endsWith(".xml") && file.path !== "imsmanifest.xml");
  if (!itemFiles.length) {
    errors.push("No QTI item XML files found in package.");
  }

  if (manifest) {
    const hrefs = [...manifest.content.matchAll(/<file\s+href="([^"]+)"\s*\/?\s*>/gi)].map((match) => match[1].trim());
    for (const href of hrefs) {
      if (!normalized.some((file) => file.path === href)) {
        errors.push(`Manifest references missing file: ${href}.`);
      }
    }
    if (!hrefs.length) {
      warnings.push("Manifest has no explicit <file href=...> entries.");
    }
  }

  const mergedItems = itemFiles.map((file) => file.content).join("\n\n");
  const parsedBanks = mergedItems ? parseQti21(mergedItems, "Validated Package") : [];
  const itemCount = parsedBanks.reduce((sum, bank) => sum + bank.questions.length, 0);

  if (itemFiles.length > 0 && itemCount === 0) {
    errors.push("Item XML files were found but no valid QTI assessment items could be parsed.");
  }

  if (itemCount > 250) {
    warnings.push("Large package detected. Consider splitting into smaller banks for LMS import reliability.");
  }

  return {
    valid: errors.length === 0,
    fileCount: normalized.length,
    itemCount,
    errors,
    warnings,
  };
}

function parseQti21Package(raw: string, titleHint = "QTI 2.1 Package Import"): QuizBank[] {
  const files = parseBundleFiles(raw);
  if (!files.length) return [];

  const itemFiles = files.filter((file) => file.path.endsWith(".xml") && !file.path.endsWith("imsmanifest.xml"));
  if (!itemFiles.length) return [];

  const merged = itemFiles.map((file) => file.content).join("\n\n");
  const banks = parseQti21(merged, titleHint);
  return banks.map((bank) => ({ ...bank, source: "qti21-package" }));
}

function renderQtiItem(question: QuizQuestion, idx: number): string {
  const responseId = `RESPONSE_${idx + 1}`;
  const prompt = encodeXml(question.prompt);
  const choices = question.choices.length > 0
    ? question.choices
        .map((choice, choiceIdx) => `      <simpleChoice identifier="CHOICE_${choiceIdx + 1}">${encodeXml(choice)}</simpleChoice>`)
        .join("\n")
    : "";

  const answerValues = question.correctAnswers.length > 0
    ? question.correctAnswers
        .map((answer) => {
          const matchIdx = question.choices.findIndex((choice) => choice === answer);
          return `<value>${matchIdx >= 0 ? `CHOICE_${matchIdx + 1}` : encodeXml(answer)}</value>`;
        })
        .join("")
    : "";

  if (question.choices.length === 0) {
    return [
      `<assessmentItem identifier="${encodeXml(question.id)}" title="${encodeXml(question.prompt.slice(0, 64) || `Item ${idx + 1}`)}" adaptive="false" timeDependent="false" xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1">`,
      `  <responseDeclaration identifier="${responseId}" cardinality="single" baseType="string">`,
      "    <correctResponse>",
      `      ${answerValues || `<value>${encodeXml(question.correctAnswers[0] || "")}</value>`}`,
      "    </correctResponse>",
      "  </responseDeclaration>",
      "  <itemBody>",
      `    <extendedTextInteraction responseIdentifier="${responseId}" expectedLength="120"><prompt>${prompt}</prompt></extendedTextInteraction>`,
      "  </itemBody>",
      "</assessmentItem>",
    ].join("\n");
  }

  return [
    `<assessmentItem identifier="${encodeXml(question.id)}" title="${encodeXml(question.prompt.slice(0, 64) || `Item ${idx + 1}`)}" adaptive="false" timeDependent="false" xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1">`,
    `  <responseDeclaration identifier="${responseId}" cardinality="${question.kind === "multi" ? "multiple" : "single"}" baseType="identifier">`,
    "    <correctResponse>",
    `      ${answerValues}`,
    "    </correctResponse>",
    "  </responseDeclaration>",
    "  <itemBody>",
    `    <choiceInteraction responseIdentifier="${responseId}" maxChoices="${question.kind === "multi" ? Math.max(2, question.correctAnswers.length) : 1}">`,
    `      <prompt>${prompt}</prompt>`,
    choices,
    "    </choiceInteraction>",
    "  </itemBody>",
    "</assessmentItem>",
  ].join("\n");
}

export function buildQtiPackage(bank: QuizBank): QtiPackage {
  const files: QtiPackageFile[] = bank.questions.map((question, idx) => {
    const name = `items/item-${String(idx + 1).padStart(3, "0")}.xml`;
    return {
      path: name,
      content: [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        renderQtiItem(question, idx),
      ].join("\n"),
      mediaType: "application/xml",
    };
  });

  const manifestResources = files
    .map((file, idx) => {
      const identifier = `ITEM_${idx + 1}`;
      return [
        `    <resource identifier="${identifier}" type="imsqti_item_xmlv2p1" href="${file.path}">`,
        `      <file href="${file.path}"/>`,
        "    </resource>",
      ].join("\n");
    })
    .join("\n");

  const manifest = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    `<manifest identifier="MANIFEST_${encodeXml(bank.id)}" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_v2p1">`,
    "  <metadata>",
    "    <schema>QTI Package</schema>",
    "    <schemaversion>2.1</schemaversion>",
    `    <imsqti:qtiMetadata><imsqti:title>${encodeXml(bank.title)}</imsqti:title></imsqti:qtiMetadata>`,
    "  </metadata>",
    "  <resources>",
    manifestResources,
    "  </resources>",
    "</manifest>",
  ].join("\n");

  return { manifest, files };
}

export function serializeQtiPackageAsBundle(pkg: QtiPackage): string {
  const sections = [
    "===FILE:imsmanifest.xml===",
    pkg.manifest,
    ...pkg.files.flatMap((file) => [`===FILE:${file.path}===`, file.content]),
  ];

  return sections.join("\n");
}

function detectFormat(raw: string): ImportFormat {
  const sample = raw.trim();
  if (!sample) return "auto";

  if (sample.includes("===FILE:imsmanifest.xml===") || sample.includes("<manifest") && sample.includes("imsqti_item_xmlv2p1")) return "qti21-package";
  if (sample.startsWith("{") || sample.startsWith("[")) return "generic-json";
  if (sample.includes("<assessmentItem") || sample.includes("imsqti")) return "qti21";
  if (sample.includes("\t")) return "tsv-flashcards";
  if (/ANSWER\s*:/i.test(sample) && /\n[A-D][).\-:]/i.test(sample)) return "aiken";
  if (sample.includes("{") && sample.includes("~") && sample.includes("=")) return "gift";

  const firstLine = sample.split(/\n/)[0].toLowerCase();
  if (firstLine.includes("question") && firstLine.includes("correct")) return "csv-mcq";

  return "auto";
}

export function parseQuizImport(raw: string, format: ImportFormat, titleHint?: string): { banks: QuizBank[]; usedFormat: ImportFormat } {
  const effective = format === "auto" ? detectFormat(raw) : format;

  if (effective === "generic-json") return { banks: parseGenericJson(raw, titleHint), usedFormat: effective };
  if (effective === "gift") return { banks: parseGift(raw, titleHint), usedFormat: effective };
  if (effective === "aiken") return { banks: parseAiken(raw, titleHint), usedFormat: effective };
  if (effective === "csv-mcq") return { banks: parseCsvMcq(raw, titleHint), usedFormat: effective };
  if (effective === "tsv-flashcards") return { banks: parseTsvFlashcards(raw, titleHint), usedFormat: effective };
  if (effective === "qti21") return { banks: parseQti21(raw, titleHint), usedFormat: effective };
  if (effective === "qti21-package") return { banks: parseQti21Package(raw, titleHint), usedFormat: effective };

  return { banks: [], usedFormat: effective };
}

export function serializeQuizBank(bank: QuizBank, format: Exclude<ImportFormat, "auto">): string {
  if (format === "generic-json") {
    return JSON.stringify(bank, null, 2);
  }

  if (format === "gift") {
    return bank.questions
      .map((question) => {
        if (question.kind === "boolean") {
          const answer = question.correctAnswers[0]?.toLowerCase().startsWith("t") ? "TRUE" : "FALSE";
          return `${question.prompt} {${answer}}`;
        }

        if (question.kind === "short") {
          const answer = question.correctAnswers[0] || "";
          return `${question.prompt} {=${answer}}`;
        }

        const body = question.choices
          .map((choice) => `${question.correctAnswers.includes(choice) ? "=" : "~"}${choice}`)
          .join(" ");

        return `${question.prompt} {${body}}`;
      })
      .join("\n\n");
  }

  if (format === "csv-mcq") {
    const header = ["Question", "Option 1", "Option 2", "Option 3", "Option 4", "Correct"];
    const rows = bank.questions.map((question) => {
      const options = [...question.choices, "", "", ""].slice(0, 4);
      const firstAnswer = question.correctAnswers[0] || "";
      const idx = options.findIndex((value) => value === firstAnswer);
      const encodedAnswer = idx >= 0 ? String.fromCharCode(65 + idx) : firstAnswer;
      return [question.prompt, ...options, encodedAnswer];
    });

    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
  }

  if (format === "tsv-flashcards") {
    return bank.questions
      .map((question) => `${question.prompt}\t${question.correctAnswers[0] || ""}`)
      .join("\n");
  }

  if (format === "aiken") {
    return bank.questions
      .filter((question) => question.choices.length > 0)
      .map((question) => {
        const answer = question.correctAnswers[0] || "";
        const answerIndex = Math.max(0, question.choices.findIndex((choice) => choice === answer));
        const answerLetter = String.fromCharCode(65 + answerIndex);
        const options = question.choices.map((choice, idx) => `${String.fromCharCode(65 + idx)}. ${choice}`).join("\n");
        return `${question.prompt}\n${options}\nANSWER: ${answerLetter}`;
      })
      .join("\n\n");
  }

  if (format === "qti21") {
    const items = bank.questions.map((question, idx) => renderQtiItem(question, idx)).join("\n\n");

    return [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      `<!-- QTI 2.1 items exported from Student Productivity Hub: ${encodeXml(bank.title)} -->`,
      `<qtiItemCollection title="${encodeXml(bank.title)}">`,
      items,
      "</qtiItemCollection>",
    ].join("\n");
  }

  if (format === "qti21-package") {
    return serializeQtiPackageAsBundle(buildQtiPackage(bank));
  }

  return JSON.stringify(bank, null, 2);
}

function normalizeInput(value: string): string {
  return value.trim().toLowerCase();
}

function isQuestionCorrect(question: QuizQuestion, answers: string[]): boolean {
  if (!question.correctAnswers.length) return false;

  if (question.kind === "short") {
    const guess = normalizeInput(answers[0] || "");
    return question.correctAnswers.some((correct) => normalizeInput(correct) === guess);
  }

  const normalizedUser = answers.map(normalizeInput).filter(Boolean).sort();
  const normalizedCorrect = question.correctAnswers.map(normalizeInput).sort();

  if (normalizedUser.length !== normalizedCorrect.length) return false;

  return normalizedCorrect.every((value, idx) => value === normalizedUser[idx]);
}

export function checkQuestionCorrect(question: QuizQuestion, answers: string[]): boolean {
  return isQuestionCorrect(question, answers);
}

export function scoreQuizAttempt(bank: QuizBank, answersByQuestionId: Record<string, string[]>): QuizAttemptScore {
  const byQuestion = bank.questions.map((question) => {
    const answers = answersByQuestionId[question.id] || [];
    const isCorrect = isQuestionCorrect(question, answers);
    return { questionId: question.id, isCorrect };
  });

  const correct = byQuestion.filter((row) => row.isCorrect).length;
  const total = bank.questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;

  return { correct, total, percent, byQuestion };
}

export function buildProviderCompatibility(selected: string[]): string[] {
  const valid = new Set(PROVIDER_PROFILES.map((provider) => provider.id));
  return selected.filter((id) => valid.has(id));
}
