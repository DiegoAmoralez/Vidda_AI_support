import { describe, expect, it } from "vitest";
import { learningCases } from "@/data/cases";
import { employees, heatmapData, policyDocuments } from "@/data/seed";
import { getAdaptiveDecision } from "@/lib/adaptive/rules";
import { evaluateCase } from "@/lib/scoring/evaluate-case";

describe("demo seed integrity", () => {
  it("contains the full NordBank demonstration scope", () => {
    expect(employees).toHaveLength(1248);
    expect(learningCases).toHaveLength(20);
    expect(policyDocuments.length).toBeGreaterThanOrEqual(7);
    expect(heatmapData).toHaveLength(9);
  });

  it("keeps each case executable and grounded", () => {
    learningCases.forEach((learningCase) => {
      expect(learningCase.actions.length).toBeGreaterThanOrEqual(6);
      expect(learningCase.expectedSequence.length).toBeGreaterThanOrEqual(5);
      expect(learningCase.policyReferences.length).toBeGreaterThanOrEqual(3);
      expect(learningCase.capabilityTags.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("assigns follow-up practice after a repeated escalation gap", () => {
    const result = evaluateCase({
      learningCase: learningCases[0],
      answerText: "Review history and request documents.",
      selectedActions: ["history", "documents"],
    });
    const decision = getAdaptiveDecision(result, 2);

    expect(decision.assignMicrolearning).toBe(true);
    expect(decision.scheduleWithinDays).toBe(1);
  });
});
