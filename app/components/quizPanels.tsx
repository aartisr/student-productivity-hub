import type { ProviderProfile } from "../quizEngine";
import type { ImportFormat, QuestionKind, QuizAttemptScore, QuizQuestion } from "../quizEngine";
import type { Lesson, QuizAttempt, ReviewState } from "../domain";
import type { QuizBank } from "../quizEngine";
import type { ConnectorDryRunResult, LmsConnector, LmsConnectorId } from "../lmsConnectors";
import type { BlueprintConstraints, ConnectorRequestLog } from "../domain";

type QuizOverviewPanelProps = {
  quizBankCount: number;
  attempts: number;
  bestScore: number;
  averageScore: number;
  reviewsDueSoon: number;
};

export function QuizOverviewPanel(props: QuizOverviewPanelProps) {
  const { quizBankCount, attempts, bestScore, averageScore, reviewsDueSoon } = props;

  return (
    <article className="panel">
      <h2>Quiz Lab: Generic, Extensible Engine</h2>
      <p className="compact-line">
        Build once, adapt everywhere. This module supports normalized quiz banks with import/export adapters for common education quiz formats.
      </p>
      <div className="analytics">
        <div className="metric">
          <span>Quiz banks</span>
          <strong>{quizBankCount}</strong>
        </div>
        <div className="metric">
          <span>Attempts</span>
          <strong>{attempts}</strong>
        </div>
        <div className="metric">
          <span>Best score</span>
          <strong>{bestScore}%</strong>
        </div>
        <div className="metric">
          <span>Average score</span>
          <strong>{averageScore}%</strong>
        </div>
        <div className="metric">
          <span>Reviews due soon</span>
          <strong>{reviewsDueSoon}</strong>
        </div>
      </div>
    </article>
  );
}

type CompatibilityTargetsPanelProps = {
  providerProfiles: ProviderProfile[];
  selectedTargets: string[];
  onToggleTarget: (providerId: string) => void;
};

export function CompatibilityTargetsPanel(props: CompatibilityTargetsPanelProps) {
  const { providerProfiles, selectedTargets, onToggleTarget } = props;

  return (
    <article className="panel">
      <h2>Compatibility Targets (Top Platforms)</h2>
      <div className="provider-grid">
        {providerProfiles.map((provider) => (
          <label key={provider.id} className="provider-item">
            <input
              type="checkbox"
              checked={selectedTargets.includes(provider.id)}
              onChange={() => onToggleTarget(provider.id)}
            />
            <span>
              <strong>{provider.name}</strong>
              <small>{provider.commonExportFormat}</small>
            </span>
          </label>
        ))}
      </div>
    </article>
  );
}

type QuestionBankBuilderPanelProps = {
  quizTitle: string;
  quizSubject: string;
  quizDifficulty: string;
  quizPrompt: string;
  quizKind: QuestionKind;
  quizQuestionDifficulty: number;
  quizChoicesText: string;
  quizCorrectText: string;
  quizExplanation: string;
  quizDraftQuestions: QuizQuestion[];
  setQuizTitle: (value: string) => void;
  setQuizSubject: (value: string) => void;
  setQuizDifficulty: (value: string) => void;
  setQuizPrompt: (value: string) => void;
  setQuizKind: (value: QuestionKind) => void;
  setQuizQuestionDifficulty: (value: number) => void;
  setQuizChoicesText: (value: string) => void;
  setQuizCorrectText: (value: string) => void;
  setQuizExplanation: (value: string) => void;
  onAddDraftQuestion: () => void;
  onSaveDraftQuizBank: () => void;
};

export function QuestionBankBuilderPanel(props: QuestionBankBuilderPanelProps) {
  const {
    quizTitle,
    quizSubject,
    quizDifficulty,
    quizPrompt,
    quizKind,
    quizQuestionDifficulty,
    quizChoicesText,
    quizCorrectText,
    quizExplanation,
    quizDraftQuestions,
    setQuizTitle,
    setQuizSubject,
    setQuizDifficulty,
    setQuizPrompt,
    setQuizKind,
    setQuizQuestionDifficulty,
    setQuizChoicesText,
    setQuizCorrectText,
    setQuizExplanation,
    onAddDraftQuestion,
    onSaveDraftQuizBank,
  } = props;

  return (
    <article className="panel">
      <h2>Question Bank Builder</h2>
      <div className="form-row">
        <label>Bank title</label>
        <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Biology Midterm Readiness" />
      </div>
      <div className="form-row">
        <label>Subject and difficulty</label>
        <div className="btn-row">
          <input className="inline-input" value={quizSubject} onChange={(e) => setQuizSubject(e.target.value)} placeholder="Subject" />
          <input className="inline-input" value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)} placeholder="easy / medium / hard / mixed" />
        </div>
      </div>
      <div className="form-row">
        <label>Question prompt</label>
        <textarea value={quizPrompt} onChange={(e) => setQuizPrompt(e.target.value)} placeholder="What is the powerhouse of the cell?" />
      </div>
      <div className="form-row">
        <label>Question type</label>
        <select title="Quiz question type" value={quizKind} onChange={(e) => setQuizKind(e.target.value as QuestionKind)}>
          <option value="single">Single choice</option>
          <option value="multi">Multi-select</option>
          <option value="boolean">True/False</option>
          <option value="short">Short answer</option>
        </select>
      </div>
      <div className="form-row">
        <label>Question difficulty (1 easy - 5 hard)</label>
        <input
          title="Question difficulty"
          type="range"
          min={1}
          max={5}
          value={quizQuestionDifficulty}
          onChange={(e) => setQuizQuestionDifficulty(Number(e.target.value))}
        />
        <span>Difficulty: {quizQuestionDifficulty}/5</span>
      </div>
      {quizKind !== "boolean" && quizKind !== "short" ? (
        <div className="form-row">
          <label>Choices (one per line or comma-separated)</label>
          <textarea value={quizChoicesText} onChange={(e) => setQuizChoicesText(e.target.value)} placeholder={"Adenosine triphosphate\nMitochondria\nNucleus"} />
        </div>
      ) : null}
      <div className="form-row">
        <label>Correct answer(s) as text or index/letter (example: B or 2,4)</label>
        <input value={quizCorrectText} onChange={(e) => setQuizCorrectText(e.target.value)} placeholder="B" />
      </div>
      <div className="form-row">
        <label>Explanation (optional)</label>
        <textarea value={quizExplanation} onChange={(e) => setQuizExplanation(e.target.value)} placeholder="Why this answer is correct" />
      </div>
      <div className="btn-row mt-8">
        <button className="primary" onClick={onAddDraftQuestion}>Add question to draft</button>
        <button className="secondary" onClick={onSaveDraftQuizBank}>Save bank</button>
      </div>
      <p className="compact-line">Draft question count: {quizDraftQuestions.length}</p>
    </article>
  );
}

type QuizAdapterPanelProps = {
  quizImportFormat: ImportFormat;
  quizImportText: string;
  quizExportFormat: Exclude<ImportFormat, "auto">;
  quizExportText: string;
  setQuizImportFormat: (value: ImportFormat) => void;
  setQuizImportText: (value: string) => void;
  setQuizExportFormat: (value: Exclude<ImportFormat, "auto">) => void;
  setQuizExportText: (value: string) => void;
  onImportQuizBanks: () => void;
  onExportSelectedQuiz: () => void;
};

export function QuizAdapterPanel(props: QuizAdapterPanelProps) {
  const {
    quizImportFormat,
    quizImportText,
    quizExportFormat,
    quizExportText,
    setQuizImportFormat,
    setQuizImportText,
    setQuizExportFormat,
    setQuizExportText,
    onImportQuizBanks,
    onExportSelectedQuiz,
  } = props;

  return (
    <article className="panel">
      <h2>Import, Export, and Adapter Layer</h2>
      <div className="form-row">
        <label>Import format</label>
        <select title="Quiz import format" value={quizImportFormat} onChange={(e) => setQuizImportFormat(e.target.value as ImportFormat)}>
          <option value="auto">Auto detect</option>
          <option value="generic-json">Generic JSON</option>
          <option value="gift">Moodle GIFT</option>
          <option value="aiken">AIKEN</option>
          <option value="csv-mcq">CSV MCQ</option>
          <option value="tsv-flashcards">TSV flashcards</option>
          <option value="qti21">QTI 2.1 XML</option>
          <option value="qti21-package">QTI 2.1 Package Bundle</option>
        </select>
      </div>
      <div className="form-row">
        <label>Import payload</label>
        <textarea
          value={quizImportText}
          onChange={(e) => setQuizImportText(e.target.value)}
          placeholder="Paste JSON, GIFT, AIKEN, CSV, or TSV quiz content"
        />
      </div>
      <div className="btn-row mt-8">
        <button className="primary" onClick={onImportQuizBanks}>Import to bank</button>
      </div>

      <div className="form-row mt-8">
        <label>Export selected bank as</label>
        <select title="Quiz export format" value={quizExportFormat} onChange={(e) => setQuizExportFormat(e.target.value as Exclude<ImportFormat, "auto">)}>
          <option value="generic-json">Generic JSON</option>
          <option value="gift">Moodle GIFT</option>
          <option value="aiken">AIKEN</option>
          <option value="csv-mcq">CSV MCQ</option>
          <option value="tsv-flashcards">TSV flashcards</option>
          <option value="qti21">QTI 2.1 XML</option>
          <option value="qti21-package">QTI 2.1 Package Bundle</option>
        </select>
      </div>
      <div className="btn-row">
        <button className="secondary" onClick={onExportSelectedQuiz}>Export selected bank</button>
      </div>
      <div className="form-row mt-8">
        <label>Export payload</label>
        <textarea value={quizExportText} onChange={(e) => setQuizExportText(e.target.value)} placeholder="Export appears here" />
      </div>
    </article>
  );
}

type LessonStudioPanelProps = {
  lessonDraftId: string;
  lessonTitle: string;
  lessonTopic: string;
  lessonContent: string;
  lessonEstimatedMinutes: number;
  lessonTagsText: string;
  lessonLinkedQuizIdsText: string;
  lessonStatus: string;
  lessons: Lesson[];
  setLessonTitle: (value: string) => void;
  setLessonTopic: (value: string) => void;
  setLessonContent: (value: string) => void;
  setLessonEstimatedMinutes: (value: number) => void;
  setLessonTagsText: (value: string) => void;
  setLessonLinkedQuizIdsText: (value: string) => void;
  onSaveLesson: () => void;
  onResetLessonForm: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
};

export function LessonStudioPanel(props: LessonStudioPanelProps) {
  const {
    lessonDraftId,
    lessonTitle,
    lessonTopic,
    lessonContent,
    lessonEstimatedMinutes,
    lessonTagsText,
    lessonLinkedQuizIdsText,
    lessonStatus,
    lessons,
    setLessonTitle,
    setLessonTopic,
    setLessonContent,
    setLessonEstimatedMinutes,
    setLessonTagsText,
    setLessonLinkedQuizIdsText,
    onSaveLesson,
    onResetLessonForm,
    onEditLesson,
    onDeleteLesson,
  } = props;

  return (
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
        <button className="primary" onClick={onSaveLesson}>{lessonDraftId ? "Update lesson" : "Save lesson"}</button>
        <button className="ghost" onClick={onResetLessonForm}>Reset form</button>
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
              <button className="secondary" onClick={() => onEditLesson(lesson.id)}>Edit</button>
              <button className="ghost" onClick={() => onDeleteLesson(lesson.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

type ShareKind = "lesson" | "quiz" | "bundle";

type ShareExchangePanelProps = {
  shareKind: ShareKind;
  shareLessonId: string;
  shareQuizId: string;
  sharePayload: string;
  shareStatus: string;
  lessons: Lesson[];
  quizBanks: QuizBank[];
  setShareKind: (value: ShareKind) => void;
  setShareLessonId: (value: string) => void;
  setShareQuizId: (value: string) => void;
  setSharePayload: (value: string) => void;
  onGenerateSharePack: () => void;
  onImportSharePack: () => void;
};

export function ShareExchangePanel(props: ShareExchangePanelProps) {
  const {
    shareKind,
    shareLessonId,
    shareQuizId,
    sharePayload,
    shareStatus,
    lessons,
    quizBanks,
    setShareKind,
    setShareLessonId,
    setShareQuizId,
    setSharePayload,
    onGenerateSharePack,
    onImportSharePack,
  } = props;

  return (
    <article className="panel">
      <h2>Share Exchange</h2>
      <p className="compact-line">Share your custom lessons and quizzes with other users via portable JSON packs.</p>
      <div className="form-row">
        <label>Share type</label>
        <select title="Share pack type" value={shareKind} onChange={(e) => setShareKind(e.target.value as ShareKind)}>
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
        <button className="primary" onClick={onGenerateSharePack}>Generate share pack</button>
        <button className="secondary" onClick={onImportSharePack}>Import share pack</button>
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
  );
}

type QuizBanksPanelProps = {
  quizBanks: QuizBank[];
  onSelectQuizBank: (quizId: string) => void;
  onStartQuizBank: (quizId: string) => void;
  onDeleteQuizBank: (quizId: string) => void;
};

export function QuizBanksPanel(props: QuizBanksPanelProps) {
  const { quizBanks, onSelectQuizBank, onStartQuizBank, onDeleteQuizBank } = props;

  return (
    <article className="panel">
      <h2>Quiz Banks</h2>
      <ul className="list">
        {quizBanks.map((bank) => (
          <li key={bank.id}>
            <strong>{bank.title}</strong>
            <div className="compact-line">{bank.subject || "General"} · {bank.questions.length} question(s) · source: {bank.source}</div>
            <div className="compact-line">Targets: {bank.compatibility.length ? bank.compatibility.join(", ") : "generic"}</div>
            <div className="compact-line">Avg difficulty: {Math.round((bank.questions.reduce((sum, question) => sum + (question.difficulty || 3), 0) / Math.max(1, bank.questions.length)) * 10) / 10}</div>
            <div className="btn-row mt-6">
              <button className="secondary" onClick={() => onSelectQuizBank(bank.id)}>Select</button>
              <button className="primary" onClick={() => onStartQuizBank(bank.id)}>Start</button>
              <button className="ghost" onClick={() => onDeleteQuizBank(bank.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

type AssessmentRuntimePanelProps = {
  activeQuiz: QuizBank | null;
  activeQuestion: QuizQuestion | null;
  activeQuestionIndex: number;
  activeAnswers: Record<string, string[]>;
  quizAdaptiveMode: boolean;
  quizSkillBand: number;
  activeScore: QuizAttemptScore | null;
  quizAttempts: QuizAttempt[];
  upcomingReviews: ReviewState[];
  quizStatus: string;
  selectedQuizTitle: string;
  setSingleAnswer: (questionId: string, answer: string) => void;
  toggleMultiAnswer: (questionId: string, answer: string) => void;
  setShortAnswer: (questionId: string, answer: string) => void;
  onToggleAdaptive: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onAdaptiveNext: () => void;
  onSubmitQuiz: () => void;
};

export function AssessmentRuntimePanel(props: AssessmentRuntimePanelProps) {
  const {
    activeQuiz,
    activeQuestion,
    activeQuestionIndex,
    activeAnswers,
    quizAdaptiveMode,
    quizSkillBand,
    activeScore,
    quizAttempts,
    upcomingReviews,
    quizStatus,
    selectedQuizTitle,
    setSingleAnswer,
    toggleMultiAnswer,
    setShortAnswer,
    onToggleAdaptive,
    onPrevQuestion,
    onNextQuestion,
    onAdaptiveNext,
    onSubmitQuiz,
  } = props;

  return (
    <article className="panel">
      <h2>Assessment Runtime</h2>
      {!activeQuiz ? (
        <p className="compact-line">Select and start a quiz bank to launch the adaptive runtime.</p>
      ) : (
        <>
          <p className="status">{activeQuiz.title} · Question {activeQuestionIndex + 1} / {activeQuiz.questions.length}</p>
          <p className="compact-line">Adaptive mode: {quizAdaptiveMode ? "on" : "off"} · Skill band: {quizSkillBand}/5</p>
          {activeQuestion ? (
            <div className="quiz-question">
              <p><strong>{activeQuestion.prompt}</strong></p>
              <p className="compact-line">Difficulty: {activeQuestion.difficulty || 3}/5</p>

              {(activeQuestion.kind === "single" || activeQuestion.kind === "boolean") && (
                <div className="quiz-options">
                  {activeQuestion.choices.map((choice) => (
                    <label key={choice} className="quiz-option">
                      <input
                        type="radio"
                        name={activeQuestion.id}
                        checked={(activeAnswers[activeQuestion.id] || [])[0] === choice}
                        onChange={() => setSingleAnswer(activeQuestion.id, choice)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              )}

              {activeQuestion.kind === "multi" && (
                <div className="quiz-options">
                  {activeQuestion.choices.map((choice) => (
                    <label key={choice} className="quiz-option">
                      <input
                        type="checkbox"
                        checked={(activeAnswers[activeQuestion.id] || []).includes(choice)}
                        onChange={() => toggleMultiAnswer(activeQuestion.id, choice)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              )}

              {activeQuestion.kind === "short" && (
                <div className="form-row">
                  <label>Short answer</label>
                  <input
                    value={(activeAnswers[activeQuestion.id] || [""])[0] || ""}
                    onChange={(e) => setShortAnswer(activeQuestion.id, e.target.value)}
                    placeholder="Type your answer"
                  />
                </div>
              )}

              <div className="btn-row mt-8">
                <button className="ghost" onClick={onToggleAdaptive}>
                  {quizAdaptiveMode ? "Disable adaptive" : "Enable adaptive"}
                </button>
                <button className="ghost" disabled={activeQuestionIndex === 0} onClick={onPrevQuestion}>
                  Previous
                </button>
                <button className="secondary" disabled={activeQuestionIndex >= activeQuiz.questions.length - 1} onClick={onNextQuestion}>
                  Next
                </button>
                <button className="secondary" onClick={onAdaptiveNext} disabled={!quizAdaptiveMode}>Adaptive next</button>
                <button className="primary" onClick={onSubmitQuiz}>Submit quiz</button>
              </div>
            </div>
          ) : null}

          {activeScore ? (
            <div className="status mt-8">
              Latest score: {activeScore.correct}/{activeScore.total} ({activeScore.percent}%)
            </div>
          ) : null}
        </>
      )}

      {quizAttempts.length ? (
        <>
          <h3 className="mt-8">Recent Attempts</h3>
          <ul className="list">
            {quizAttempts.slice(0, 6).map((attempt) => (
              <li key={attempt.id}>
                <strong>{attempt.quizTitle}</strong>
                <div className="compact-line">{new Date(attempt.createdAt).toLocaleString()}</div>
                <div className="compact-line">{attempt.correct}/{attempt.total} · {attempt.percent}%</div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {upcomingReviews.length ? (
        <>
          <h3 className="mt-8">Spaced Reviews (Next 7 Days)</h3>
          <ul className="list">
            {upcomingReviews.map((review) => (
              <li key={review.key}>
                <strong>{review.quizId}</strong>
                <div className="compact-line">Question: {review.questionId}</div>
                <div className="compact-line">Due: {new Date(review.dueAt).toLocaleString()} · Interval: {review.intervalDays} day(s)</div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {quizStatus ? <p className="status">{quizStatus}</p> : null}
      {selectedQuizTitle ? <p className="compact-line">Selected bank: {selectedQuizTitle}</p> : null}
    </article>
  );
}

type LmsConnectorPanelProps = {
  canManageConnectors: boolean;
  connectorTarget: LmsConnectorId;
  connectorOptions: LmsConnector[];
  connectorPresetNotes: string;
  connectorAuthConnected: boolean;
  connectorRuns: ConnectorDryRunResult[];
  connectorRequestLogs: ConnectorRequestLog[];
  setConnectorTarget: (value: LmsConnectorId) => void;
  onToggleMockAuth: () => void;
  onApplyPreset: () => void;
  onRunDryRun: () => void;
  onCopyPayload: (log: ConnectorRequestLog) => void | Promise<void>;
  onCopyCurl: (log: ConnectorRequestLog) => void | Promise<void>;
};

export function LmsConnectorPanel(props: LmsConnectorPanelProps) {
  const {
    canManageConnectors,
    connectorTarget,
    connectorOptions,
    connectorPresetNotes,
    connectorAuthConnected,
    connectorRuns,
    connectorRequestLogs,
    setConnectorTarget,
    onToggleMockAuth,
    onApplyPreset,
    onRunDryRun,
    onCopyPayload,
    onCopyCurl,
  } = props;

  return (
    <article className="panel">
      <h2>LMS Connector Stubs (Dry-Run)</h2>
      <p className="compact-line">This simulates LMS push compatibility without credentials or network side-effects.</p>
      <div className="form-row">
        <label>Connector target</label>
        <select title="Connector target" value={connectorTarget} onChange={(e) => setConnectorTarget(e.target.value as LmsConnectorId)} disabled={!canManageConnectors}>
          {connectorOptions.map((connector) => (
            <option key={connector.id} value={connector.id}>{connector.name}</option>
          ))}
        </select>
      </div>
      <div className="connector-auth-row">
        <span>Mock auth: {connectorAuthConnected ? "connected" : "disconnected"}</span>
        <button className="secondary" onClick={onToggleMockAuth} disabled={!canManageConnectors}>
          {connectorAuthConnected ? "Disconnect mock token" : "Connect mock token"}
        </button>
        <button className="ghost" onClick={onApplyPreset} disabled={!canManageConnectors}>Apply preset formats</button>
      </div>
      <p className="compact-line">{connectorPresetNotes}</p>
      {!canManageConnectors ? (
        <p className="warning">Instructor or admin role is required to run connector simulations.</p>
      ) : null}
      <div className="btn-row">
        <button className="primary" onClick={onRunDryRun} disabled={!canManageConnectors}>Run connector dry-run</button>
      </div>

      {connectorRuns.length ? (
        <ul className="list mt-8">
          {connectorRuns.map((run, idx) => (
            <li key={`${run.connectorId}-${idx}-${run.payloadBytes}`}>
              <strong>{run.connectorName}</strong>
              <div className="compact-line">Format: {run.formatUsed} · Items: {run.itemCount} · Payload: {run.payloadBytes} bytes</div>
              <div className="compact-line">Status: {run.status.toUpperCase()} · {run.recommendation}</div>
              {run.warnings.length ? <div className="warning">Warnings: {run.warnings.join(" ")}</div> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="compact-line mt-8">No connector runs yet. Select a bank and run dry-run.</p>
      )}

      {connectorRequestLogs.length ? (
        <>
          <h3 className="mt-8">Mock Request Log</h3>
          <ul className="list connector-log-list">
            {connectorRequestLogs.map((log) => (
              <li key={log.id}>
                <strong>{log.connectorName}</strong>
                <div className="compact-line">{new Date(log.createdAt).toLocaleString()}</div>
                <div className="compact-line">{log.method} · {log.endpointHint}</div>
                <div className="compact-line">Auth: {log.authMode === "mock-token" ? "mock bearer" : "none"} · Payload: {log.payloadBytes} bytes · Items: {log.itemCount}</div>
                <div className="compact-line">Status: {log.status.toUpperCase()}</div>
                <div className="btn-row mt-6">
                  <button className="secondary" onClick={() => onCopyPayload(log)}>Copy payload preview</button>
                  <button className="ghost" onClick={() => onCopyCurl(log)}>Copy as cURL</button>
                </div>
                <details className="connector-payload-preview mt-6">
                  <summary>Payload preview</summary>
                  <pre>{log.payloadPreview}</pre>
                </details>
                {log.warnings.length ? <div className="warning">Warnings: {log.warnings.join(" ")}</div> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

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

type InstructorModePanelProps = {
  canAccessInstructorMode: boolean;
  instructorMode: boolean;
  blueprint: BlueprintConstraints;
  blueprintAudit: BlueprintAudit | null;
  masteryBands: { emerging: number; developing: number; proficient: number; mastery: number };
  itemAnalysis: ItemAnalysisRow[];
  setInstructorMode: (value: boolean) => void;
  setBlueprint: (value: BlueprintConstraints) => void;
};

export function InstructorModePanel(props: InstructorModePanelProps) {
  const {
    canAccessInstructorMode,
    instructorMode,
    blueprint,
    blueprintAudit,
    masteryBands,
    itemAnalysis,
    setInstructorMode,
    setBlueprint,
  } = props;

  return (
    <article className="panel">
      <h2>Instructor Mode</h2>
      {!canAccessInstructorMode ? <p className="warning">Instructor or admin role required.</p> : null}
      <div className="btn-row">
        <button className="secondary" onClick={() => setInstructorMode(!instructorMode)} disabled={!canAccessInstructorMode}>
          {instructorMode ? "Hide instructor panel" : "Show instructor panel"}
        </button>
      </div>

      {instructorMode && canAccessInstructorMode ? (
        <>
          <div className="form-row mt-8">
            <label>Blueprint target question count</label>
            <input
              title="Blueprint target question count"
              type="number"
              min={5}
              max={300}
              value={blueprint.targetQuestions}
              onChange={(e) => setBlueprint({ ...blueprint, targetQuestions: Number(e.target.value) || 20 })}
            />
          </div>
          <div className="form-row">
            <label>Difficulty distribution targets (easy/medium/hard %)</label>
            <div className="btn-row">
              <input
                className="inline-input"
                title="Blueprint easy percent"
                type="number"
                min={0}
                max={100}
                value={blueprint.easyPct}
                onChange={(e) => setBlueprint({ ...blueprint, easyPct: Number(e.target.value) || 0 })}
              />
              <input
                className="inline-input"
                title="Blueprint medium percent"
                type="number"
                min={0}
                max={100}
                value={blueprint.mediumPct}
                onChange={(e) => setBlueprint({ ...blueprint, mediumPct: Number(e.target.value) || 0 })}
              />
              <input
                className="inline-input"
                title="Blueprint hard percent"
                type="number"
                min={0}
                max={100}
                value={blueprint.hardPct}
                onChange={(e) => setBlueprint({ ...blueprint, hardPct: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          {blueprintAudit ? (
            <div className="analytics">
              <div className="metric">
                <span>Blueprint count</span>
                <strong>{blueprintAudit.total}/{blueprint.targetQuestions}</strong>
              </div>
              <div className="metric">
                <span>Easy gap</span>
                <strong>{blueprintAudit.easyGap > 0 ? "+" : ""}{blueprintAudit.easyGap}%</strong>
              </div>
              <div className="metric">
                <span>Medium gap</span>
                <strong>{blueprintAudit.mediumGap > 0 ? "+" : ""}{blueprintAudit.mediumGap}%</strong>
              </div>
              <div className="metric">
                <span>Hard gap</span>
                <strong>{blueprintAudit.hardGap > 0 ? "+" : ""}{blueprintAudit.hardGap}%</strong>
              </div>
            </div>
          ) : (
            <p className="compact-line">Select a quiz bank to run blueprint analysis.</p>
          )}

          <h3 className="mt-8">Mastery Bands</h3>
          <div className="analytics">
            <div className="metric"><span>Emerging (&lt;60)</span><strong>{masteryBands.emerging}</strong></div>
            <div className="metric"><span>Developing (60-74)</span><strong>{masteryBands.developing}</strong></div>
            <div className="metric"><span>Proficient (75-89)</span><strong>{masteryBands.proficient}</strong></div>
            <div className="metric"><span>Mastery (90+)</span><strong>{masteryBands.mastery}</strong></div>
          </div>

          <h3 className="mt-8">Item Analysis</h3>
          <ul className="list">
            {itemAnalysis.slice(0, 12).map((item) => (
              <li key={item.questionId}>
                <strong>{item.prompt}</strong>
                <div className="compact-line">Facility: {item.facility}% · Discrimination: {item.discrimination}% · Attempts: {item.attempts}</div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="compact-line">Enable instructor panel for blueprint constraints, item analysis, and mastery segmentation.</p>
      )}
    </article>
  );
}
