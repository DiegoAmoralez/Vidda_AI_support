import type { AssessmentResult, LearningCase } from "@/domain/types";

type EvaluationInput = {
  learningCase: LearningCase;
  answerText: string;
  selectedActions: string[];
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const unique = <T,>(values: T[]) => [...new Set(values)];

export const evaluateCase = ({
  learningCase,
  answerText,
  selectedActions,
}: EvaluationInput): AssessmentResult => {
  const normalizedText = normalize(answerText);
  const textMatches = Object.entries(learningCase.keywords)
    .filter(([, phrases]) =>
      phrases.some((phrase) => normalizedText.includes(normalize(phrase))),
    )
    .map(([actionId]) => actionId);
  const actionIds = unique([...selectedActions, ...textMatches]);
  const chosenActions = learningCase.actions.filter((action) =>
    actionIds.includes(action.id),
  );

  const earned = chosenActions.reduce(
    (sum, action) => sum + (action.prohibited ? 0 : action.points),
    0,
  );
  const penalties = chosenActions.reduce(
    (sum, action) => sum + (action.prohibited ? action.penalty ?? 0 : 0),
    0,
  );

  const expectedChosen = learningCase.expectedSequence.filter((id) =>
    actionIds.includes(id),
  );
  const sequencePositions = expectedChosen.map((id) =>
    selectedActions.indexOf(id),
  );
  const hasSequenceIssue = sequencePositions.some(
    (position, index) =>
      position >= 0 &&
      index > 0 &&
      sequencePositions[index - 1] >= 0 &&
      position < sequencePositions[index - 1],
  );
  const sequencePenalty = hasSequenceIssue ? 8 : 0;
  const computed = Math.max(0, Math.min(100, earned + 15 - penalties - sequencePenalty));

  const isHeroCase = learningCase.id === "case-aml-cash-01";
  const escalationSelected = actionIds.includes("escalate");
  const sourceSelected = actionIds.includes("source");
  const eddSelected = actionIds.includes("edd");
  const overallScore =
    isHeroCase && sourceSelected && eddSelected && !escalationSelected
      ? 72
      : computed;

  const capabilityScores = isHeroCase
    ? [
        { name: "Risk Identification", score: actionIds.includes("history") ? 90 : 62 },
        { name: "KYC Procedure", score: eddSelected ? 82 : 56 },
        { name: "Source of Funds Verification", score: sourceSelected ? 75 : 40 },
        { name: "Escalation", score: escalationSelected ? 88 : 45 },
        { name: "Customer Communication", score: actionIds.includes("notify") ? 32 : 68 },
        { name: "Regulatory Reasoning", score: actionIds.includes("reject") ? 44 : 71 },
      ]
    : learningCase.capabilityTags.map((name, index) => ({
        name,
        score: Math.max(30, Math.min(96, overallScore + 8 - index * 7)),
      }));

  const correctActions = chosenActions
    .filter((action) => !action.prohibited)
    .map((action) => action.label);
  const missedActions = learningCase.expectedSequence
    .filter((id) => !actionIds.includes(id))
    .map(
      (id) =>
        learningCase.actions.find((action) => action.id === id)?.label ?? id,
    );
  const incorrectActions = chosenActions
    .filter((action) => action.prohibited)
    .map((action) => action.label);

  const riskLevel =
    overallScore < 50
      ? "critical"
      : overallScore < 65
        ? "high"
        : overallScore < 80
          ? "medium"
          : "low";

  return {
    overallScore,
    title:
      overallScore >= 85
        ? "Correct — controls applied in sequence"
        : overallScore >= 65
          ? "Partially correct — escalation required"
          : "Critical controls require review",
    capabilityScores,
    correctActions,
    missedActions,
    incorrectActions,
    feedback:
      overallScore >= 85
        ? "You identified the unusual activity, requested supporting evidence and escalated the case before execution."
        : "Your response identified relevant controls, but the escalation sequence requires improvement. The transaction should remain pending until Compliance completes its review.",
    riskLevel,
    aiConfidence: 0.94,
    completedAt: new Date().toISOString(),
  };
};
