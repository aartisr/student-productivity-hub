import { daysUntil, type Assignment } from "../domain";

type UseCoachManagerArgs = {
  ensureSignedIn: () => boolean;
  energyLevel: number;
  availableMinutes: number;
  nextAssignment: Assignment | null;
  setTimerMode: (value: "study" | "break") => void;
  setRemainingSec: (value: number) => void;
  setTimerStatus: (value: string) => void;
  setCoachPlan: (value: string) => void;
};

export function useCoachManager(args: UseCoachManagerArgs) {
  const { ensureSignedIn, energyLevel, availableMinutes, nextAssignment, setTimerMode, setRemainingSec, setTimerStatus, setCoachPlan } = args;

  const generateCoachPlan = () => {
    if (!ensureSignedIn()) return;

    const method =
      energyLevel <= 2
        ? "Low energy protocol: 20/5 cycle + retrieval flashcards"
        : energyLevel === 3
          ? "Balanced protocol: 35/7 cycle + worked example + recall"
          : "Deep work protocol: 50/10 cycle + interleaving + practice test";

    const dueFocus = nextAssignment
      ? `${nextAssignment.title} (${nextAssignment.subject}) due in ${Math.max(daysUntil(nextAssignment.dueDate), 0)} day(s)`
      : "No urgent assignment found, use planner or revision backlog";

    const maxCycles = Math.max(1, Math.floor(availableMinutes / (energyLevel >= 4 ? 60 : energyLevel === 3 ? 42 : 25)));
    const suggestedStudyMinutes = energyLevel >= 4 ? 50 : energyLevel === 3 ? 35 : 20;
    const suggestedBreakMinutes = energyLevel >= 4 ? 10 : energyLevel === 3 ? 7 : 5;

    setTimerMode("study");
    setRemainingSec(suggestedStudyMinutes * 60);
    setTimerStatus(`Coach set timer to ${suggestedStudyMinutes}/${suggestedBreakMinutes}.`);

    setCoachPlan(
      [
        `Primary target: ${dueFocus}`,
        `Method: ${method}`,
        `Cycle count today: ${maxCycles}`,
        `First cycle plan: ${suggestedStudyMinutes} min deep work, ${suggestedBreakMinutes} min break`,
        "Evidence recipe: retrieval practice -> interleaving -> self-test reflection",
      ].join("\n"),
    );
  };

  return { generateCoachPlan };
}
