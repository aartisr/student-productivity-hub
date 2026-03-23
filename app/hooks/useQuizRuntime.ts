import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { checkQuestionCorrect, scoreQuizAttempt, type QuizAttemptScore, type QuizBank } from "../quizEngine";
import { type AppData, type QuizAttempt, type ReviewState, uid } from "../domain";

type UseQuizRuntimeArgs = {
  quizBanks: QuizBank[];
  quizReviews: ReviewState[];
  currentUser: string;
  ensureSignedIn: () => boolean;
  setStore: Dispatch<SetStateAction<AppData>>;
  setQuizStatus: (value: string) => void;
  onSelectQuizBank: (bankId: string) => void;
};

export function useQuizRuntime(args: UseQuizRuntimeArgs) {
  const { quizBanks, quizReviews, currentUser, ensureSignedIn, setStore, setQuizStatus, onSelectQuizBank } = args;

  const [quizAdaptiveMode, setQuizAdaptiveMode] = useState(true);
  const [quizSkillBand, setQuizSkillBand] = useState(3);
  const [activeQuizId, setActiveQuizId] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [activeAnswers, setActiveAnswers] = useState<Record<string, string[]>>({});
  const [activeScore, setActiveScore] = useState<QuizAttemptScore | null>(null);

  const activeQuiz = useMemo(() => quizBanks.find((bank) => bank.id === activeQuizId) || null, [quizBanks, activeQuizId]);
  const activeQuestion = activeQuiz?.questions[activeQuestionIndex] || null;

  const startQuizAttempt = (bankId: string) => {
    const bank = quizBanks.find((item) => item.id === bankId);
    if (!bank) return;
    setActiveQuizId(bank.id);
    onSelectQuizBank(bank.id);
    setActiveQuestionIndex(0);
    setActiveAnswers({});
    setActiveScore(null);
    setQuizSkillBand(3);
    setQuizStatus(`Started quiz: ${bank.title}.`);
  };

  const setSingleAnswer = (questionId: string, value: string) => {
    setActiveAnswers((prev) => ({ ...prev, [questionId]: [value] }));
  };

  const setShortAnswer = (questionId: string, value: string) => {
    setActiveAnswers((prev) => ({ ...prev, [questionId]: [value] }));
  };

  const toggleMultiAnswer = (questionId: string, value: string) => {
    setActiveAnswers((prev) => {
      const existing = prev[questionId] || [];
      const next = existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value];
      return { ...prev, [questionId]: next };
    });
  };

  const reviewKey = (quizId: string, questionId: string) => `${quizId}::${questionId}`;

  const updateReviewState = (previous: ReviewState | null, quizId: string, questionId: string, isCorrect: boolean, lastPercent: number): ReviewState => {
    const prev = previous || {
      key: reviewKey(quizId, questionId),
      quizId,
      questionId,
      dueAt: Date.now(),
      intervalDays: 1,
      ease: 2.1,
      streak: 0,
      lastPercent,
      updatedAt: Date.now(),
    };

    let streak = prev.streak;
    let ease = prev.ease;
    let intervalDays = prev.intervalDays;

    if (isCorrect) {
      streak += 1;
      ease = Math.min(2.8, ease + 0.1);
      if (streak === 1) intervalDays = 1;
      else if (streak === 2) intervalDays = 3;
      else intervalDays = Math.max(4, Math.round(intervalDays * ease));
    } else {
      streak = 0;
      ease = Math.max(1.3, ease - 0.2);
      intervalDays = 1;
    }

    return {
      ...prev,
      dueAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
      intervalDays,
      ease,
      streak,
      lastPercent,
      updatedAt: Date.now(),
    };
  };

  const goAdaptiveNext = () => {
    if (!activeQuiz || !activeQuestion) return;

    const currentAnswers = activeAnswers[activeQuestion.id] || [];
    const currentCorrect = checkQuestionCorrect(activeQuestion, currentAnswers);
    const nextSkill = Math.max(1, Math.min(5, quizSkillBand + (currentCorrect ? 1 : -1)));
    setQuizSkillBand(nextSkill);

    const answered = new Set(
      Object.entries(activeAnswers)
        .filter(([, answers]) => answers.length > 0)
        .map(([questionId]) => questionId),
    );

    answered.add(activeQuestion.id);
    const reviewMap = new Map(quizReviews.map((review) => [review.questionId, review]));

    const candidates = activeQuiz.questions
      .filter((question) => !answered.has(question.id))
      .map((question, idx) => {
        const difficulty = question.difficulty || 3;
        const difficultyPenalty = Math.abs(difficulty - nextSkill);
        const dueBonus = reviewMap.get(question.id) && (reviewMap.get(question.id)?.dueAt || 0) <= Date.now() ? -0.75 : 0;
        return {
          idx,
          question,
          score: difficultyPenalty + dueBonus,
        };
      })
      .sort((a, b) => a.score - b.score);

    if (!candidates.length) {
      setQuizStatus("Adaptive mode reached the final pending question. Submit when ready.");
      return;
    }

    const nextQuestionId = candidates[0].question.id;
    const nextIdx = activeQuiz.questions.findIndex((question) => question.id === nextQuestionId);
    if (nextIdx >= 0) {
      setActiveQuestionIndex(nextIdx);
      setQuizStatus(`Adaptive next selected with target difficulty ${nextSkill}/5.`);
    }
  };

  const submitQuizAttempt = () => {
    if (!ensureSignedIn()) return;
    if (!activeQuiz) {
      setQuizStatus("Start a quiz before submitting.");
      return;
    }

    const result = scoreQuizAttempt(activeQuiz, activeAnswers);
    const attempt: QuizAttempt = {
      id: uid(),
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      createdAt: Date.now(),
      correct: result.correct,
      total: result.total,
      percent: result.percent,
      byQuestion: result.byQuestion,
    };

    setStore((prev) => {
      const existingReviews = prev.quizReviews[currentUser] || [];
      const nextReviewMap = new Map(existingReviews.map((review) => [review.key, review]));

      for (const byQuestion of result.byQuestion) {
        const key = reviewKey(activeQuiz.id, byQuestion.questionId);
        const updated = updateReviewState(nextReviewMap.get(key) || null, activeQuiz.id, byQuestion.questionId, byQuestion.isCorrect, result.percent);
        nextReviewMap.set(key, updated);
      }

      return {
        ...prev,
        quizAttempts: {
          ...prev.quizAttempts,
          [currentUser]: [attempt, ...(prev.quizAttempts[currentUser] || [])].slice(0, 60),
        },
        quizReviews: {
          ...prev.quizReviews,
          [currentUser]: [...nextReviewMap.values()],
        },
      };
    });

    setActiveScore(result);
    setQuizStatus(`Submitted. Score ${result.correct}/${result.total} (${result.percent}%).`);
  };

  const clearActiveQuiz = () => {
    setActiveQuizId("");
    setActiveAnswers({});
    setActiveQuestionIndex(0);
    setActiveScore(null);
  };

  return {
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
  };
}
