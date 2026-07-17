import type { AssessmentResult } from "@/domain/types";

export type AdaptiveDecision = {
  assignMicrolearning: boolean;
  nextDifficulty: "Foundation" | "Intermediate" | "Advanced";
  scheduleWithinDays: number;
  notifyManager: boolean;
  reason: string;
};

export const getAdaptiveDecision = (
  result: AssessmentResult,
  repeatedEscalationErrors: number,
): AdaptiveDecision => {
  const escalation = result.capabilityScores.find(
    (capability) => capability.name === "Escalation",
  )?.score;
  const needsEscalationPractice =
    (escalation ?? result.overallScore) < 60 ||
    repeatedEscalationErrors >= 2;

  return {
    assignMicrolearning: needsEscalationPractice,
    nextDifficulty:
      result.overallScore >= 85
        ? "Advanced"
        : result.overallScore >= 60
          ? "Intermediate"
          : "Foundation",
    scheduleWithinDays: needsEscalationPractice ? 1 : 3,
    notifyManager:
      needsEscalationPractice &&
      result.overallScore < 60 &&
      repeatedEscalationErrors >= 2,
    reason: needsEscalationPractice
      ? "Repeated uncertainty in escalation timing and a related policy update 5 days ago."
      : "The next case increases complexity after consistent control selection.",
  };
};
